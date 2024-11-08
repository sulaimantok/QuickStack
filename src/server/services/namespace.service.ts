import { AppExtendedModel } from "@/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment, V1Ingress, V1PersistentVolumeClaim } from "@kubernetes/client-node";
import buildService from "./build.service";
import { ListUtils } from "../utils/list.utils";
import { DeploymentInfoModel, DeplyomentStatus } from "@/model/deployment-info.model";
import { BuildJobStatus } from "@/model/build-job";
import { ServiceException } from "@/model/service.exception.model";
import { PodsInfoModel } from "@/model/pods-info.model";
import { StringUtils } from "../utils/string.utils";
import pvcService from "./pvc.service";
import ingressService from "./ingress.service";

class NamespaceService {

    async getNamespaces() {
        const k3sResponse = await k3s.core.listNamespace();
        return k3sResponse.body.items.map((item) => item.metadata?.name).filter((name) => !!name);
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

const namespaceService = new NamespaceService();
export default namespaceService;
