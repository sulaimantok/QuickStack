import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment, V1Ingress, V1PersistentVolumeClaim } from "@kubernetes/client-node";
import buildService from "./build.service";
import { ListUtils } from "../utils/list.utils";
import { DeploymentInfoModel, DeplyomentStatus } from "@/model/deployment-info.model";
import { BuildJobStatus } from "@/model/build-job";
import { ServiceException } from "@/model/service.exception.model";
import { PodsInfoModel } from "@/model/pods-info.model";
import { StringUtils } from "../utils/string.utils";
import pvcService from "./pvc.service";
import ingressService from "./ingress.service";
import namespaceService from "./namespace.service";

class DeploymentService {
    async getDeployment(projectId: string, appId: string) {
        const allDeployments = await k3s.apps.listNamespacedDeployment(projectId);
        if (allDeployments.body.items.some((item) => item.metadata?.name === appId)) {
            const res = await k3s.apps.readNamespacedDeployment(appId, projectId);
            return res.body;
        }
    }

    async deleteDeployment(projectId: string, appId: string) {
        const existingDeployment = await this.getDeployment(projectId, appId);
        if (!existingDeployment) {
            return;
        }
        return k3s.apps.deleteNamespacedDeployment(appId, projectId);
    }

    async deleteService(projectId: string, appId: string) {
        const existingService = await this.getService(projectId, appId);
        if (!existingService) {
            return;
        }
        return k3s.core.deleteNamespacedService(StringUtils.toServiceName(appId), projectId);
    }


    async getService(projectId: string, appId: string) {
        const allServices = await k3s.core.listNamespacedService(projectId);
        if (allServices.body.items.some((item) => item.metadata?.name === StringUtils.toServiceName(appId))) {
            const res = await k3s.core.readNamespacedService(StringUtils.toServiceName(appId), projectId);
            return res.body;
        }
    }

    async createOrUpdateService(app: AppExtendedModel) {
        const existingService = await this.getService(app.projectId, app.id);
        // port configuration with removed duplicates
        const ports: {
            name: string;
            port: number;
            targetPort: number;
        }[] = [
            ...app.appDomains.map((domain) => ({
                name: `custom-${domain.id}`,
                port: domain.port,
                targetPort: domain.port
            })),
            {
                name: 'default',
                port: app.defaultPort,
                targetPort: app.defaultPort
            }
        ].filter((port, index, self) =>
            index === self.findIndex((t) => (t.port === port.port && t.targetPort === port.targetPort)));

        const body = {
            metadata: {
                name: StringUtils.toServiceName(app.id)
            },
            spec: {
                selector: {
                    app: app.id
                },
                ports: ports
            }
        };
        if (existingService) {
            await k3s.core.replaceNamespacedService(StringUtils.toServiceName(app.id), app.projectId, body);
        } else {
            await k3s.core.createNamespacedService(app.projectId, body);
        }

    }

    async validateDeployment(app: AppExtendedModel) {
        if (app.replicas > 1 && app.appVolumes.every(vol => vol.accessMode === 'ReadWriteOnce')) {
            throw new ServiceException("Deployment with more than one replica is not possible if access mode of one volume is ReadWriteOnce.");
        }
    }

    async createDeployment(app: AppExtendedModel, buildJobName?: string) {
        await this.validateDeployment(app);
        await namespaceService.createNamespaceIfNotExists(app.projectId);
        const appHasPvcChanges = await pvcService.doesAppConfigurationIncreaseAnyPvcSize(app)
        if (appHasPvcChanges) {
            await this.setReplicasForDeployment(app.projectId, app.id, 0); // update of PVCs is only possible if deployment is scaled down
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        const { volumes, volumeMounts } = await pvcService.createOrUpdatePvc(app);

        const envVars = app.envVars ? app.envVars.split('\n').filter(x => !!x).map(env => {
            const [name] = env.split('=');
            const value = env.replace(`${name}=`, '');
            return { name, value };
        }) : [];

        const existingDeployment = await this.getDeployment(app.projectId, app.id);
        const body: V1Deployment = {
            metadata: {
                name: app.id,
            },
            spec: {
                replicas: app.replicas,
                selector: {
                    matchLabels: {
                        app: app.id
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: app.id
                        },
                        annotations: {
                            deploymentTimestamp: new Date().getTime() + "",
                            "kubernetes.io/change-cause": `Deployment ${new Date().toISOString()}`
                        }
                    },
                    spec: {
                        containers: [
                            {
                                name: app.id,
                                image: !!buildJobName ? buildService.createContainerRegistryUrlForAppId(app.id) : app.containerImageSource as string,
                                imagePullPolicy: 'Always',
                                ...(envVars.length > 0 ? { env: envVars } : {}),
                                ...(volumeMounts.length > 0 ? { volumeMounts: volumeMounts } : {}),
                            }
                        ],
                        ...(volumes.length > 0 ? { volumes: volumes } : {}),
                    }
                }
            }
        };
        if (buildJobName) {
            body.spec!.template!.metadata!.annotations!.buildJobName = buildJobName; // add buildJobName to deployment
        }

        if (!appHasPvcChanges && app.appVolumes.length === 0 || app.appVolumes.every(vol => vol.accessMode === 'ReadWriteMany')) {
            body.spec!.strategy = {
                type: 'RollingUpdate',
                rollingUpdate: {
                    maxSurge: 1,
                    maxUnavailable: 0
                }
            }
        } else {
            body.spec!.strategy = {
                type: 'Recreate',
            }
        }

        if (existingDeployment) {
            const res = await k3s.apps.replaceNamespacedDeployment(app.id, app.projectId, body);
        } else {
            const res = await k3s.apps.createNamespacedDeployment(app.projectId, body);
        }
        await pvcService.deleteUnusedPvcOfApp(app);
        await this.createOrUpdateService(app);
        await ingressService.createOrUpdateIngressForApp(app);
    }

