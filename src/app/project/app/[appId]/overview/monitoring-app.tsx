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

export default function MonitoringTab({
    app
}: {
    app: AppExtendedModel;
}) {

    const updateValues = async () => {
        try {
            const response = await getRessourceDataApp(app.projectId, app.id.split('-').slice(0, 3).join('-'));
            if (response.status === 'success' && response.data) {
                console.log(response.data);
            } else {
                console.error(response);
                console.log(response.message ?? 'An unknown error occurred.');
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    useEffect(() => {
        if (app.sourceType === 'container') {
            return;
        }
        updateValues();
        const intervalId = setInterval(updateValues, 10000);
        return () => clearInterval(intervalId);
    }, [app]);


    if (app.sourceType === 'container') {
        return <></>;
    }

    return <>
        <Card>
            <CardHeader>
                <CardTitle>App Monitoring</CardTitle>
                <CardDescription>This is an overview about the resources the app is consuming.</CardDescription>
            </CardHeader>
        </Card>
    </>;
}
