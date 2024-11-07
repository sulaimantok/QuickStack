import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import {  V1Ingress, V1PersistentVolumeClaim } from "@kubernetes/client-node";
import { StringUtils } from "../utils/string.utils";

class IngressService {

    async getAllIngressForApp(projectId: string, appId: string) {
        const res = await k3s.network.listNamespacedIngress(projectId);
        return res.body.items.filter((item) => item.metadata?.name?.startsWith(`ingress-${appId}`));
    }

    async getIngress(projectId: string, appId: string, domainId: string) {
        const res = await k3s.network.listNamespacedIngress(projectId);
        return res.body.items.find((item) => item.metadata?.name === `ingress-${appId}-${domainId}`);
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

    async createOrUpdateIngress(app: AppExtendedModel) {
        for (const domainObj of app.appDomains) {
            const domain = domainObj.hostname;
            const ingressName = `ingress-${app.id}-${domainObj.id}`;

            const existingIngress = await this.getIngress(app.projectId, app.id, domainObj.id);

            const ingressDefinition: V1Ingress = {
                apiVersion: 'networking.k8s.io/v1',
                kind: 'Ingress',
                metadata: {
                    name: ingressName,
                    namespace: app.projectId,
                    annotations: {
                        ...(domainObj.useSsl === true && { 'cert-manager.io/cluster-issuer': 'letsencrypt-production' }),
                    },
                },
                spec: {
                    ingressClassName: 'traefik',
                    rules: [
                        {
                            host: domain,
                            http: {
                                paths: [
                                    {
                                        path: '/',
                                        pathType: 'Prefix',
                                        backend: {
                                            service: {
                                                name: StringUtils.toServiceName(app.id),
                                                port: {
                                                    number: app.defaultPort,
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                    ...(domainObj.useSsl === true && {
                        tls: [
                            {
                                hosts: [domain],
                                secretName: `secret-tls-${app.id}-${domainObj.id}`,
                            },
                        ],
                    }),
                },
            };

            if (existingIngress) {
                await k3s.network.replaceNamespacedIngress(ingressName, app.projectId, ingressDefinition);
                console.log(`Ingress ${ingressName} für Domain ${domain} erfolgreich aktualisiert.`);
            } else {
                await k3s.network.createNamespacedIngress(app.projectId, ingressDefinition);
                console.log(`Ingress ${ingressName} für Domain ${domain} erfolgreich erstellt.`);
            }
        }

        await this.deleteObsoleteIngresses(app);
    }

}

const ingressService = new IngressService();
export default ingressService;
