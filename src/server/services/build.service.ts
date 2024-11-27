import { AppExtendedModel } from "@/shared/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Job, V1JobStatus } from "@kubernetes/client-node";
import { KubeObjectNameUtils } from "../utils/kube-object-name.utils";
import { BuildJobModel } from "@/shared/model/build-job";
import { ServiceException } from "@/shared/model/service.exception.model";
import { PodsInfoModel } from "@/shared/model/pods-info.model";
import namespaceService from "./namespace.service";
import { Constants } from "../../shared/utils/constants";
import gitService from "./git.service";
import deploymentService from "./deployment.service";
import deploymentLogService from "./deployment-logs.service";
import podService from "./pod.service";

const kanikoImage = "gcr.io/kaniko-project/executor:latest";
const REGISTRY_NODE_PORT = 30100;
const REGISTRY_CONTAINER_PORT = 5000;
const REGISTRY_SVC_NAME = 'registry-svc';
export const BUILD_NAMESPACE = "registry-and-build";
export const REGISTRY_URL_EXTERNAL = `localhost:${REGISTRY_NODE_PORT}`;
export const REGISTRY_URL_INTERNAL = `${REGISTRY_SVC_NAME}.${BUILD_NAMESPACE}.svc.cluster.local:${REGISTRY_CONTAINER_PORT}`


class BuildService {


    async buildApp(app: AppExtendedModel, forceBuild: boolean = false): Promise<[string, string, Promise<void>]> {
        await namespaceService.createNamespaceIfNotExists(BUILD_NAMESPACE);
        await this.deployRegistryIfNotExists();
        const buildsForApp = await this.getBuildsForApp(app.id);
        if (buildsForApp.some((job) => job.status === 'RUNNING')) {
            throw new ServiceException("A build job is already running for this app.");
        }

        // Check if last build is already up to date with data in git repo
        const latestSuccessfulBuld = buildsForApp.find(x => x.status === 'SUCCEEDED');
        const latestRemoteGitHash = await gitService.getLatestRemoteCommitHash(app);
        if (!forceBuild && latestSuccessfulBuld?.gitCommit && latestRemoteGitHash &&
            latestSuccessfulBuld?.gitCommit === latestRemoteGitHash) {
            console.log(`Last build is already up to date with data in git repo for app ${app.id}`);
            // todo check if the container is still in registry
            return [latestSuccessfulBuld.name, latestRemoteGitHash, Promise.resolve()];
        }
        return await this.createAndStartBuildJob(app, latestRemoteGitHash);
    }

    private async createAndStartBuildJob(app: AppExtendedModel, latestRemoteGitHash: string): Promise<[string, string, Promise<void>]> {

        const buildName = KubeObjectNameUtils.addRandomSuffix(KubeObjectNameUtils.toJobName(app.id));
        const jobDefinition: V1Job = {
            apiVersion: "batch/v1",
            kind: "Job",
            metadata: {
                name: buildName,
                namespace: BUILD_NAMESPACE,
                annotations: {
                    [Constants.QS_ANNOTATION_APP_ID]: app.id,
                    [Constants.QS_ANNOTATION_PROJECT_ID]: app.projectId,
                    [Constants.QS_ANNOTATION_GIT_COMMIT]: latestRemoteGitHash,
                }
            },
            spec: {
                ttlSecondsAfterFinished: 2592000, // 30 days
                template: {
                    spec: {
                        containers: [
                            {
                                name: buildName,
                                image: kanikoImage,
                                args: [
                                    `--dockerfile=${app.dockerfilePath}`,
                                    `--insecure`,
                                    `--log-format=text`,
                                    `--context=${app.gitUrl!.replace("https://", "git://")}#refs/heads/${app.gitBranch}`, // todo change to shared folder
                                    `--destination=${this.createInternalContainerRegistryUrlForAppId(app.id)}`
                                ]
                            },
                        ],
                        restartPolicy: "Never",

                    },
                },
                backoffLimit: 0,
            },
        };
        if (app.gitUsername && app.gitToken) {
            jobDefinition.spec!.template.spec!.containers[0].env = [
                {
                    name: "GIT_USERNAME",
                    value: app.gitUsername
                },
                {
                    name: "GIT_PASSWORD",
                    value: app.gitToken
                }
            ];
        }
        await k3s.batch.createNamespacedJob(BUILD_NAMESPACE, jobDefinition);

        const buildJobPromise = this.waitForJobCompletion(jobDefinition.metadata!.name!)

        return [buildName, latestRemoteGitHash, buildJobPromise];
    }

