'use client'

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { DeplyomentStatus } from "@/shared/model/deployment-info.model";
import { set } from "date-fns";

export default function AppStatus({
    appId,
}: {
    appId?: string;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<DeplyomentStatus>('UNKNOWN');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);



    const initializeConnection = async (controller: AbortController) => {
        // Initiate the first call to connect to SSE API

        setStatus('UNKNOWN');

        const signal = controller.signal;
        const apiResponse = await fetch('/api/app-status', {
            method: "POST",
            headers: {
                "Content-Type": "text/event-stream",
            },
            body: JSON.stringify({ appId }),
            signal: signal,
        });

        if (!apiResponse.ok) return;
        if (!apiResponse.body) return;
        setIsConnected(true);

        // To decode incoming data as a string
        const reader = apiResponse.body
            .pipeThrough(new TextDecoderStream())
            .getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                setIsConnected(false);
                break;
            }
            if (value) {
                setStatus(value as DeplyomentStatus);
            }
        }
    }

    useEffect(() => {
        if (!appId) {
            return;
        }
        const controller = new AbortController();
        initializeConnection(controller);

        return () => {
            console.log('Disconnecting from status listener');
            setStatus('UNKNOWN');
            controller.abort();
        };
    }, [appId]);

    const mapToStatusColor = (status: DeplyomentStatus) => {
        switch (status) {
            case 'UNKNOWN':
                return 'bg-gray-500';
            case 'DEPLOYING':
                return 'bg-orange-500';
            case 'DEPLOYED':
                return 'bg-green-500';
            case 'SHUTTING_DOWN':
                return 'bg-orange-500';
            case 'SHUTDOWN':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    return <>
        <div className={mapToStatusColor(status) + ' rounded-full w-3 h-3'}>
            <div></div>
        </div>
    </>;
}
