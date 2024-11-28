import { TerminalSetupInfoModel, terminalSetupInfoZodModel } from "../../shared/model/terminal-setup-info.model";
import { DefaultEventsMap, Socket } from "socket.io";
import k3s from "../adapter/kubernetes-api.adapter";
import * as k8s from '@kubernetes/client-node';
import stream from 'stream';
import { StreamUtils } from "../../shared/utils/stream.utils";
import WebSocket from "ws";

interface TerminalStrean {
    stdoutStream: stream.PassThrough;
    stderrStream: stream.PassThrough;
    stdinStream: stream.PassThrough;
    terminalSessionKey: string;
    websocket?: WebSocket.WebSocket;
}

export class TerminalService {
    activeStreams = new Map<string, { logStream: stream.PassThrough, clients: number, k3sStreamRequest: any }>();

    async streamLogs(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        console.log('[NEW] Client connected:', socket.id);

        const streamsOfSocket: TerminalStrean[] = [];

        socket.on('openTerminal', async (podInfo) => {
            console.warn('openTerminal', podInfo);
            try {
                const terminalInfo = terminalSetupInfoZodModel.parse(podInfo);
                if (!terminalInfo.terminalSessionKey) {
                    console.warn('terminalSessionKey not provided. Setting as undefined.');
                }
                console.log(terminalInfo)
                const streamInputKey = StreamUtils.getInputStreamName(terminalInfo);
                const streamOutputKey = StreamUtils.getOutputStreamName(terminalInfo);

                /*const podReachable = await setupPodService.waitUntilPodIsRunningFailedOrSucceded(terminalInfo.namespace, terminalInfo.podName);
                if (!podReachable) {
                    socket.emit(streamOutputKey, 'Pod is not reachable.');
                    return;
                }*/

                const exec = new k8s.Exec(k3s.getKubeConfig());

                const stdoutStream = new stream.PassThrough();
                const stderrStream = new stream.PassThrough();
                const stdinStream = new stream.PassThrough();
                console.log('starting exec')
                await exec.exec(
                    terminalInfo.namespace,
                    terminalInfo.podName,
                    terminalInfo.containerName,
                    [terminalInfo.terminalType === 'sh' ? '/bin/sh' : '/bin/bash'],
                    /* process.stdout,
                     process.stderr,
                     process.stdin,*/
                    stdoutStream,
                    stderrStream,
                    stdinStream,
                    false /* tty */,
                    (status: k8s.V1Status) => {
                        console.log('[EXIT] Exited with status:');
                        console.log(JSON.stringify(status, null, 2));
                        stderrStream!.end();
                        stdoutStream!.end();
                        stdinStream!.end();
                    },
                );

                stdoutStream.on('data', (chunk) => {
                    console.log(chunk)
                    socket.emit(streamOutputKey, chunk.toString());
                });
                stdoutStream.on('error', (error) => {
                    console.error("Error in terminal stream:", error);
                });
                stdoutStream.on('end', () => {
                    //console.log(`[END] Log stream ended for ${streamKey} by ${streamEndedByClient ? 'client' : 'server'}`);

                });

                stderrStream.on('data', (chunk) => {
                    console.log(chunk)
                    socket.emit(streamOutputKey, chunk.toString());
                });
                socket.on(streamInputKey, (data) => {
                    console.log('Received data:', data);
                    stdinStream!.write(data);
                });

                streamsOfSocket.push({
                    stdoutStream,
                    stderrStream,
                    stdinStream,
                    terminalSessionKey: terminalInfo.terminalSessionKey ?? '',
                    //websocket
                });

                console.log(`Client ${socket.id} joined terminal stream for:`);
                console.log(`Input:  ${streamInputKey}`);
                console.log(`Output: ${streamOutputKey}`);
            } catch (error) {
                console.error('Error while initializing terminal session', podInfo, error);
            }
        });

        socket.on('closeTerminal', (podInfo) => {
            console.warn('closeTerminal', podInfo);
            const terminalInfo = terminalSetupInfoZodModel.parse(podInfo);

            const streams = streamsOfSocket.find(stream => stream.terminalSessionKey === terminalInfo.terminalSessionKey);
            if (streams) {
                this.deleteLogStream(streams);
            }
        });

        socket.on('disconnecting', () => {
            // Stop all log streams for this client
            for (const stream of streamsOfSocket) {
                this.deleteLogStream(stream);
            }
        });
    }


    private deleteLogStream(streams: TerminalStrean) {
        /* streams.stderrStream.end();
         streams.stdoutStream.end();
         streams.stdinStream.end();
         streams.websocket.close();*/

        console.log(`Stopped log stream for ${streams.terminalSessionKey}.`);
    }
    /*
        private async createLogStreamForPod(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
            streamKey: string, inputInfo: TerminalSetupInfoModel) {



            logStream.on('data', (chunk) => {
                socket.emit(streamKey, chunk.toString());
            });

            logStream.on('data', (chunk) => {
                socket.to(streamKey).emit(`${streamKey}`, chunk.toString());
            });

            let k3sStreamRequest = await k3s.log.log(app.projectId, pod.podName, pod.containerName, logStream, {
                follow: true,
                pretty: false,
                tailLines: 100,
            });
            const retVal = { logStream, clients: 0, k3sStreamRequest };
            return retVal;
        }*/
}

const terminalService = new TerminalService();
export default terminalService;