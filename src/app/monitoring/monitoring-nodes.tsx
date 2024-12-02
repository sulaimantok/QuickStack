'use client'

import { NodeResourceModel } from "@/shared/model/node-resource.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code } from "@/components/custom/code";
import { Toast } from "@/frontend/utils/toast.utils";
import { setNodeStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs, useConfirmDialog } from "@/frontend/states/zustand.states";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect } from "react";

export default async function ResourcesNodes({ resourcesNodes }: { resourcesNodes: NodeResourceModel[] }) {

    const { setBreadcrumbs } = useBreadcrumbs();
    useEffect(() => setBreadcrumbs([
        { name: "Monitoring", url: "/monitoring" },
    ]), []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nodes Resources</CardTitle>
                <CardDescription>Overview of all Nodes in your Cluster</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>CPU %</TableHead>
                            <TableHead>CPU</TableHead>
                            <TableHead>RAM %</TableHead>
                            <TableHead>RAM</TableHead>
                            <TableHead>Disk GB</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resourcesNodes.map((node) => (
                            <TableRow>
                                <TableCell className="font-medium">{node.name}</TableCell>
                                <TableCell className="font-medium">{node.cpuUsagePercent}</TableCell>
                                <TableCell className="font-medium">{node.cpuUsageAbsolut}</TableCell>
                                <TableCell className="font-medium">{node.ramUsagePercent}</TableCell>
                                <TableCell className="font-medium">{node.ramUsageAbsolut}</TableCell>
                                <TableCell className="font-medium">{node.diskUsagePercent}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card >
    )
}
