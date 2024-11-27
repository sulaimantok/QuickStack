import { AppExtendedModel } from "@/shared/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1PersistentVolumeClaim } from "@kubernetes/client-node";
import { ServiceException } from "@/shared/model/service.exception.model";
import { AppVolume } from "@prisma/client";
import { KubeObjectNameUtils } from "../utils/kube-object-name.utils";
import { Constants } from "../../shared/utils/constants";
import { MemoryCalcUtils } from "../utils/memory-caluclation.utils";

class PvcService {

    static readonly SHARED_PVC_NAME = 'qs-shared-pvc';

    async doesAppConfigurationIncreaseAnyPvcSize(app: AppExtendedModel) {
        const existingPvcs = await this.getAllPvcForApp(app.projectId, app.id);

        for (const appVolume of app.appVolumes) {
            const pvcName = KubeObjectNameUtils.toPvcName(appVolume.id);
            const existingPvc = existingPvcs.find(pvc => pvc.metadata?.name === pvcName);
            if (existingPvc && existingPvc.spec!.resources!.requests!.storage !== MemoryCalcUtils.formatSize(appVolume.size)) {
                return true;
            }
        }

        return false;
    }

    async getAllPvcForApp(projectId: string, appId: string) {
        const res = await k3s.core.listNamespacedPersistentVolumeClaim(projectId);
        return res.body.items.filter((item) => item.metadata?.annotations?.[Constants.QS_ANNOTATION_APP_ID] === appId);
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

    async deleteAllPvcOfApp(projectId: string, appId: string) {
        const existingPvc = await this.getAllPvcForApp(projectId, appId);

        for (const pvc of existingPvc) {
            await k3s.core.deleteNamespacedPersistentVolumeClaim(pvc.metadata!.name!, projectId);
            console.log(`Deleted PVC ${pvc.metadata!.name!} for app ${appId}`);
        }
    }

    async createOrUpdatePvc(app: AppExtendedModel) {
        const existingPvcs = await this.getAllPvcForApp(app.projectId, app.id);

        for (const appVolume of app.appVolumes) {
            const pvcName = KubeObjectNameUtils.toPvcName(appVolume.id);

            const pvcDefinition: V1PersistentVolumeClaim = {
                apiVersion: 'v1',
                kind: 'PersistentVolumeClaim',
                metadata: {
                    name: pvcName,
                    namespace: app.projectId,
                    annotations: {
                        [Constants.QS_ANNOTATION_APP_ID]: app.id,
                        [Constants.QS_ANNOTATION_PROJECT_ID]: app.projectId,
                        'qs-app-volume-id': appVolume.id,
                    }
                },
                spec: {
                    accessModes: [appVolume.accessMode],
                    storageClassName: 'longhorn',
                    resources: {
                        requests: {
                            storage: MemoryCalcUtils.formatSize(appVolume.size),
                        },
                    },
                },
            };

            const existingPvc = existingPvcs.find(pvc => pvc.metadata?.name === pvcName);
            if (existingPvc) {
                if (existingPvc.spec!.resources!.requests!.storage === MemoryCalcUtils.formatSize(appVolume.size)) {
                    console.log(`PVC ${pvcName} for app ${app.id} already exists with the same size`);
                    continue;
                }
                // Only the Size of PVC can be updated, so we need to delete and recreate the PVC
                // update PVC size
                existingPvc.spec!.resources!.requests!.storage = MemoryCalcUtils.formatSize(appVolume.size);
                await k3s.core.replaceNamespacedPersistentVolumeClaim(pvcName, app.projectId, existingPvc);
                console.log(`Updated PVC ${pvcName} for app ${app.id}`);

                // wait until persisten volume ist resized
                console.log(`Waiting for PV ${existingPvc.spec!.volumeName} to be resized to ${existingPvc.spec!.resources!.requests!.storage}...`);

                await this.waitUntilPvResized(existingPvc.spec!.volumeName!, appVolume.size);
                console.log(`PV ${existingPvc.spec!.volumeName} resized to ${MemoryCalcUtils.formatSize(appVolume.size)}`);
            } else {
                await k3s.core.createNamespacedPersistentVolumeClaim(app.projectId, pvcDefinition);
                console.log(`Created PVC ${pvcName} for app ${app.id}`);
            }
        }

        const volumes = app.appVolumes
            .filter(pvcObj => pvcObj.appId === app.id)
            .map(pvcObj => ({
                name: KubeObjectNameUtils.toPvcName(pvcObj.id),
                persistentVolumeClaim: {
                    claimName: KubeObjectNameUtils.toPvcName(pvcObj.id)
                },
            }));

        const volumeMounts = app.appVolumes
            .filter(pvcObj => pvcObj.appId === app.id)
            .map(pvcObj => ({
                name: KubeObjectNameUtils.toPvcName(pvcObj.id),
                mountPath: pvcObj.containerMountPath,
            }));

        return { volumes, volumeMounts };
    }

    private async waitUntilPvResized(persistentVolumeName: string, size: number) {
        let iterationCount = 0;
        let pv = await k3s.core.readPersistentVolume(persistentVolumeName);
        while (pv.body.spec!.capacity!.storage !== MemoryCalcUtils.formatSize(size)) {
            if (iterationCount > 30) {
                console.error(`Timeout: PV ${persistentVolumeName} not resized to ${MemoryCalcUtils.formatSize(size)}`);
                throw new ServiceException(`Timeout: Volume could not be resized to ${MemoryCalcUtils.formatSize(size)}`);
            }
            await new Promise(resolve => setTimeout(resolve, 3000)); // wait 5 Seconds, so that the PV is resized
            pv = await k3s.core.readPersistentVolume(persistentVolumeName);
            iterationCount++;
        }
    }
}

const pvcService = new PvcService();
export default pvcService;
