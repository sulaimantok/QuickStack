'use server'

import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import PageTitle from "@/components/custom/page-title";
import clusterService from "@/server/services/node.service";
import ResourceNodes from "./monitoring-nodes";
import { Button } from "@/components/ui/button";
import paramService, { ParamService } from "@/server/services/param.service";

export default async function ResourceNodesInfoPage() {

    const resourcesNode = await clusterService.getNodeResourceUsage();
    const session = await getAuthUserSession();
    return (
        <div className="flex-1 space-y-4 pt-6">
            <PageTitle
                title={'Nodes resources'}
                subtitle={`View all resources of the node which belongs to the QuickStack Cluster.`}>
            </PageTitle>
            <ResourceNodes resourcesNodes={resourcesNode} />
        </div>
    )
}
