'use client'

import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import PageTitle from "@/components/custom/page-title";
import userService from "@/server/services/user.service";
import clusterService from "@/server/services/node.service";
import { NodeInfoModel } from "@/model/node-info.model";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NodeInfo({ nodeInfos }: { nodeInfos: NodeInfoModel[] }) {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cluster Info</CardTitle>
                <CardDescription>Overview of all nodes and capacities in the cluster.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {nodeInfos.map((nodeInfo, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold text-xl text-center">Node {index + 1}
                            <span className={nodeInfo.status ? 'text-green-400' : 'text-red-400'}> ({nodeInfo.status ? 'online' : 'offline'})</span>
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Name:</span> {nodeInfo.name}
                            </div>
                            <div>
                                <span className="font-semibold">IP:</span> {nodeInfo.ip}
                            </div>
                            <div>
                                <span className="font-semibold">CPU Cores:</span> {nodeInfo.cpuCapacity}
                            </div>
                            <div>
                                <span className="font-semibold">Memory:</span> {nodeInfo.ramCapacity}
                            </div>
                            <div>
                                <span className="font-semibold">OS:</span> {nodeInfo.os}
                            </div>
                            <div>
                                <span className="font-semibold">Architektur:</span> {nodeInfo.architecture}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card >
    )
}
