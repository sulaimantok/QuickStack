import { ServiceException } from "@/shared/model/service.exception.model";
import dataAccess from "../adapter/db.client";
import traefikMeDomainService from "./traefik-me-domain.service";
import { KubeObjectNameUtils } from "../utils/kube-object-name.utils";
import { randomBytes } from "crypto";
import deploymentService from "./deployment.service";
import { V1Deployment, V1EnvVar, V1Ingress } from "@kubernetes/client-node";
import { Constants } from "@/shared/utils/constants";
import k3s from "../adapter/kubernetes-api.adapter";
import ingressService from "./ingress.service";
import svcService from "./svc.service";
import podService from "./pod.service";
import { AppTemplateUtils } from "../utils/app-template.utils";
import appService from "./app.service";
import { AppExtendedModel } from "@/shared/model/app-extended.model";
import { PathUtils } from "../utils/path.utils";
import { FsUtils } from "../utils/fs.utils";
import path from "path";

class DbGateService {

    async isDbGateRunning(appId: string) {
        const app = await appService.getExtendedById(appId);
        const dbGateAppName = KubeObjectNameUtils.toDbGateId(app.id);
        const projectId = app.projectId;

        const existingDeployment = await deploymentService.getDeployment(projectId, dbGateAppName);
        if (!existingDeployment) {
            return false;
        }

        const existingService = await svcService.getService(projectId, dbGateAppName);
        if (!existingService) {
            return false;
        }

        const existingIngress = await ingressService.getIngressByName(projectId, dbGateAppName);
        if (!existingIngress) {
            return false;
        }

        return true;
    }

    async downloadDbGateFilesForApp(appId: string) {

        const app = await appService.getExtendedById(appId);
        const dbGateAppName = KubeObjectNameUtils.toDbGateId(app.id);
        const pod = await podService.getPodsForApp(app.projectId, dbGateAppName);
        if (pod.length === 0) {
            throw new ServiceException(`There are no running pods for DBGate. Make sure the DB Gate is running.`);
        }
        const firstPod = pod[0];

        const continerSourcePath = '/root/.dbgate/files';
        const continerRootPath = '/root';

        await podService.runCommandInPod(app.projectId, firstPod.podName, firstPod.containerName, ['cp', '-r', continerSourcePath, continerRootPath]);

        const downloadPath = path.join(PathUtils.tempVolumeDownloadPath, dbGateAppName + '.tar.gz');
        await FsUtils.createDirIfNotExistsAsync(PathUtils.tempVolumeDownloadPath, true);
        await FsUtils.deleteDirIfExistsAsync(downloadPath, true);

        console.log(`Downloading data from pod ${firstPod.podName} ${continerRootPath} to ${downloadPath}`);
        await podService.cpFromPod(app.projectId, firstPod.podName, firstPod.containerName, continerRootPath, downloadPath, continerRootPath);

        const fileName = path.basename(downloadPath);
        return fileName;
    }

    async getLoginCredentialsForRunningDbGate(appId: string) {
        const app = await appService.getExtendedById(appId);
        const dbGateAppName = KubeObjectNameUtils.toDbGateId(app.id);
        const projectId = app.projectId;

        const isDbGateRunning = await this.isDbGateRunning(appId);
        if (!isDbGateRunning) {
            throw new ServiceException('DB Gate is not running for this database');
        }

        const existingDeployment = await deploymentService.getDeployment(projectId, dbGateAppName);
        if (!existingDeployment) {
            throw new ServiceException('DB Gate is not running for this database');
        }

        const username = existingDeployment.spec?.template.spec?.containers[0].env?.find(e => e.name === 'LOGIN')?.value;
        const password = existingDeployment.spec?.template.spec?.containers[0].env?.find(e => e.name === 'PASSWORD')?.value;

        const traefikHostname = await traefikMeDomainService.getDomainForApp(dbGateAppName);

        return { url: `https://${traefikHostname}`, username, password };
    }

    async deployDbGateForDatabase(appId: string) {
        const app = await appService.getExtendedById(appId);

        if (app.appType === 'APP') {
            throw new ServiceException('DB Gate can only be deployed for databases, not for apps');
        }

        const namespace = app.projectId;
        const dbGateAppId = KubeObjectNameUtils.toDbGateId(appId);

        console.log(`Deploying DBGate for app ${appId}`);
        const traefikHostname = await traefikMeDomainService.getDomainForApp(dbGateAppId);

        console.log(`Creating DBGate deployment for app ${appId}`);

        const randomPassword = randomBytes(15).toString('hex');
        await this.createOrUpdateDbGateDeployment(app, randomPassword);

        console.log(`Creating service for DBGate for app ${appId}`);
        await svcService.createOrUpdateService(namespace, dbGateAppId, [{
            name: 'http',
            port: 80,
            targetPort: 3000,
        }]);

        console.log(`Creating ingress for DBGate for app ${appId}`);
        await this.createOrUpdateIngress(dbGateAppId, namespace, appId, namespace, traefikHostname);

        const fileBrowserPods = await podService.getPodsForApp(namespace, dbGateAppId);
        for (const pod of fileBrowserPods) {
            await podService.waitUntilPodIsRunningFailedOrSucceded(namespace, pod.podName);
        }

        return { url: `https://${traefikHostname}`, password: randomPassword };
    }

