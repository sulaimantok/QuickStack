import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/shared/model/app-extended.model";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/frontend/states/zustand.states";
import { Toast } from "@/frontend/utils/toast.utils";
import { Actions } from "@/frontend/utils/nextjs-actions.utils";
import { deleteDbGatDeploymentForAppIfExists, deployDbGate, getIsDbGateActive, getLoginCredentialsForRunningDbGate } from "./actions";
import { Label } from "@/components/ui/label";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { Switch } from "@/components/ui/switch";
import { Code } from "@/components/custom/code";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function DbGateCard({
    app
}: {
    app: AppExtendedModel;
}) {

    const { openConfirmDialog } = useConfirmDialog();
    const [isDbGateActive, setIsDbGateActive] = useState<boolean | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const loadIsDbGateActive = async (appId: string) => {
        const response = await Actions.run(() => getIsDbGateActive(appId));
        setIsDbGateActive(response);
    }

    const openDbGateAsync = async () => {
        try {
            setLoading(true);
            const credentials = await Actions.run(() => getLoginCredentialsForRunningDbGate(app.id));
            setLoading(false);
            await openConfirmDialog({
                title: "Open DB Gate",
                description: <>
                    DB Gate is ready and can be opened in a new tab. <br />
                    Use the following credentials to login:
                    <div className="pt-3 grid grid-cols-1 gap-1">
                        <Label>Username</Label>
                        <div> <Code>{credentials.username}</Code></div>
                    </div>
                    <div className="pt-3 pb-4 grid grid-cols-1 gap-1">
                        <Label>Password</Label>
                        <div><Code>{credentials.password}</Code></div>
                    </div>
                    <div>
                        <Button variant='outline' onClick={() => window.open(credentials.url, '_blank')}>Open DB Gate</Button>
                    </div>
                </>,
                okButton: '',
                cancelButton: "Close"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadIsDbGateActive(app.id);
        return () => {
            setIsDbGateActive(undefined);
        }
    }, [app]);

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Database Access</CardTitle>
                <CardDescription>Activate one of the following tools to access the database through your browser.</CardDescription>
            </CardHeader>
            <CardContent>
                {isDbGateActive === undefined ? <FullLoadingSpinner /> : <div className="flex gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <Switch id="canary-channel-mode" disabled={loading} checked={isDbGateActive} onCheckedChange={async (checked) => {
                            try {
                                setLoading(true);
                                if (checked) {
                                    await Toast.fromAction(() => deployDbGate(app.id), 'DB Gate is now activated', 'Activating DB Gate...');
                                } else {
                                    await Toast.fromAction(() => deleteDbGatDeploymentForAppIfExists(app.id), 'DB Gate has been deactivated', 'Deactivating DB Gate...');
                                }
                                await loadIsDbGateActive(app.id);
                            } finally {
                                setLoading(false);
                            }
                        }} />
                        <Label htmlFor="airplane-mode">DB Gate</Label>
                    </div>
                    {loading && <LoadingSpinner></LoadingSpinner>}
                    {isDbGateActive && <Button variant='outline' onClick={() => openDbGateAsync()}
                        disabled={!isDbGateActive || loading}>Open DB Gate</Button>}
                </div>}
            </CardContent>
        </Card >
    </>;
}
