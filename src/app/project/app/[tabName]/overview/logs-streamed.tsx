import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/model/app-extended.model";
import { useEffect, useState } from "react";
import { podLogsSocket } from "@/socket";
import { Textarea } from "@/components/ui/textarea";

export default function LogsStreamed({
    app,
    podName,
}: {
    app: AppExtendedModel;
    podName: string;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [logs, setLogs] = useState<string>('');

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setTransport(podLogsSocket.io.engine.transport.name);

            podLogsSocket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        if (podLogsSocket.connected) {
            onConnect();
        }

        podLogsSocket.emit('joinPodLog', { appId: app.id, podName });

        const myListener = (e: string) => {
            setLogs(e);
        }

        podLogsSocket.on("connect", onConnect);
        podLogsSocket.on("disconnect", onDisconnect);
        podLogsSocket.on(`logs_${app.projectId}_${app.id}_${podName}`, myListener);

        return () => {
            podLogsSocket.off("connect", onConnect);
            podLogsSocket.off("disconnect", onDisconnect);
            podLogsSocket.off(`logs_${app.projectId}_${app.id}_${podName}`, myListener);
        };
    }, [app, podName]);


    if (app.sourceType === 'container') {
        return <></>;
    }

    return <>
        <Textarea value={logs} readOnly className="h-[400px] bg-slate-900 text-white" />

        <div className="text-sm pl-1">Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
    </>;
}
