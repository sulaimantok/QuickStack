import { spec } from "node:test/reporters";
import k3s from "../adapter/kubernetes-api.adapter";
import * as k8s from '@kubernetes/client-node';
import { NodeInfoModel } from "@/shared/model/node-info.model";
import { NodeResourceModel } from "@/shared/model/node-resource.model";
import { Tags } from "../utils/cache-tag-generator.utils";
import { revalidateTag, unstable_cache } from "next/cache";

class ClusterService {

    async getNodeInfo(): Promise<NodeInfoModel[]> {
        return await unstable_cache(async () => {
            const nodeReturnInfo = await k3s.core.listNode();
            return nodeReturnInfo.body.items.map((node) => {
                return {
                    name: node.metadata?.name!,
                    status: node.status?.conditions?.filter((condition) => condition.type === 'Ready')[0].status!,
                    os: node.status?.nodeInfo?.osImage!,
                    architecture: node.status?.nodeInfo?.architecture!,
                    cpuCapacity: node.status?.capacity?.cpu!,
                    ramCapacity: node.status?.capacity?.memory!,
                    ip: node.status?.addresses?.filter((address) => address.type === 'InternalIP')[0].address!,
                    kernelVersion: node.status?.nodeInfo?.kernelVersion!,
                    containerRuntimeVersion: node.status?.nodeInfo?.containerRuntimeVersion!,
                    kubeProxyVersion: node.status?.nodeInfo?.kubeProxyVersion!,
                    kubeletVersion: node.status?.nodeInfo?.kubeletVersion!,

                    memoryOk: node.status?.conditions?.filter((condition) => condition.type === 'MemoryPressure')[0].status === 'False',
                    memoryStatusText: node.status?.conditions?.filter((condition) => condition.type === 'MemoryPressure')[0].message,
                    diskOk: node.status?.conditions?.filter((condition) => condition.type === 'DiskPressure')[0].status === 'False',
                    diskStatusText: node.status?.conditions?.filter((condition) => condition.type === 'DiskPressure')[0].message,
                    pidOk: node.status?.conditions?.filter((condition) => condition.type === 'PIDPressure')[0].status === 'False',
                    pidStatusText: node.status?.conditions?.filter((condition) => condition.type === 'PIDPressure')[0].message,
                    schedulable: !node.spec?.unschedulable
                }
            });
        },
            [Tags.nodeInfos()], {
            revalidate: 10,
            tags: [Tags.nodeInfos()]
        })();
    }

    async setNodeStatus(nodeName: string, schedulable: boolean) {
        try {
            await k3s.core.patchNode(nodeName, { "spec": { "unschedulable": schedulable ? null : true } }, undefined, undefined, undefined, undefined, undefined, {
                headers: { 'Content-Type': 'application/strategic-merge-patch+json' },
            });

            if (!schedulable) {
                // delete all pods on node
                const pods = await k3s.core.listPodForAllNamespaces();
                for (const pod of pods.body.items) {
                    if (pod.spec?.nodeName === nodeName) {
                        await k3s.core.deleteNamespacedPod(pod.metadata?.name!, pod.metadata?.namespace!);
                    }
                }
            }
        } finally {
            revalidateTag(Tags.nodeInfos());
        }
    }

    async getNodeResourceUsage(): Promise<NodeResourceModel[]> {
        const topNodes = await k8s.topNodes(k3s.core);

        function calculatePercent(current: number, capacity: number): number {
            return parseFloat(((current / capacity) * 100).toFixed(2));
        }

        function bytesToMb(bytes: number): number {
            return parseFloat((bytes / (1024 * 1024)).toFixed(2));
        }

        return topNodes.map((node) => {
            return {
                name: node.Node.metadata?.name!,
                cpuUsagePercent: `${calculatePercent(Number(node.CPU?.RequestTotal!), Number(node.CPU?.Capacity!))}%`,
                cpuUsageAbsolut: `${Number(node.CPU?.RequestTotal!).toFixed(2)} cores`,
                ramUsagePercent: `${calculatePercent(bytesToMb(Number(node.Memory?.RequestTotal!)), bytesToMb(Number(node.Memory?.Capacity!)))}%`,
                ramUsageAbsolut: `${bytesToMb(Number(node.Memory?.RequestTotal!))} MB`,
                diskUsagePercent: "94%",
                diskUsageAbsolut: "117GB%",
            }});
        }
}

const clusterService = new ClusterService();
export default clusterService;