    async setReplicasForDeployment(projectId: string, appId: string, replicas: number) {
        const existingDeployment = await this.getDeployment(projectId, appId);
        if (!existingDeployment) {
            throw new ServiceException("This app has not been deployed yet. Please deploy it first.");
        }
        existingDeployment.spec!.replicas = replicas;
        return k3s.apps.replaceNamespacedDeployment(appId, projectId, existingDeployment);
    }

    async getPodsForApp(projectId: string, appId: string) {
        const res = await k3s.core.listNamespacedPod(projectId, undefined, undefined, undefined, undefined, `app=${appId}`);
        return res.body.items.map((item) => ({
            podName: item.metadata?.name!,
            containerName: item.spec?.containers?.[0].name!
        })).filter((item) => !!item.podName && !!item.containerName) as PodsInfoModel[];
    }

    async getPodByName(projectId: string, podName: string) {
        const res = await k3s.core.readNamespacedPod(podName, projectId);
        return {
            podName: res.body.metadata?.name!,
            containerName: res.body.spec?.containers?.[0].name!
        } as PodsInfoModel;
    }


    /**
     * Searches for Build Jobs (only for Git Projects) and ReplicaSets (for all projects) and returns a list of DeploymentModel
     * Build are only included if they are in status RUNNING, FAILED or UNKNOWN. SUCCESSFUL builds are not included because they are already part of the ReplicaSet history.
     * @param projectId
     * @param appId
     * @returns
     */
    async getDeploymentHistory(projectId: string, appId: string): Promise<DeploymentInfoModel[]> {
        const replicasetRevisions = await this.getReplicasetRevisionHistory(projectId, appId);
        const builds = await buildService.getBuildsForApp(appId);
        const runningOrFailedBuilds = builds
            .filter((build) => ['RUNNING', 'FAILED', 'UNKNOWN'].includes(build.status))
            .map((build) => {
                return {
                    replicasetName: undefined,
                    createdAt: build.startTime!,
                    buildJobName: build.name!,
                    status: this.mapBuildStatusToDeploymentStatus(build.status)
                }
            });
        replicasetRevisions.push(...runningOrFailedBuilds);
        return ListUtils.sortByDate(replicasetRevisions, (i) => i.createdAt!, true);
    }

    mapBuildStatusToDeploymentStatus(buildJobStatus?: BuildJobStatus) {
        const map = new Map<BuildJobStatus, DeplyomentStatus>([
            ['UNKNOWN', 'UNKNOWN'],
            ['RUNNING', 'BUILDING'],
            ['FAILED', 'ERROR']
        ]);
        return map.get(buildJobStatus ?? 'UNKNOWN') ?? 'UNKNOWN';
    }


    async getReplicasetRevisionHistory(projectId: string, appId: string): Promise<DeploymentInfoModel[]> {

        const deployment = await this.getDeployment(projectId, appId);
        if (!deployment) {
            return [];
        }

        // List ReplicaSets in the namespace to find those associated with the deployment
        const replicaSetsForDeployment = await k3s.apps.listNamespacedReplicaSet(projectId, undefined, undefined, undefined, undefined, `app=${appId}`);

        const revisions = replicaSetsForDeployment.body.items.map((rs, index) => {

            let status = 'UNKNOWN' as DeplyomentStatus;
            if (rs.status?.replicas === 0) {
                status = 'SHUTDOWN';
            } else if (rs.status?.replicas === rs.status?.readyReplicas) {
                status = 'DEPLOYED';
            } else if (rs.status?.replicas !== rs.status?.readyReplicas) {
                status = 'DEPLOYING';
            }
            /*
            Fields for Status:
                availableReplicas: 1,
                conditions: undefined,
                fullyLabeledReplicas: 1,
                observedGeneration: 3,
                readyReplicas: 1,
                replicas: 1
            */
            return {
                replicasetName: rs.metadata?.name!,
                createdAt: rs.metadata?.creationTimestamp!,
                buildJobName: rs.metadata?.annotations?.buildJobName!,
                status: status
            }
        });
        return ListUtils.sortByDate(revisions, (i) => i.createdAt!, true);
    }



}

const deploymentService = new DeploymentService();
export default deploymentService;
