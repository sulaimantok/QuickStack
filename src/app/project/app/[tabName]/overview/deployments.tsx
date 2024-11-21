import { SimpleDataTable } from "@/components/custom/simple-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format.utils";
import { AppExtendedModel } from "@/model/app-extended.model";
import { useEffect, useState } from "react";
import { deleteBuild, getDeploymentsAndBuildsForApp } from "./actions";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/lib/zustand.states";
import { Toast } from "@/lib/toast.utils";
import { DeploymentInfoModel } from "@/model/deployment-info.model";
import DeploymentStatusBadge from "./deployment-status-badge";
import { BuildLogsDialog } from "./build-logs-overlay";
import ShortCommitHash from "@/components/custom/short-commit-hash";

export default function BuildsTab({
    app
}: {
    app: AppExtendedModel;
}) {

    const { openDialog } = useConfirmDialog();
    const [appBuilds, setAppBuilds] = useState<DeploymentInfoModel[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [selectedDeploymentForLogs, setSelectedDeploymentForLogs] = useState<DeploymentInfoModel | undefined>(undefined);

    const updateBuilds = async () => {
        setError(undefined);
        try {
            const response = await getDeploymentsAndBuildsForApp(app.id);
            if (response.status === 'success' && response.data) {
                setAppBuilds(response.data);
            } else {
                console.error(response);
                setError(response.message ?? 'An unknown error occurred.');
            }
        } catch (ex) {
            console.error(ex);
            setError('An unknown error occurred.');
        }
    }

    const deleteBuildClick = async (buildName: string) => {
        const confirm = await openDialog({
            title: "Delete Build",
            description: "The build will be stopped and removed. Are you sure you want to stop this build?",
            yesButton: "Stop & Remove Build"
        });
        if (confirm) {
            await Toast.fromAction(() => deleteBuild(buildName));
            await updateBuilds();
        }
    }

    useEffect(() => {
        if (app.sourceType === 'container') {
            return;
        }
        updateBuilds();
        const intervalId = setInterval(updateBuilds, 10000);
        return () => clearInterval(intervalId);
    }, [app]);


    if (app.sourceType === 'container') {
        return <></>;
    }

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Deployments</CardTitle>
                <CardDescription>This is an overview of the last deplyoments for this App.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!appBuilds ? <FullLoadingSpinner /> :
                    <SimpleDataTable columns={[
                        ['replicasetName', 'Deployment Name', false],
                        ['buildJobName', 'Build Job Name', false],
                        ['buildJobName', 'Build Job Name', false],
                        ['status', 'Status', true, (item) => <DeploymentStatusBadge>{item.status}</DeploymentStatusBadge>],
                        ["startTime", "Started At", true, (item) => formatDateTime(item.createdAt)],
                        ['gitCommit', 'Git Commit', true, (item) => <ShortCommitHash>{item.gitCommit}</ShortCommitHash>],
                    ]}
                        data={appBuilds}
                        hideSearchBar={true}
                        actionCol={(item) => {
                            return <>
                                <div className="flex gap-4">
                                    <div className="flex-1"></div>
                                    {item.buildJobName && <Button variant="secondary" onClick={() => setSelectedDeploymentForLogs(item)}>Show Logs</Button>}
                                    {item.buildJobName && item.status === 'BUILDING' && <Button variant="destructive" onClick={() => deleteBuildClick(item.buildJobName!)}>Stop Build</Button>}
                                </div>
                            </>
                        }}
                    />
                }
            </CardContent>
        </Card>
        <BuildLogsDialog deploymentInfo={selectedDeploymentForLogs} onClose={() => setSelectedDeploymentForLogs(undefined)} />
    </>;
}
