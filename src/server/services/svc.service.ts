import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1PersistentVolumeClaim } from "@kubernetes/client-node";
import { ServiceException } from "@/model/service.exception.model";
import { AppVolume } from "@prisma/client";
import { StringUtils } from "../utils/string.utils";
import { Constants } from "../utils/constants";

class SvcService {

    async deleteService(projectId: string, appId: string) {
        const existingService = await this.getService(projectId, appId);
        if (!existingService) {
            return;
        }
        const returnVal = await  k3s.core.deleteNamespacedService(StringUtils.toServiceName(appId), projectId);
        console.log(`Deleted Service ${StringUtils.toServiceName(appId)} in namespace ${projectId}`);
        return returnVal;
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
}

const svcService = new SvcService();
export default svcService;
