import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { TerminalSetupInfoModel } from "@/shared/model/terminal-setup-info.model";
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { podTerminalSocket } from "@/frontend/sockets/sockets";
import { StreamUtils } from "@/shared/utils/stream.utils";

export default function TerminalStreamed({
    terminalInfo,
}: {
    terminalInfo: TerminalSetupInfoModel;
}) {
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState<string>('');
    const terminalWindow = useRef<HTMLDivElement>(null);




    useEffect(() => {
        if (!terminalInfo || !terminalWindow || !terminalWindow.current) {
            return;
        }
        const terminalInputKey = StreamUtils.getInputStreamName(terminalInfo);
        const terminalOutputKey = StreamUtils.getOutputStreamName(terminalInfo);

        var term = new Terminal();
        term.open(terminalWindow.current);
        term.onData((data) => {
            podTerminalSocket.emit(terminalInputKey, data);
        });

        podTerminalSocket.on(terminalOutputKey, (data: string) => {
            console.log('Received data:', data);
            term.write(data);
        });
        podTerminalSocket.emit('openTerminal', terminalInfo);


        term.write('Terminal is ready');


        return () => {
            console.log('Disconnecting from terminal...');
            term.dispose();
            podTerminalSocket.emit('closeTerminal', terminalInfo);
        };
    }, [terminalInfo]);


    return <>
        <div className="space-y-4">
            <div ref={terminalWindow} ></div>

        </div>
    </>;
}