    createInternalContainerRegistryUrlForAppId(appId?: string) {
        if (!appId) {
            return undefined;
        }
        return `${REGISTRY_URL_INTERNAL}/${appId}:latest`;
    }

    createContainerRegistryUrlForAppId(appId?: string) {
        if (!appId) {
            return undefined;
        }
        return `${REGISTRY_URL_EXTERNAL}/${appId}:latest`;
    }


    async deleteAllBuildsOfApp(appId: string) {
        const jobNamePrefix = KubeObjectNameUtils.toJobName(appId);
        const jobs = await k3s.batch.listNamespacedJob(BUILD_NAMESPACE);
        const jobsOfBuild = jobs.body.items.filter((job) => job.metadata?.name?.startsWith(jobNamePrefix));
        for (const job of jobsOfBuild) {
            await this.deleteBuild(job.metadata?.name!);
        }
    }

    async deleteAllBuildsOfProject(projectId: string) {
        const jobs = await k3s.batch.listNamespacedJob(BUILD_NAMESPACE);
        const jobsOfProject = jobs.body.items.filter((job) => job.metadata?.annotations?.[Constants.QS_ANNOTATION_PROJECT_ID] === projectId);
        for (const job of jobsOfProject) {
            await this.deleteBuild(job.metadata?.name!);
        }
    }

    async deleteBuild(buildName: string) {
        await k3s.batch.deleteNamespacedJob(buildName, BUILD_NAMESPACE);
        console.log(`Deleted build job ${buildName}`);
    }

    async getBuildsForApp(appId: string) {
        const jobNamePrefix = KubeObjectNameUtils.toJobName(appId);
        const jobs = await k3s.batch.listNamespacedJob(BUILD_NAMESPACE);
        const jobsOfBuild = jobs.body.items.filter((job) => job.metadata?.name?.startsWith(jobNamePrefix));
        const builds = jobsOfBuild.map((job) => {
            return {
                name: job.metadata?.name,
                startTime: job.status?.startTime,
                status: this.getJobStatusString(job.status),
                gitCommit: job.metadata?.annotations?.[Constants.QS_ANNOTATION_GIT_COMMIT],
            } as BuildJobModel;
        });
        builds.sort((a, b) => {
            if (a.startTime && b.startTime) {
                return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
            }
            return 0;
        });
        return builds;
    }


    async getPodForJob(jobName: string) {
        const res = await k3s.core.listNamespacedPod(BUILD_NAMESPACE, undefined, undefined, undefined, undefined, `job-name=${jobName}`);
        const jobs = res.body.items;
        if (jobs.length === 0) {
            throw new ServiceException(`No pod found for job ${jobName}`);
        }
        const pod = jobs[0];
        return {
            podName: pod.metadata?.name!,
            containerName: pod.spec?.containers?.[0].name!
        } as PodsInfoModel;
    }

