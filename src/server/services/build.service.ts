import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment, V1Job } from "@kubernetes/client-node";

const kanikoImage = "gcr.io/kaniko-project/executor:latest";
export const registryURL = "registry-svc.registry-and-build.svc.cluster.local"
export const buildNamespace = "registry-and-build";

class BuildService {

    async buildApp(app: AppExtendedModel) {
        const jobDefinition: V1Job = {
            apiVersion: "batch/v1",
            kind: "Job",
            metadata: {
                name: `build-${app.id}`,
                namespace: buildNamespace,
            },
            spec: {
                ttlSecondsAfterFinished: 100,
                template: {
                    spec: {
                        containers: [
                            {
                                name: `build-${app.id}`,
                                image: kanikoImage,
                                args: [`--dockerfile=${app.dockerfilePath}`,
                                    `--context=${app.gitUrl!.replace("https://","git://")}#refs/heads/${app.gitBranch}`,
                                    `--destination=${registryURL}/${app.id}`]
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
        await this.waitForJobCompletion(buildNamespace, jobDefinition.metadata!.name!);
    }

    async waitForJobCompletion(namespace:string, jobName:string) {
        const POLL_INTERVAL = 10000; // 10 seconds

        return await new Promise<void>((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const jobStatus = await this.getJobStatus(namespace, jobName);
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

    async getJobStatus(namespace:string, jobName:string): Promise<'UNKNOWN' | 'RUNNING' | 'FAILED' | 'SUCCEEDED'> {
        try {
            const response = await k3s.batch.readNamespacedJobStatus(jobName, namespace);
            const job = response.body;
            if (!job.status) {
                return 'UNKNOWN';
            }
            if ((job.status.active ?? 0) > 0) {
                return 'RUNNING';
            }
            if ((job.status.succeeded?? 0) > 0) {
                return 'SUCCEEDED';
            }

            if ((job.status.failed ?? 0) > 0) {
                return 'FAILED';
            }
        } catch (err) {
            console.error(err);
        }
        return 'UNKNOWN';
    }

}

const buildService = new BuildService();
export default buildService;
