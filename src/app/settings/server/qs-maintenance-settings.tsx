'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateQuickstack } from "./actions";
import { Button } from "@/components/ui/button";
import { Toast } from "@/frontend/utils/toast.utils";
import { useConfirmDialog } from "@/frontend/states/zustand.states";
import { LogsDialog } from "@/components/custom/logs-overlay";
import { Constants } from "@/shared/utils/constants";

export default function QuickStackMaintenanceSettings({
    qsPodName
}: {
    qsPodName?: string;
}) {

    const useConfirm = useConfirmDialog();

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button variant="secondary" onClick={async () => {
                    if (await useConfirm.openDialog({
                        title: 'Update QuickStack',
                        description: 'This action will restart the QuickStack service and installs the lastest version. It may take a few minutes to complete.',
                        yesButton: "Update QuickStack",
                    })) {
                        Toast.fromAction(() => updateQuickstack());
                    }
                }}>Update QuickStack</Button>

                {qsPodName && <LogsDialog namespace={Constants.QS_NAMESPACE} podName={qsPodName}>
                    <Button variant="secondary" >Open QuickStack Logs</Button>
                </LogsDialog>}
            </CardContent>
        </Card >

    </>;
}