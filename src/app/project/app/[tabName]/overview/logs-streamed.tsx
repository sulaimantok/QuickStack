import { useEffect, useRef, useState } from "react";
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
    const [logs, setLogs] = useState<string>('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);



    const initializeConnection = async (controller: AbortController) => {
        // Initiate the first call to connect to SSE API

        setLogs('Loading...');

        const signal = controller.signal;
        const apiResponse = await fetch('/api/pod-logs', {
            method: "POST",
            headers: {
                "Content-Type": "text/event-stream",
            },
            body: JSON.stringify({ namespace, podName, buildJobName }),
            signal: signal,
        });

        if (!apiResponse.ok) return;
        if (!apiResponse.body) return;
        setIsConnected(true);

        // To decode incoming data as a string
        const reader = apiResponse.body
            .pipeThrough(new TextDecoderStream())
            .getReader();

        setLogs('');
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                setIsConnected(false);
                break;
            }
            if (value) {
                setLogs((prevLogs) => prevLogs + value);
            }
        }
    }

    useEffect(() => {
        if (!buildJobName && (!namespace || !podName)) {
            return;
        }
        const controller = new AbortController();
        initializeConnection(controller);

        return () => {
            console.log('Disconnecting from logs');
            setLogs('');
            controller.abort();
        };
    }, [namespace, podName, buildJobName]);

    useEffect(() => {
        if (textAreaRef.current) {
            // Scroll to the bottom every time logs change
            textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
        }
    }, [logs]);

    return <>
        <div className="space-y-4">
            <Textarea ref={textAreaRef} value={logs} readOnly className="h-[400px] bg-slate-900 text-white" />
            <div className="text-sm pl-1">Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
        </div>
    </>;
}
