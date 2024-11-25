'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateQuickstack } from "./actions";
import { Button } from "@/components/ui/button";
import { Toast } from "@/lib/toast.utils";
import { useConfirmDialog } from "@/lib/zustand.states";

export default function QuickStackMaintenanceSettings() {

    const useConfirm = useConfirmDialog();

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="secondary" onClick={async () => {
                    if (await useConfirm.openDialog({
                        title: 'Update QuickStack',
                        description: 'This action will restart the QuickStack service and installs the lastest version. It may take a few minutes to complete.',
                        yesButton: "Update QuickStack",
                    })) {
                        Toast.fromAction(() => updateQuickstack());
                    }
                }}>Update QuickStack</Button>
            </CardContent>
        </Card >

    </>;
}