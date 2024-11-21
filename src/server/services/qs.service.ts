import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment, V1Ingress, V1Service } from "@kubernetes/client-node";
import namespaceService from "./namespace.service";
import { StringUtils } from "../utils/string.utils";
import crypto from "crypto";
import paramService, { ParamService } from "./param.service";
import { ServiceException } from "@/model/service.exception.model";

class QuickStackService {

    private readonly QUICKSTACK_NAMESPACE = 'quickstack';
    private readonly QUICKSTACK_DEPLOYMENT_NAME = 'quickstack';
    private readonly QUICKSTACK_PORT_NUMBER = 3000;
    private readonly QUICKSTACK_SERVICEACCOUNT_NAME = 'qs-service-account';


    async initializeQuickStack() {
        await namespaceService.createNamespaceIfNotExists(this.QUICKSTACK_NAMESPACE)
        const nextAuthSecret = await this.deleteExistingDeployment();
        await this.createOrUpdatePvc();
        await this.createDeployment(nextAuthSecret);
        await this.createOrUpdateService(true);
        console.log('QuickStack successfully initialized');
    }

    async createOrUpdateIngress(hostname: string) {
        const ingressName = StringUtils.getIngressName(this.QUICKSTACK_NAMESPACE);
        const existingIngresses = await k3s.network.listNamespacedIngress(this.QUICKSTACK_NAMESPACE);
        const existingIngress = existingIngresses.body.items.find((item) => item.metadata?.name === ingressName);

        const ingressDefinition: V1Ingress = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: ingressName,
                namespace: this.QUICKSTACK_NAMESPACE,
                annotations: {
                    'cert-manager.io/cluster-issuer': 'letsencrypt-production',
                    'traefik.ingress.kubernetes.io/router.middlewares': 'kube-system-redirect-to-https@kubernetescrd'  // activate redirect middleware for https
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
                                            name: StringUtils.toServiceName(this.QUICKSTACK_DEPLOYMENT_NAME),
                                            port: {
                                                number: this.QUICKSTACK_PORT_NUMBER,
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
                tls: [
                    {
                        hosts: [hostname],
                        secretName: `secret-tls-${hostname}`,
                    },
                ],
            },
        };

        if (existingIngress) {
            await k3s.network.replaceNamespacedIngress(ingressName, this.QUICKSTACK_NAMESPACE, ingressDefinition);
            console.log(`Ingress QuickStack for domain ${hostname} successfully updated.`);
        } else {
            await k3s.network.createNamespacedIngress(this.QUICKSTACK_NAMESPACE, ingressDefinition);
            console.log(`Ingress QuickStack for domain ${hostname} successfully created.`);
        }
    }

    async createOrUpdateCertIssuer(letsencryptMail: string) {
        const issuerName = 'letsencrypt-production';
        const issuerDefinition = {
            apiVersion: 'cert-manager.io/v1',
            kind: 'ClusterIssuer',
            metadata: {
                name: issuerName,
                namespace: 'default'
            },
            spec: {
                acme: {
                    email: letsencryptMail,
                    server: 'https://acme-v02.api.letsencrypt.org/directory',
                    privateKeySecretRef: {
                        name: 'letsencrypt-production'
                    },
                    solvers: [
                        {
                            http01: {
                                ingress: {
                                    class: 'traefik'
                                }
                            }
                        }
                    ]
                }
            }
        };
        // todo
       /* const allIssuers = await k3s.network.clus();
        const existingIssuer = allIssuers.body.items.find(i => i.metadata!.name === issuerName);
        if (existingIssuer) {
            await k3s.certManager.replaceClusterIssuer(issuerName, issuerDefinition);
            console.log('Cert Issuer updated');
        } else {
            await k3s.certManager.createClusterIssuer(issuerDefinition);
            console.log('Cert Issuer created');*/
    }

