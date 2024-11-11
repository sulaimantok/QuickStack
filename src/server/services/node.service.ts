import k3s from "../adapter/kubernetes-api.adapter";
import { NodeInfoModel } from "@/model/node-info.model";

class ClusterService {

    async getNodeInfo(): Promise<NodeInfoModel[]> {
        const nodeReturnInfo = await k3s.core.listNode();
        return nodeReturnInfo.body.items.map((node) => {
            return {
                name: node.metadata?.name!,
                status: node.status?.conditions?.filter((condition) => condition.type === 'Ready')[0].status!,
                os: node.status?.nodeInfo?.osImage!,
                architecture: node.status?.nodeInfo?.architecture!,
                cpuCapacity: node.status?.capacity?.cpu!,
                ramCapacity: node.status?.capacity?.memory!,
            }
        });
    }
}

const clusterService = new ClusterService();
export default clusterService;
