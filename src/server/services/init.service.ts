import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment, V1Service } from "@kubernetes/client-node";
import namespaceService from "./namespace.service";
import { StringUtils } from "../utils/string.utils";

class InitService {

    private readonly QUICKSTACK_NAMESPACE = 'quickstack';
    private readonly QUICKSTACK_DEPLOYMENT_NAME = 'quickstack';


    async initializeQuickStack() {
        await namespaceService.createNamespaceIfNotExists(this.QUICKSTACK_NAMESPACE)
        await this.deleteExistingDeployment();
        await this.createOrUpdatePvc();
        await this.createDeployment();
        await this.createOrUpdateService(true);
        console.log('QuickStack successfully initialized');
    }

    async createOrUpdateService(openNodePort = false) {
        const serviceName = StringUtils.toServiceName(this.QUICKSTACK_DEPLOYMENT_NAME);
        const body: V1Service = {
            metadata: {
                name: StringUtils.toServiceName(this.QUICKSTACK_DEPLOYMENT_NAME)
            },
            spec: {
                selector: {
                    app: this.QUICKSTACK_DEPLOYMENT_NAME
                },
                ports: [{
                    protocol: 'TCP',
                    port: 3000,
                    targetPort: 3000,
                    nodePort: openNodePort ? 3000 : undefined,
                }]
            }
        };
        const existingService = await k3s.core.readNamespacedService(serviceName, this.QUICKSTACK_NAMESPACE);
        if (existingService.body) {
            console.warn('Service already exists, updating');
            return k3s.core.replaceNamespacedService(serviceName, this.QUICKSTACK_NAMESPACE, body);
        } else {
            console.warn('Service does not exist, creating');
            return k3s.core.createNamespacedService(this.QUICKSTACK_NAMESPACE, body);
        }
    }


    private async createOrUpdatePvc() {
        const pvcName = StringUtils.toPvcName(this.QUICKSTACK_DEPLOYMENT_NAME);
        const pvc = {
            apiVersion: 'v1',
            kind: 'PersistentVolumeClaim',
            metadata: {
                name: pvcName,
                namespace: this.QUICKSTACK_NAMESPACE
            },
            spec: {
                accessModes: ['ReadWriteOnce'],
                storageClassName: 'longhorn',
                resources: {
                    requests: {
                        storage: '1Gi'
                    }
                }
            }
        };
        const existingPvc = await k3s.core.readNamespacedPersistentVolumeClaim(pvcName, this.QUICKSTACK_NAMESPACE);
        if (existingPvc.body) {
            console.warn('PVC already exists, updating');
            await k3s.core.replaceNamespacedPersistentVolumeClaim(pvcName, this.QUICKSTACK_NAMESPACE, pvc);
        } else {
            console.warn('PVC does not exist, creating');
            await k3s.core.createNamespacedPersistentVolumeClaim(this.QUICKSTACK_NAMESPACE, pvc);
        }
    }


    private async createDeployment() {
        const body: V1Deployment = {
            metadata: {
                name: this.QUICKSTACK_DEPLOYMENT_NAME,
            },
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: {
                        app: this.QUICKSTACK_DEPLOYMENT_NAME
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: this.QUICKSTACK_DEPLOYMENT_NAME
                        }
                    },
                    spec: {
                        containers: [
                            {
                                name: this.QUICKSTACK_DEPLOYMENT_NAME,
                                image: 'quickstack/quickstack:latest',
                                imagePullPolicy: 'Always',
                                volumeMounts: [{
                                    name: 'quickstack-volume',
                                    mountPath: '/app/storage'
                                }]
                            }
                        ],
                        volumes: [{
                            name: 'quickstack-volume',
                            persistentVolumeClaim: {
                                claimName: StringUtils.toPvcName(this.QUICKSTACK_DEPLOYMENT_NAME)
                            }
                        }]
                    }
                }
            }
        };
        await k3s.apps.createNamespacedDeployment(this.QUICKSTACK_NAMESPACE, body);
        console.log('Deployment created');
    }

    private async deleteExistingDeployment() {
        const existingDeployments = await k3s.apps.readNamespacedDeployment(this.QUICKSTACK_DEPLOYMENT_NAME, this.QUICKSTACK_NAMESPACE);
        const quickStackAlreadyDeployed = !!existingDeployments.body;
        if (quickStackAlreadyDeployed) {
            console.warn('QuickStack already deployed, deleting existing deployment (data wont be lost)');
            await k3s.apps.deleteNamespacedDeployment(this.QUICKSTACK_DEPLOYMENT_NAME, this.QUICKSTACK_NAMESPACE);
        }
    }
}

const initService = new InitService();
export default initService;