    async waitForJobCompletion(jobName: string) {
        const POLL_INTERVAL = 10000; // 10 seconds
        return await new Promise<void>((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const jobStatus = await this.getJobStatus(jobName);
                    if (jobStatus === 'UNKNOWN') {
                        console.log(`Job ${jobName} not found.`);
                        clearInterval(intervalId);
                        reject(new Error(`Job ${jobName} not found.`));
                        return;
                    }
                    if (jobStatus === 'SUCCEEDED') {
                        clearInterval(intervalId);
                        console.log(`Job ${jobName} completed successfully.`);
                        resolve();
                    } else if (jobStatus === 'FAILED') {
                        clearInterval(intervalId);
                        console.log(`Job ${jobName} failed.`);
                        reject(new Error(`Job ${jobName} failed.`));
                    } else {
                        console.log(`Job ${jobName} is still running...`);
                    }
                } catch (err) {
                    clearInterval(intervalId);
                    reject(err);
                }
            }, POLL_INTERVAL);
        });
    }

    async getJobStatus(buildName: string): Promise<'UNKNOWN' | 'RUNNING' | 'FAILED' | 'SUCCEEDED'> {
        try {
            const response = await k3s.batch.readNamespacedJobStatus(buildName, BUILD_NAMESPACE);
            const status = response.body.status;
            return this.getJobStatusString(status);
        } catch (err) {
            console.error(err);
        }
        return 'UNKNOWN';
    }

    getJobStatusString(status?: V1JobStatus) {
        if (!status) {
            return 'UNKNOWN';
        }
        if ((status.active ?? 0) > 0) {
            return 'RUNNING';
        }
        if ((status.succeeded ?? 0) > 0) {
            return 'SUCCEEDED';
        }

        if ((status.failed ?? 0) > 0) {
            return 'FAILED';
        }
        return 'UNKNOWN';
    }


    async deployRegistryIfNotExists() {
        const deployments = await k3s.apps.listNamespacedDeployment(BUILD_NAMESPACE);
        if (deployments.body.items.length > 0) {
            return;
        }

        console.log("Deploying registry because it is not deployed...");

        // Create Namespace
        console.log("Creating namespace...");
        await namespaceService.createNamespaceIfNotExists(BUILD_NAMESPACE);

        // Create PersistentVolumeClaim
        console.log("Creating Registry PVC...");
        const pvcManifest = {
            apiVersion: 'v1',
            kind: 'PersistentVolumeClaim',
            metadata: {
                name: 'registry-data-pvc',
                namespace: BUILD_NAMESPACE,
            },
            spec: {
                accessModes: ['ReadWriteOnce'],
                storageClassName: 'longhorn',
                resources: {
                    requests: {
                        storage: '5Gi',
                    },
                },
            },
        };

        await k3s.core.createNamespacedPersistentVolumeClaim(BUILD_NAMESPACE, pvcManifest)

        // Create Deployment
        console.log("Creating Registry Deployment...");
        const deploymentManifest = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                name: 'registry',
                namespace: BUILD_NAMESPACE,
            },
            spec: {
                replicas: 1,
                strategy: {
                    type: 'Recreate',
                },
                selector: {
                    matchLabels: {
                        app: 'registry',
                    },
                },
                template: {
                    metadata: {
                        labels: {
                            app: 'registry',
                        },
                    },
                    spec: {
                        containers: [
                            {
                                name: 'registry',
                                image: 'registry:latest',
                                volumeMounts: [
                                    {
                                        name: 'registry-data-pv',
                                        mountPath: '/var/lib/registry',
                                    },
                                ],
                            },
                        ],
                        volumes: [
                            {
                                name: 'registry-data-pv',
                                persistentVolumeClaim: {
                                    claimName: 'registry-data-pvc',
                                },
                            },
                        ],
                    },
                },
            },
        };

        await k3s.apps.createNamespacedDeployment(BUILD_NAMESPACE, deploymentManifest);

        // Create Service
        console.log("Creating Registry Service...");
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: REGISTRY_SVC_NAME,
                namespace: BUILD_NAMESPACE,
            },
            spec: {
                selector: {
                    app: 'registry',
                },
                ports: [
                    {
                        nodePort: REGISTRY_NODE_PORT,
                        protocol: 'TCP',
                        port: REGISTRY_CONTAINER_PORT,
                        targetPort: REGISTRY_CONTAINER_PORT,
                    },
                ],
                type: 'NodePort',
            },
        };

        await k3s.core.createNamespacedService(BUILD_NAMESPACE, serviceManifest);

        console.log("Waiting for registry to be deployed...");
        const pods = await podService.getPodsForApp(BUILD_NAMESPACE, 'registry');
        if (pods.length === 1) {
            await podService.waitUntilPodIsRunningFailedOrSucceded(BUILD_NAMESPACE, pods[0].podName)
        }

        console.log("Registry deployed successfully.");
    }
}

const buildService = new BuildService();
export default buildService;
