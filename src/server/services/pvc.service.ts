import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import {  V1PersistentVolumeClaim } from "@kubernetes/client-node";

class PvcService {

    async doesAppConfigurationIncreaseAnyPvcSize(app: AppExtendedModel) {
        const existingPvcs = await this.getAllPvcForApp(app.projectId, app.id);

        for (const appVolume of app.appVolumes) {
            const pvcName = `pvc-${app.id}-${appVolume.id}`;
            const existingPvc = existingPvcs.find(pvc => pvc.metadata?.name === pvcName);
            if (existingPvc && existingPvc.spec!.resources!.requests!.storage !== `${appVolume.size}Gi`) {
                return true;
            }
        }

        return false;
    }

    async getAllPvcForApp(projectId: string, appId: string) {
        const res = await k3s.core.listNamespacedPersistentVolumeClaim(projectId);
        return res.body.items.filter((item) => item.metadata?.annotations?.['qs-app-id'] === appId);
    }

    async deleteUnusedPvcOfApp(app: AppExtendedModel) {
        const existingPvc = await this.getAllPvcForApp(app.projectId, app.id);

        for (const pvc of existingPvc) {
            if (app.appVolumes.some(appVolumeSetting => appVolumeSetting.id === pvc.metadata?.annotations?.['qs-app-volume-id'])) {
                continue;
            }

            await k3s.core.deleteNamespacedPersistentVolumeClaim(pvc.metadata!.name!, app.projectId);
            console.log(`Deleted PVC ${pvc.metadata!.name!} for app ${app.id}`);
        }
    }

    async createOrUpdatePvc(app: AppExtendedModel) {
        const existingPvcs = await this.getAllPvcForApp(app.projectId, app.id);

        for (const appVolume of app.appVolumes) {
            const pvcName = `pvc-${app.id}-${appVolume.id}`;

            const pvcDefinition: V1PersistentVolumeClaim = {
                apiVersion: 'v1',
                kind: 'PersistentVolumeClaim',
                metadata: {
                    name: pvcName,
                    namespace: app.projectId,
                    annotations: {
                        'qs-app-id': app.id,
                        'qs-app-volume-id': appVolume.id,
                    }
                },
                spec: {
                    accessModes: [appVolume.accessMode],
                    storageClassName: 'longhorn',
                    resources: {
                        requests: {
                            storage: `${appVolume.size}Gi`,
                        },
                    },
                },
            };

            const existingPvc = existingPvcs.find(pvc => pvc.metadata?.name === pvcName);
            if (existingPvc) {
                if (existingPvc.spec!.resources!.requests!.storage === `${appVolume.size}Gi`) {
                    console.log(`PVC ${pvcName} for app ${app.id} already exists with the same size`);
                    continue;
                }
                // Only the Size of PVC can be updated, so we need to delete and recreate the PVC
                // update PVC size
                existingPvc.spec!.resources!.requests!.storage = `${appVolume.size}Gi`;
                await k3s.core.replaceNamespacedPersistentVolumeClaim(pvcName, app.projectId, existingPvc);
                console.log(`Updated PVC ${pvcName} for app ${app.id}`);

            } else {
                await k3s.core.createNamespacedPersistentVolumeClaim(app.projectId, pvcDefinition);
                console.log(`Created PVC ${pvcName} for app ${app.id}`);
            }
        }

        const volumes = app.appVolumes
            .filter(pvcObj => pvcObj.appId === app.id)
            .map(pvcObj => ({
                name: `pvc-${app.id}-${pvcObj.id}`,
                persistentVolumeClaim: {
                    claimName: `pvc-${app.id}-${pvcObj.id}`,
                },
            }));

        const volumeMounts = app.appVolumes
            .filter(pvcObj => pvcObj.appId === app.id)
            .map(pvcObj => ({
                name: `pvc-${app.id}-${pvcObj.id}`,
                mountPath: pvcObj.containerMountPath,
            }));

        return { volumes, volumeMounts };
    }
}

const pvcService = new PvcService();
export default pvcService;
