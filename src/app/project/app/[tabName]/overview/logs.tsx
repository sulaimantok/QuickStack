import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/model/app-extended.model";
import { useEffect, useState } from "react";
import { podLogsSocket } from "@/socket";
import LogsStreamed from "./logs-streamed";
import { getPodsForApp } from "./actions";
import { PodsInfoModel } from "@/model/pods-info.model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";

export default function Logs({
    app
}: {
    app: AppExtendedModel;
}) {
    const [selectedPod, setSelectedPod] = useState<string | undefined>(undefined);
    const [appPods, setAppPods] = useState<PodsInfoModel[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    const updateBuilds = async () => {
        setError(undefined);
        try {
            const response = await getPodsForApp(app.id);
            if (response.status === 'success' && response.data) {
                setAppPods(response.data);
                if (!selectedPod && response.data.length > 0) {
                    setSelectedPod(response.data[0].podName);
                }
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
        if (app.sourceType === 'container') {
            return;
        }
        updateBuilds();
        const intervalId = setInterval(updateBuilds, 10000);
        return () => clearInterval(intervalId);
    }, [app]);



    return <>
        <Card>
            <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>App Logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!appPods && <FullLoadingSpinner />}
                {appPods && appPods.length === 0 && <div>No running pods found for this app.</div>}
                {appPods && <Select defaultValue={appPods[0].podName} onValueChange={(val) => setSelectedPod(val)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pod wählen" />
                    </SelectTrigger>
                    <SelectContent>
                        {appPods.map(pod => <SelectItem key={pod.podName} value={pod.podName}>{pod.podName}</SelectItem>)}
                    </SelectContent>
                </Select>}
                {selectedPod && <LogsStreamed app={app} podName={selectedPod} />}
            </CardContent>
        </Card >
    </>;
}
