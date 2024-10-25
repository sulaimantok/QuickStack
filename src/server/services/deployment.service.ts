import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment } from "@kubernetes/client-node";

class DeploymentService {

    async getNamespaces() {
        const k3sResponse = await k3s.core.listNamespace();
        return k3sResponse.body.items.map((item) => item.metadata?.name).filter((name) => !!name);
    }

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
        return k3s.core.deleteNamespacedService(this.getServiceName(appId), projectId);
    }

    getServiceName(appId: string) {
        return `svc-${appId}`;
    }

    async getService(projectId: string, appId: string) {
        const allServices = await k3s.core.listNamespacedService(projectId);
        if (allServices.body.items.some((item) => item.metadata?.name === this.getServiceName(appId))) {
            const res = await k3s.core.readNamespacedService(this.getServiceName(appId), projectId);
            return res.body;
        }
    }

    async createOrUpdateService(app: AppExtendedModel) {
        const existingService = await this.getService(app.projectId, app.id);
        // port configuration with removed duplicates
        const ports: {
            port: number;
            targetPort: number;
        }[] = [
            ...app.appDomains.map((domain) => ({
                port: domain.port,
                targetPort: domain.port
            })),
            {
                port: app.defaultPort,
                targetPort: app.defaultPort
            }
        ].filter((port, index, self) =>
            index === self.findIndex((t) => (t.port === port.port && t.targetPort === port.targetPort)));

        const body = {
            metadata: {
                name: this.getServiceName(app.id)
            },
            spec: {
                selector: {
                    app: app.id
                },
                ports: ports
            }
        };
        if (existingService) {
            await k3s.core.replaceNamespacedService(this.getServiceName(app.id), app.projectId, body);
        } else {
            await k3s.core.createNamespacedService(app.projectId, body);
        }
    }

    async createDeployment(app: AppExtendedModel) {
        await this.createNamespaceIfNotExists(app.projectId);

        const existingDeployment = await this.getDeployment(app.projectId, app.id);
        const body: V1Deployment = {
            metadata: {
                name: app.id
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
                        }
                    },
                    spec: {
                        containers: [
                            {
                                name: app.id,
                                image: app.containerImageSource as string,
                                /*ports: [
                                    {
                                        containerPort: app.port
                                    }
                                ]*/
                            }
                        ]
                    }
                }
            }
        };
        if (existingDeployment) {
            const res = await k3s.apps.replaceNamespacedDeployment(app.id, app.projectId, body);
        } else {
            const res = await k3s.apps.createNamespacedDeployment(app.projectId, body);
        }
        await this.createOrUpdateService(app);
    }

    async createNamespaceIfNotExists(namespace: string) {
        const existingNamespaces = await this.getNamespaces();
        if (existingNamespaces.includes(namespace)) {
            return;
        }
        await k3s.core.createNamespace({
            metadata: {
                name: namespace
            }
        });
    }

    async deleteNamespace(namespace: string) {
        const nameSpaces = await this.getNamespaces();
        if (nameSpaces.includes(namespace)) {
            await k3s.core.deleteNamespace(namespace);
        }
    }
}

const deploymentService = new DeploymentService();
export default deploymentService;
