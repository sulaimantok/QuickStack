import k3s from "../adapter/kubernetes-api.adapter";
import * as k8s from '@kubernetes/client-node';
import setupPodService from "./setup-services/setup-pod.service";
import clusterService from "./node.service";
import { PodsResourceInfoModel } from "@/shared/model/pods-resource-info.model";

class MonitorAppService {
    async getPodsForApp(projectId: string, appId: string): Promise<PodsResourceInfoModel> {
        const metricsClient = new k8s.Metrics(k3s.getKubeConfig());
        const podsFromApp = await setupPodService.getPodsForApp(projectId, appId);
        const topPods = await k8s.topPods(k3s.core, metricsClient, projectId);

        const filteredTopPods = topPods.filter((topPod) =>
            podsFromApp.some((pod) => pod.podName === topPod.Pod.metadata?.name)
        );

        const topNodes = await clusterService.getNodeInfo();

        const totalResourcesNodes = topNodes.reduce(
            (acc, node) => {
                acc.cpu += Number(node.cpuCapacity) || 0;
                acc.ram += parseFloat(node.ramCapacity.replace('Ki','')) || 0;
                return acc;
            },
            { cpu: 0, ram: 0 }
        );

        const totalResourcesApp = filteredTopPods.reduce(
            (acc, pod) => {
                acc.cpu += Number(pod.CPU.CurrentUsage) || 0;
                acc.ram += Number(pod.Memory.CurrentUsage) || 0;
                return acc;
            },
            { cpu: 0, ram: 0 }
        );


        var totalRamNodesCorrectUnit: number = totalResourcesNodes.ram / 1024; //von KB in MB umrechnen
        var totalRamAppCorrectUnit: number = totalResourcesApp.ram / (1024 * 1024);  //von Byte in MB umrechnen


        const appCpuUsagePercent = ((totalResourcesApp.cpu / totalResourcesNodes.cpu) * 100);
        const appRamUsagePercent = ((totalRamAppCorrectUnit / totalRamNodesCorrectUnit) * 100);

        return {
            cpuPercent: appCpuUsagePercent,
            cpuAbsolut: totalResourcesApp.cpu,
            ramPercent: appRamUsagePercent,
            ramAbsolut: totalRamAppCorrectUnit
        }
    }

}

const monitorAppService = new MonitorAppService();
export default monitorAppService;
