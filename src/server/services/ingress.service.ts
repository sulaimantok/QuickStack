import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Ingress, V1PersistentVolumeClaim } from "@kubernetes/client-node";
import { StringUtils } from "../utils/string.utils";
import { AppDomain } from "@prisma/client";

class IngressService {

    async getAllIngressForApp(projectId: string, appId: string) {
        const res = await k3s.network.listNamespacedIngress(projectId);
        return res.body.items.filter((item) => item.metadata?.name?.startsWith(`ingress-${appId}`));
    }

    async getIngress(projectId: string, appId: string, domainId: string, redirectIngress = false) {
        const res = await k3s.network.listNamespacedIngress(projectId);
        return res.body.items.find((item) => item.metadata?.name === this.getIngressName(appId, domainId, redirectIngress));
    }

    getIngressName(appId: string, domainId: string, redirectIngress = false) {
        return `ingress-${appId}-${domainId}` + (redirectIngress ? '-redirect' : '');
    }

    async deleteObsoleteIngresses(app: AppExtendedModel) {
        const currentDomains = new Set(app.appDomains.map(domainObj => domainObj.hostname));
        const existingIngresses = await this.getAllIngressForApp(app.projectId, app.id);

        if (currentDomains.size === 0) {
            for (const ingress of existingIngresses) {
                try {
                    await k3s.network.deleteNamespacedIngress(ingress.metadata!.name!, app.projectId);
                    console.log(`Alle Ingress-Konfigurationen für die App ${app.id} erfolgreich gelöscht.`);
                } catch (error) {
                    console.error(`Fehler beim Löschen des Ingress ${ingress.metadata!.name}:`, error);
                }
            }
        } else {
            for (const ingress of existingIngresses) {
                const ingressDomain = ingress.spec?.rules?.[0]?.host;

                if (ingressDomain && !currentDomains.has(ingressDomain)) {
                    try {
                        await k3s.network.deleteNamespacedIngress(ingress.metadata!.name!, app.projectId);
                        console.log(`Ingress ${ingress.metadata!.name} für Domain ${ingressDomain} erfolgreich gelöscht.`);
                    } catch (error) {
                        console.error(`Fehler beim Löschen des Ingress ${ingress.metadata!.name} für Domain ${ingressDomain}:`, error);
                    }
                }
            }
        }
    }

    async middlewareForNamespaceAlreadyExists(namespace: string) {
        const res = await k3s.customObjects.listNamespacedCustomObject(
            'traefik.io', // group
            'v1alpha1',             // version
            namespace,              // namespace
            'middlewares'            // plural name of the custom resource
        );
        console.log(res.body);
        return (res.body as any) && (res.body as any)?.items && (res.body as any)?.items?.length > 0;
    }

    async createIfNotExistRedirectMiddlewareIngress(namespace: string) {
        if (await this.middlewareForNamespaceAlreadyExists(namespace)) {
            return;
        }

        const middlewareManifest = {
            apiVersion: 'traefik.io/v1alpha1',
            kind: 'Middleware',
            metadata: {
                name: 'redirect-to-https',
                namespace,
            },
            spec: {
                redirectScheme: {
                    scheme: 'https',
                    permanent: true,
                }
            },
        };

        await k3s.customObjects.createNamespacedCustomObject(
            'traefik.io', // group
            'v1alpha1',             // version
            namespace,              // namespace
            'middlewares',          // plural name of the custom resource
            middlewareManifest      // object manifest
        );

    }

    async createOrUpdateIngressForApp(app: AppExtendedModel) {

        await this.createIfNotExistRedirectMiddlewareIngress("kube-system");

        for (const domainObj of app.appDomains) {
            await this.createIngress(app, domainObj);
            if (domainObj.useSsl && domainObj.redirectHttps) {
                await this.createRedirectIngress(app, domainObj);
            } else {
                const redirectIngress = await this.getIngress(app.projectId, app.id, domainObj.id, true);
                if (redirectIngress) {
                    await k3s.network.deleteNamespacedIngress(redirectIngress.metadata!.name!, app.projectId);
                    console.log(`Deleted redirect-Ingress for Domain ${domainObj.hostname}.`);
                }
            }
        }

        await this.deleteObsoleteIngresses(app);
    }

    async createIngress(app: AppExtendedModel, domain: AppDomain) {
        const hostname = domain.hostname;
        const ingressName = this.getIngressName(app.id, domain.id);
        const existingIngress = await this.getIngress(app.projectId, app.id, domain.id);

        const ingressDefinition: V1Ingress = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: ingressName,
                namespace: app.projectId,
                annotations: {
                    ...(domain.useSsl === true && { 'cert-manager.io/cluster-issuer': 'letsencrypt-production' }),
                    ...(domain.useSsl === true && { 'traefik.ingress.kubernetes.io/router.tls': 'true' }),
                    ...(domain.useSsl === true && { 'traefik.ingress.kubernetes.io/router.entrypoints': 'websecure' }), // disable requests from http --> use separate ingress for redirect
                    ...(domain.useSsl === false && { 'traefik.ingress.kubernetes.io/router.entrypoints': 'web' }), // disable requests from https
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
                            secretName: `secret-tls-${app.id}-${domain.id}`,
                        },
                    ],
                }),
            },
        };

        if (existingIngress) {
            await k3s.network.replaceNamespacedIngress(ingressName, app.projectId, ingressDefinition);
            console.log(`Ingress ${ingressName} für Domain ${hostname} erfolgreich aktualisiert.`);
        } else {
            await k3s.network.createNamespacedIngress(app.projectId, ingressDefinition);
            console.log(`Ingress ${ingressName} für Domain ${hostname} erfolgreich erstellt.`);
        }
    }
    async createRedirectIngress(app: AppExtendedModel, domain: AppDomain) {

        const ingressName = this.getIngressName(app.id, domain.id, true);
        const existingRedirectIngress = await this.getIngress(app.projectId, app.id, domain.id, true);

        // https://devopsx.com/traefik-ingress-redirect-http-to-https/
        // https://aqibrahman.com/set-up-traefik-kubernetes-ingress-for-http-and-https-with-redirect-to-https
        const ingressDefinition: V1Ingress = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: ingressName,
                namespace: app.projectId,
                annotations: {
                    'traefik.ingress.kubernetes.io/router.entrypoints': 'web',
                    'traefik.ingress.kubernetes.io/router.middlewares': `kube-system-redirect-to-https@kubernetescrd`, // <namespace>-<middleware-name>@kubernetescrd
                },
            },
            spec: {
                ingressClassName: 'traefik',
                rules: [
                    {
                        host: domain.hostname,
                        http: {
                            paths: [
                                {
                                    path: '/',
                                    pathType: 'ImplementationSpecific',
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
            },
        };

        if (existingRedirectIngress) {
            await k3s.network.replaceNamespacedIngress(ingressName, app.projectId, ingressDefinition);
            console.log(`Updated redirect ingress ${ingressName} for domain ${domain.hostname}`);
        } else {
            await k3s.network.createNamespacedIngress(app.projectId, ingressDefinition);
            console.log(`Created redirect ingress ${ingressName} for domain ${domain.hostname}`);
        }
    }

}

const ingressService = new IngressService();
export default ingressService;
