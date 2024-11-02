import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/model/app-extended.model";
import { useEffect, useState } from "react";
import { podLogsSocket } from "@/lib/sockets";
import LogsStreamed from "./logs-streamed";
import { getPodsForApp } from "./actions";
import { PodsInfoModel } from "@/model/pods-info.model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { toast } from "sonner";

export default function Logs({
    app
}: {
    app: AppExtendedModel;
}) {
    const [selectedPod, setSelectedPod] = useState<string | undefined>(undefined);
    const [appPods, setAppPods] = useState<PodsInfoModel[] | undefined>(undefined);

    const updateBuilds = async () => {
        try {
            const response = await getPodsForApp(app.id);
            if (response.status === 'success' && response.data) {
                setAppPods(response.data);
            } else {
                console.error(response);
                toast.error(response.message ?? 'An unknown error occurred while loading pods.');
            }
        } catch (ex) {
            console.error(ex);
            toast.error('An unknown error occurred while loading pods.');
        }
    }

    useEffect(() => {
        updateBuilds()
        const intervalId = setInterval(updateBuilds, 10000);
        return () => clearInterval(intervalId);
    }, [app]);

    useEffect(() => {
        if (appPods && selectedPod && !appPods.find(p => p.podName === selectedPod)) {
            // current selected pod is not in the list anymore
            setSelectedPod(undefined);
            if (appPods.length > 0) {
                setSelectedPod(appPods[0].podName);
            }
        } else if (!selectedPod && appPods && appPods.length > 0) {
            // no pod selected yet, initialize with first pod
            setSelectedPod(appPods[0].podName);
        }
    }, [appPods]);



    return <>
        <Card>
            <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>Read logs from all running Containers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!appPods && <FullLoadingSpinner />}
                {appPods && appPods.length === 0 && <div>No running pods found for this app.</div>}
                {selectedPod && appPods && <Select className="w-full" value={selectedPod} onValueChange={(val) => setSelectedPod(val)}>
                    <SelectTrigger >
                        <SelectValue placeholder="Pod wählen" />
                    </SelectTrigger>
                    <SelectContent>
                        {appPods.map(pod => <SelectItem key={pod.podName} value={pod.podName}>{pod.podName}</SelectItem>)}
                    </SelectContent>
                </Select>}
                {app.projectId && selectedPod && <LogsStreamed namespace={app.projectId} podName={selectedPod} />}
            </CardContent>
        </Card >
    </>;
}
