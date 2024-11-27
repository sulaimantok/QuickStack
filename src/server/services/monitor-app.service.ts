import { AppExtendedModel } from "@/shared/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { V1Deployment, V1LabelSelector, V1ReplicaSet } from "@kubernetes/client-node";
import buildService from "./build.service";
import { ListUtils } from "../../shared/utils/list.utils";
import { DeploymentInfoModel, DeplyomentStatus } from "@/shared/model/deployment-info.model";
import { BuildJobStatus } from "@/shared/model/build-job";
import { ServiceException } from "@/shared/model/service.exception.model";
import { PodsInfoModel } from "@/shared/model/pods-info.model";
import { KubeObjectNameUtils } from "../utils/kube-object-name.utils";
import pvcService from "./pvc.service";
import ingressService from "./ingress.service";
import namespaceService from "./namespace.service";
import { Constants } from "../../shared/utils/constants";
import svcService from "./svc.service";
import { Label } from "@radix-ui/react-dropdown-menu";

class MonitorAppService {
    async getRessourceData() {
        console.log("gugus");
        return "miau";
    }

    async getPodsFromDeployment(namespace: string, deploymentName: string): Promise<void> {
        const pods = await k3s.core.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, `app=${deploymentName}`);
        console.log(namespace);
        console.log(deploymentName);
        console.log(pods.body.items);
        for (const pod of pods.body.items) {
            console.log(pod.metadata?.name);
        }

}
}

const monitorAppService = new MonitorAppService();
export default monitorAppService;
