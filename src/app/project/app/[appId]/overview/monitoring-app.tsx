import { SimpleDataTable } from "@/components/custom/simple-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/frontend/utils/format.utils";
import { AppExtendedModel } from "@/shared/model/app-extended.model";
import { useEffect, useState } from "react";
import { getRessourceDataApp } from "./actions";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/frontend/states/zustand.states";
import { Toast } from "@/frontend/utils/toast.utils";
import { DeploymentInfoModel } from "@/shared/model/deployment-info.model";
import DeploymentStatusBadge from "./deployment-status-badge";
import { BuildLogsDialog } from "./build-logs-overlay";
import ShortCommitHash from "@/components/custom/short-commit-hash";
import { PodsResourceInfoModel } from "@/shared/model/pods-resource-info.model";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MonitoringTab({
    app
}: {
    app: AppExtendedModel;
}) {

    const [selectedPod, setSelectedPod] = useState<PodsResourceInfoModel | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    const updateValues = async () => {
        setError(undefined);
        try {
            const response = await getRessourceDataApp(app.projectId, app.id);
            if (response.status === 'success' && response.data) {
                setSelectedPod(response.data);

            } else {
                console.error(response);
                setError(response.message ?? 'An unknown error occurred.');
            }
        } catch (ex) {
            console.error(ex);
            setError('An unknown error occurred.');
        }
    }

    useEffect(() => {
        updateValues();
        const intervalId = setInterval(updateValues, 10000);
        return () => clearInterval(intervalId);
    }, [app]);


    if (app.sourceType === 'container') {
        return <></>;
    }

    return <>
        <Card>
            <CardContent className="pb-0">
            {!selectedPod ? <FullLoadingSpinner /> :
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>CPU %</TableHead>
                            <TableHead>CPU</TableHead>
                            <TableHead>RAM %</TableHead>
                            <TableHead>RAM</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">{selectedPod?.cpuPercent}</TableCell>
                                <TableCell className="font-medium">{selectedPod?.cpuAbsolut}</TableCell>
                                <TableCell className="font-medium">{selectedPod?.ramPercent}</TableCell>
                                <TableCell className="font-medium">{selectedPod?.ramAbsolut}</TableCell>
                            </TableRow>
                    </TableBody>
                </Table>
        }
            </CardContent>
        </Card >

    </>;
}