    async createOrUpdateService(openNodePort = false) {
        const serviceName = StringUtils.toServiceName(this.QUICKSTACK_DEPLOYMENT_NAME);
        const body: V1Service = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: serviceName,
                namespace: this.QUICKSTACK_NAMESPACE,
            },
            spec: {
                selector: {
                    app: this.QUICKSTACK_DEPLOYMENT_NAME
                },
                ports: [
                    {
                        protocol: 'TCP',
                        port: this.QUICKSTACK_PORT_NUMBER,
                        targetPort: this.QUICKSTACK_PORT_NUMBER,
                        nodePort: openNodePort ? 30000 : undefined,
                    }
                ],
                type: openNodePort ? 'NodePort' : undefined
            }
        };

        const allServices = await k3s.core.listNamespacedService(this.QUICKSTACK_NAMESPACE);
        const existingService = allServices.body.items.find(s => s.metadata!.name === serviceName);
        if (existingService) {
            console.warn('Service already exists, deleting and recreating it');
            await k3s.core.deleteNamespacedService(serviceName, this.QUICKSTACK_NAMESPACE);
            console.log('Existing service deleted');
        } else {
            console.warn('Service does not exist, creating');
        }
        await k3s.core.createNamespacedService(this.QUICKSTACK_NAMESPACE, body);
        console.log('Service created');

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
        const allPvcs = await k3s.core.listNamespacedPersistentVolumeClaim(this.QUICKSTACK_NAMESPACE);
        const existingPvc = allPvcs.body.items.find(p => p.metadata!.name === pvcName);
        if (existingPvc) {
            if (existingPvc.spec!.resources!.requests!.storage === pvc.spec!.resources!.requests!.storage) {
                console.log(`PVC already exists with the same size, no changes`);
                return;
            }
            console.warn('PVC already exists, updating size');
            // Only the Size of PVC can be updated, so we need to delete and recreate the PVC
            // update PVC size
            existingPvc.spec!.resources!.requests!.storage = pvc.spec!.resources!.requests!.storage;
            await k3s.core.replaceNamespacedPersistentVolumeClaim(pvcName, this.QUICKSTACK_NAMESPACE, existingPvc);
            console.log('PVC updated');
        } else {
            console.warn('PVC does not exist, creating');
            await k3s.core.createNamespacedPersistentVolumeClaim(this.QUICKSTACK_NAMESPACE, pvc);
            console.log('PVC created');
        }
    }


    private async createDeployment(existingNextAuthSecret?: string) {
        const generatedNextAuthSecret = crypto.randomBytes(32).toString('base64');
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
                        serviceAccountName: this.QUICKSTACK_SERVICEACCOUNT_NAME,
                        securityContext: {
                            runAsUser: 1001,
                            runAsGroup: 1001,
                            fsGroup: 1001
                        },
                        containers: [
                            {
                                name: this.QUICKSTACK_DEPLOYMENT_NAME,
                                image: 'quickstack/quickstack:latest',
                                imagePullPolicy: 'Always',
                                env: [
                                    {
                                        name: 'NEXTAUTH_SECRET',
                                        value: existingNextAuthSecret || generatedNextAuthSecret
                                    }
                                ],
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

    /**
     * @returns: the existing NEXTAUTH_SECRET if the deployment already exists
     */
    private async deleteExistingDeployment() {
        const allDeployments = await k3s.apps.listNamespacedDeployment(this.QUICKSTACK_NAMESPACE);
        const existingDeployments = allDeployments.body.items.find(d => d.metadata!.name === this.QUICKSTACK_DEPLOYMENT_NAME);
        const quickStackAlreadyDeployed = !!existingDeployments;
        if (quickStackAlreadyDeployed) {
            console.warn('QuickStack already deployed, deleting existing deployment (data wont be lost)');
            await k3s.apps.deleteNamespacedDeployment(this.QUICKSTACK_DEPLOYMENT_NAME, this.QUICKSTACK_NAMESPACE);
            console.log('Existing deployment deleted');
        }
        return existingDeployments?.spec?.template?.spec?.containers?.[0].env?.find(e => e.name === 'NEXTAUTH_SECRET')?.value;
    }
}

const quickStackService = new QuickStackService();
export default quickStackService;
