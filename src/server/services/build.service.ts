import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Job, V1JobStatus } from "@kubernetes/client-node";
import { StringUtils } from "../utils/string.utils";
import { BuildJobModel } from "@/model/build-job";
import { ServiceException } from "@/model/service.exception.model";
import { PodsInfoModel } from "@/model/pods-info.model";
import namespaceService from "./namespace.service";

const kanikoImage = "gcr.io/kaniko-project/executor:latest";
export const registryURLExternal = "localhost:30100"
export const registryURLInternal = "registry-svc.registry-and-build.svc.cluster.local:5000"
export const buildNamespace = "registry-and-build";

class BuildService {

    async buildApp(app: AppExtendedModel): Promise<[string, Promise<void>]> {
        await this.deployRegistryIfNotExists();
        const runningJobsForApp = await this.getBuildsForApp(app.id);
        if (runningJobsForApp.some((job) => job.status === 'RUNNING')) {
            throw new ServiceException("A build job is already running for this app.");
        }

        const buildName = StringUtils.addRandomSuffix(StringUtils.toJobName(app.id));
        const jobDefinition: V1Job = {
            apiVersion: "batch/v1",
            kind: "Job",
            metadata: {
                name: buildName,
                namespace: buildNamespace,
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
                                    `--context=${app.gitUrl!.replace("https://", "git://")}#refs/heads/${app.gitBranch}`,
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
        await k3s.batch.createNamespacedJob(buildNamespace, jobDefinition);

        const buildJobPromise = this.waitForJobCompletion(jobDefinition.metadata!.name!)

        return [buildName, buildJobPromise];
    }

    createInternalContainerRegistryUrlForAppId(appId?: string) {
        if (!appId) {
            return undefined;
        }
        return `${registryURLInternal}/${appId}:latest`;
    }

    createContainerRegistryUrlForAppId(appId?: string) {
        if (!appId) {
            return undefined;
        }
        return `${registryURLExternal}/${appId}:latest`;
    }

    async deleteBuild(buildName: string) {
        await k3s.batch.deleteNamespacedJob(buildName, buildNamespace);
    }

    async getBuildsForApp(appId: string) {
        const jobNamePrefix = StringUtils.toJobName(appId);
        const jobs = await k3s.batch.listNamespacedJob(buildNamespace);
        const jobsOfBuild = jobs.body.items.filter((job) => job.metadata?.name?.startsWith(jobNamePrefix));
        const builds = jobsOfBuild.map((job) => {
            return {
                name: job.metadata?.name,
                startTime: job.status?.startTime,
                status: this.getJobStatusString(job.status),
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
        const res = await k3s.core.listNamespacedPod(buildNamespace, undefined, undefined, undefined, undefined, `job-name=${jobName}`);
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
            const response = await k3s.batch.readNamespacedJobStatus(buildName, buildNamespace);
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
        const deployments = await k3s.apps.listNamespacedDeployment(buildNamespace);
        if (deployments.body.items.length > 0) {
            return;
        }

        console.log("Deploying registry because it is not deployed...");

        // Create Namespace
        console.log("Creating namespace...");
        await namespaceService.createNamespaceIfNotExists(buildNamespace);

        // Create PersistentVolumeClaim
        console.log("Creating Registry PVC...");
        const pvcManifest = {
            apiVersion: 'v1',
            kind: 'PersistentVolumeClaim',
            metadata: {
                name: 'registry-data-pvc',
                namespace: buildNamespace,
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

        await k3s.core.createNamespacedPersistentVolumeClaim(buildNamespace, pvcManifest)

        // Create Deployment
        console.log("Creating Registry Deployment...");
        const deploymentManifest = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                name: 'registry',
                namespace: buildNamespace,
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

        await k3s.apps.createNamespacedDeployment(buildNamespace, deploymentManifest);

        // Create Service
        console.log("Creating Registry Service...");
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: 'registry-svc',
                namespace: buildNamespace,
            },
            spec: {
                selector: {
                    app: 'registry',
                },
                ports: [
                    {
                        nodePort: 30100,
                        protocol: 'TCP',
                        port: 5000,
                        targetPort: 5000,
                    },
                ],
                type: 'NodePort',
            },
        };

        await k3s.core.createNamespacedService(buildNamespace, serviceManifest);

        console.log("Registry deployed successfully.");
    }
}

const buildService = new BuildService();
export default buildService;
