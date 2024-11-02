import { useEffect, useRef, useState } from "react";
import { podLogsSocket } from "@/lib/sockets";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default function LogsStreamed({
    namespace,
    podName,
    buildJobName,
}: {
    namespace?: string;
    podName?: string;
    buildJobName?: string;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [logs, setLogs] = useState<string>('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
        setLogs((prevLogs) => prevLogs + e);
    }

    useEffect(() => {
        if (!buildJobName && (!namespace || !podName)) {
            return;
        }
        const streamKey = buildJobName ? buildJobName : `${namespace}_${podName}`;
        console.log('Connecting to logs ' + streamKey);

        if (podLogsSocket.connected) {
            onConnect();
        }

        podLogsSocket.emit('joinPodLog', { namespace, podName, buildJobName });

        podLogsSocket.on("connect", onConnect);
        podLogsSocket.on("disconnect", onDisconnect);
        podLogsSocket.on(streamKey, myListener);
        return () => {
            if (!podName) {
                return;
            }
            console.log('Disconnecting from logs ' + streamKey);
            podLogsSocket.emit('leavePodLog', { streamKey: streamKey });
            setLogs('');
            podLogsSocket.off("connect", onConnect);
            podLogsSocket.off("disconnect", onDisconnect);
            podLogsSocket.off(streamKey, myListener);
        };
    }, [namespace, podName, buildJobName]);

    useEffect(() => {
        if (textAreaRef.current) {
            // Scroll to the bottom every time logs change
            textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
        }
    }, [logs]);

    return <>
        <Textarea ref={textAreaRef} value={logs} readOnly className="h-[400px] bg-slate-900 text-white" />
        <div className="text-sm pl-1">Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
    </>;
}