    async deleteDbGatDeploymentForAppIfExists(appId: string) {
        const app = await dataAccess.client.app.findFirst({
            where: {
                id: appId
            }
        });

        if (!app) {
            return;
        }

        const kubeAppName = KubeObjectNameUtils.toDbGateId(appId);
        const projectId = app.projectId;

        const existingDeployment = await deploymentService.getDeployment(projectId, kubeAppName);
        if (existingDeployment) { await k3s.apps.deleteNamespacedDeployment(kubeAppName, projectId); }

        const existingService = await svcService.getService(projectId, kubeAppName);
        if (existingService) { await svcService.deleteService(projectId, kubeAppName); }

        const existingIngress = await ingressService.getIngressByName(projectId, kubeAppName);
        if (existingIngress) {
            await k3s.network.deleteNamespacedIngress(KubeObjectNameUtils.getIngressName(kubeAppName), projectId);
        }
    }

    private async createOrUpdateIngress(dbGateAppName: string, namespace: string, appId: string, projectId: string, traefikHostname: string) {
        const ingressDefinition: V1Ingress = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: KubeObjectNameUtils.getIngressName(dbGateAppName),
                namespace: namespace,
                annotations: {
                    [Constants.QS_ANNOTATION_APP_ID]: appId,
                    [Constants.QS_ANNOTATION_PROJECT_ID]: projectId,
                },
            },
            spec: {
                ingressClassName: 'traefik',
                rules: [
                    {
                        host: traefikHostname,
                        http: {
                            paths: [
                                {
                                    path: '/',
                                    pathType: 'Prefix',
                                    backend: {
                                        service: {
                                            name: KubeObjectNameUtils.toServiceName(dbGateAppName),
                                            port: {
                                                number: 80,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
                tls: [{
                    hosts: [traefikHostname],
                    secretName: Constants.TRAEFIK_ME_SECRET_NAME,
                }],
            },
        };

        const existingIngress = await ingressService.getIngressByName(projectId, dbGateAppName);
        if (existingIngress) {
            await k3s.network.replaceNamespacedIngress(KubeObjectNameUtils.getIngressName(dbGateAppName), projectId, ingressDefinition);
        } else {
            await k3s.network.createNamespacedIngress(projectId, ingressDefinition);
        }
    }

    private async createOrUpdateDbGateDeployment(app: AppExtendedModel, authPassword: string) {

        const dbGateAppName = KubeObjectNameUtils.toDbGateId(app.id);
        const projectId = app.projectId;

        const dbCredentials = AppTemplateUtils.getDatabaseModelFromApp(app);
        const connectionId = 'qsdb';
        const envVars: V1EnvVar[] = [
            { name: 'LOGIN', value: 'quickstack' },
            { name: 'PASSWORD', value: authPassword },

            { name: 'CONNECTIONS', value: connectionId },
            { name: `LABEL_${connectionId}`, value: app.name },
            { name: `SERVER_${connectionId}`, value: dbCredentials.hostname },
            { name: `USER_${connectionId}`, value: dbCredentials.username },
            { name: `PORT_${connectionId}`, value: dbCredentials.port + '' },
            { name: `PASSWORD_${connectionId}`, value: dbCredentials.password },
        ];
        if (app.appType === 'POSTGRES') {
            envVars.push(...[
                { name: `ENGINE_${connectionId}`, value: 'postgres@dbgate-plugin-postgres' },
            ]);
        } else if (app.appType === 'MYSQL') {
            envVars.push(...[
                { name: `ENGINE_${connectionId}`, value: 'mysql@dbgate-plugin-mysql' },
            ]);
        } else if (app.appType === 'MARIADB') {
            envVars.push(...[
                { name: `ENGINE_${connectionId}`, value: 'mariadb@dbgate-plugin-mysql' },
            ]);
        } else if (app.appType === 'MONGODB') {
            envVars.push(...[
                { name: `ENGINE_${connectionId}`, value: 'mongo@dbgate-plugin-mongo' },
            ]);
        } else {
            throw new ServiceException('QuickStack does not support this app type');
        }

        const body: V1Deployment = {
            metadata: {
                name: dbGateAppName
            },
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: {
                        app: dbGateAppName
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: dbGateAppName
                        },
                        annotations: {
                            [Constants.QS_ANNOTATION_APP_ID]: app.id,
                            [Constants.QS_ANNOTATION_PROJECT_ID]: projectId,
                            deploymentTimestamp: new Date().getTime() + "",
                            "kubernetes.io/change-cause": `Deployment ${new Date().toISOString()}`
                        }
                    },
                    spec: {
                        containers: [
                            {
                                name: dbGateAppName,
                                image: 'dbgate/dbgate:latest',
                                imagePullPolicy: 'Always',
                                env: envVars
                            }
                        ],
                    }
                }
            }
        };

        await deploymentService.applyDeployment(projectId, dbGateAppName, body);
    }
}

const dbGateService = new DbGateService();
export default dbGateService;