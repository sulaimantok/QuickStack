'use server'

import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import PageTitle from "@/components/custom/page-title";
import clusterService from "@/server/services/node.service";
import NodeInfo from "./nodeInfo";

export default async function ClusterInfoPage() {

    const session = await getAuthUserSession();
    const nodeInfo = await clusterService.getNodeInfo();
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <NodeInfo nodeInfos={nodeInfo} />
        </div>
    )
}
