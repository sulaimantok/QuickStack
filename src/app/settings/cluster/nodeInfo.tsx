'use client'

import { NodeInfoModel } from "@/model/node-info.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "@/components/custom/code";

export default async function NodeInfo({ nodeInfos }: { nodeInfos: NodeInfoModel[] }) {

    return (

        <Card>
            <CardHeader>
                <CardTitle>Nodes</CardTitle>
                <CardDescription>Overview of all Nodes in your CLuster</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {nodeInfos.map((nodeInfo, index) => (
                        <div key={index} className="space-y-4 rounded-lg border">
                            <h3 className={(nodeInfo.status ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700') + ' p-4 rounded-t-lg font-semibold text-xl text-center'}>
                                Node {index + 1}
                            </h3>
                            <div className="space-y-2 px-4 pb-4">
                                <div>
                                    <span className="font-semibold">Name:</span> <Code>{nodeInfo.name}</Code>
                                </div>
                                <div>
                                    <span className="font-semibold">IP:</span> <Code>{nodeInfo.ip}</Code>
                                </div>
                                <div>
                                    <span className="font-semibold">CPU Cores:</span> {nodeInfo.cpuCapacity}
                                </div>
                                <div>
                                    <span className="font-semibold">Memory:</span> {nodeInfo.ramCapacity}
                                </div>
                                <div>
                                    <span className="font-semibold">OS:</span> {nodeInfo.os} |  {nodeInfo.architecture}
                                </div>
                                <div>
                                </div>
                                <div>
                                </div>
                                <div>
                                </div>
                                <div className="text-xs text-slate-500">
                                    <span className="font-semibold">Kernel Version:</span> {nodeInfo.kernelVersion}<br />
                                    <span className="font-semibold">Container Runtime Version:</span> {nodeInfo.containerRuntimeVersion}<br />
                                    <span className="font-semibold">Kube Proxy Version:</span> {nodeInfo.kubeProxyVersion}<br />
                                    <span className="font-semibold">Kubelet Version:</span> {nodeInfo.kubeletVersion}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
