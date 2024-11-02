import { useEffect, useState } from "react";
import { podLogsSocket } from "@/lib/sockets";
import { Textarea } from "@/components/ui/textarea";

export default function LogsStreamed({
    namespace,
    podName,
}: {
    namespace: string;
    podName: string;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [logs, setLogs] = useState<string>('');

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

    const myListener = (e: string) => {
        setLogs(e);
    }

    useEffect(() => {
        if (!podName) {
            return;
        }
        const logEventName = `${namespace}_${podName}`;
        console.log('Connecting to logs ' + logEventName);

        if (podLogsSocket.connected) {
            onConnect();
        }

        podLogsSocket.emit('joinPodLog', { namespace, podName });

        podLogsSocket.on("connect", onConnect);
        podLogsSocket.on("disconnect", onDisconnect);
        podLogsSocket.on(logEventName, myListener);
        return () => {
            if (!podName) {
                return;
            }
            console.log('Disconnecting from logs ' + logEventName);
            podLogsSocket.emit('leavePodLog', { namespace, podName });
            setLogs('');
            podLogsSocket.off("connect", onConnect);
            podLogsSocket.off("disconnect", onDisconnect);
            podLogsSocket.off(logEventName, myListener);
        };
    }, [namespace, podName]);

    return <>
        <Textarea value={logs} readOnly className="h-[400px] bg-slate-900 text-white" />
        <div className="text-sm pl-1">Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
    </>;
}
