import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Ingress } from "@kubernetes/client-node";
import { StringUtils } from "../utils/string.utils";
import { AppDomain } from "@prisma/client";
import { Constants } from "../utils/constants";


const traefikNamespace = 'kube-system';

class IngressService {

    async getAllIngressForApp(projectId: string, appId: string) {
        const res = await k3s.network.listNamespacedIngress(projectId);
        return res.body.items.filter((item) => item.metadata?.annotations?.[Constants.QS_ANNOTATION_APP_ID] === appId);
    }

    async getIngress(projectId: string, domainId: string, ) {
        const res = await k3s.network.listNamespacedIngress(projectId);
        return res.body.items.find((item) => item.metadata?.name === StringUtils.getIngressName(domainId));
    }


    async deleteObsoleteIngresses(app: AppExtendedModel) {
        const currentDomains = new Set(app.appDomains.map(domainObj => domainObj.hostname));
        const existingIngresses = await this.getAllIngressForApp(app.projectId, app.id);

        if (currentDomains.size === 0) {
            for (const ingress of existingIngresses) {
                await k3s.network.deleteNamespacedIngress(ingress.metadata!.name!, app.projectId);
                console.log(`Deleted Ingress ${ingress.metadata!.name} for app ${app.id}`);
            }
        } else {
            for (const ingress of existingIngresses) {
                const ingressDomain = ingress.spec?.rules?.[0]?.host;

                if (ingressDomain && !currentDomains.has(ingressDomain)) {
                    await k3s.network.deleteNamespacedIngress(ingress.metadata!.name!, app.projectId);
                    console.log(`Deleted Ingress ${ingress.metadata!.name} for domain ${ingressDomain}`);
                }
            }
        }
    }


    async createOrUpdateIngressForApp(app: AppExtendedModel) {

        await this.createTraefikRedirectMiddlewareIfNotExist();

        for (const domainObj of app.appDomains) {
            await this.createIngress(app, domainObj);
        }

        await this.deleteObsoleteIngresses(app);
    }

    async createIngress(app: AppExtendedModel, domain: AppDomain) {
        const hostname = domain.hostname;
        const ingressName = StringUtils.getIngressName(domain.id);
        const existingIngress = await this.getIngress(app.projectId, domain.id);

        const ingressDefinition: V1Ingress = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: ingressName,
                namespace: app.projectId,
                annotations: {
                    [Constants.QS_ANNOTATION_APP_ID]: app.id,
                    [Constants.QS_ANNOTATION_PROJECT_ID]: app.projectId,
                    ...(domain.useSsl === true && { 'cert-manager.io/cluster-issuer': 'letsencrypt-production' }),
                    ...(domain.useSsl && domain.redirectHttps && { 'traefik.ingress.kubernetes.io/router.middlewares': 'kube-system-redirect-to-https@kubernetescrd' }), // activate redirect middleware for https
                    ...(domain.useSsl === false && { 'traefik.ingress.kubernetes.io/router.entrypoints': 'web' }), // disable requests from https --> only http
                },
            },
            spec: {
                ingressClassName: 'traefik',
                rules: [
                    {
                        host: hostname,
                        http: {
                            paths: [
                                {
                                    path: '/',
                                    pathType: 'Prefix',
                                    backend: {
                                        service: {
                                            name: StringUtils.toServiceName(app.id),
                                            port: {
                                                number: domain.port,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
                ...(domain.useSsl === true && {
                    tls: [
                        {
                            hosts: [hostname],
                            secretName: `secret-tls-${domain.id}`,
                        },
                    ],
                }),
            },
        };

        if (existingIngress) {
            await k3s.network.replaceNamespacedIngress(ingressName, app.projectId, ingressDefinition);
            console.log(`Ingress ${ingressName} for domain ${hostname} successfully updated.`);
        } else {
            await k3s.network.createNamespacedIngress(app.projectId, ingressDefinition);
            console.log(`Ingress ${ingressName} for domain ${hostname} successfully created.`);
        }
    }


    async checkIfTraefikRedirectMiddlewareExists() {
        const res = await k3s.customObjects.listNamespacedCustomObject(
            'traefik.io',            // group
            'v1alpha1',              // version
            traefikNamespace,        // namespace
            'middlewares'            // plural name of the custom resource
        );
        return (res.body as any) && (res.body as any)?.items && (res.body as any)?.items?.length > 0;
    }

    async createTraefikRedirectMiddlewareIfNotExist() {
        if (await this.checkIfTraefikRedirectMiddlewareExists()) {
            return;
        }

        const middlewareManifest = {
            apiVersion: 'traefik.io/v1alpha1',
            kind: 'Middleware',
            metadata: {
                name: 'redirect-to-https',
                traefikNamespace,
            },
            spec: {
                redirectScheme: {
                    scheme: 'https',
                    permanent: true,
                }
            },
        };

        await k3s.customObjects.createNamespacedCustomObject(
            'traefik.io',           // group
            'v1alpha1',             // version
            traefikNamespace,       // namespace
            'middlewares',          // plural name of the custom resource
            middlewareManifest      // object manifest
        );

    }
}

const ingressService = new IngressService();
export default ingressService;
