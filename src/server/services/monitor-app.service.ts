import { AppExtendedModel } from "@/shared/model/app-extended.model";
import k3s from "../adapter/kubernetes-api.adapter";
import * as k8s from '@kubernetes/client-node';
import { V1Deployment, V1LabelSelector, V1ReplicaSet } from "@kubernetes/client-node";
import buildService from "./build.service";
import { ListUtils } from "../../shared/utils/list.utils";
import { DeploymentInfoModel, DeplyomentStatus } from "@/shared/model/deployment-info.model";
import { BuildJobStatus } from "@/shared/model/build-job";
import { ServiceException } from "@/shared/model/service.exception.model";
import { PodsInfoModel, podsInfoZodModel } from "@/shared/model/pods-info.model";
import { KubeObjectNameUtils } from "../utils/kube-object-name.utils";
import pvcService from "./pvc.service";
import ingressService from "./ingress.service";
import namespaceService from "./namespace.service";
import { Constants } from "../../shared/utils/constants";
import svcService from "./svc.service";
import { Label } from "@radix-ui/react-dropdown-menu";
import setupPodService from "./setup-services/setup-pod.service";
import clusterService from "./node.service";
import { PodsResourceInfoModel } from "@/shared/model/pods-resource-info.model";

class MonitorAppService {
    async getPodsForApp(projectId: string, appId: string): Promise<PodsResourceInfoModel> {
        const metricsClient = new k8s.Metrics(k3s.getKubeConfig());
        const podsFromApp = await setupPodService.getPodsForApp(projectId, appId);
        const topPodsRes1 = await k8s.topPods(k3s.core, metricsClient, projectId);

        const filteredTopPods = topPodsRes1.filter((topPod) =>
            podsFromApp.some((pod) => pod.podName === topPod.Pod.metadata?.name)
        );

        const nodeInfo = await clusterService.getNodeInfo();

        const nodesColumns = nodeInfo.map((node) => {
            return {
                'POD': node.name,
                'CPU(cores)': node.cpuCapacity,
                'MEMORY(bytes)': node.ramCapacity,
            };
        });

        const podsColumns = filteredTopPods.map((pod) => {
            return {
                'POD': pod.Pod.metadata?.name,
                'CPU(cores)': pod.CPU.CurrentUsage,
                'MEMORY(bytes)': pod.Memory.CurrentUsage,
            };
        });

        return {
            cpuAbsolut: '5',
            cpuPercent: '6',
            memoryAbsolut: '7',
            memoryPercent: '8',
            volumePercent: '9',
        }
    }

}

const monitorAppService = new MonitorAppService();
export default monitorAppService;
