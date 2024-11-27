import { TerminalSetupInfoModel, terminalSetupInfoZodModel } from "../../shared/model/terminal-setup-info.model";
import { DefaultEventsMap, Socket } from "socket.io";
import setupPodService from "./setup-services/setup-pod.service";
import k3s from "../adapter/kubernetes-api.adapter";
import * as k8s from '@kubernetes/client-node';
import stream from 'stream';
import { StreamUtils } from "@/shared/utils/stream.utils";
import WebSocket from "ws";

interface TerminalStrean {
    stdoutStream: stream.PassThrough;
    stderrStream: stream.PassThrough;
    stdinStream: stream.PassThrough;
    streamInputKey: string;
    streamOutputKey: string;
    websocket: WebSocket.WebSocket;
}

export class TerminalService {
    activeStreams = new Map<string, { logStream: stream.PassThrough, clients: number, k3sStreamRequest: any }>();

    async streamLogs(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        console.log('Client connected:', socket.id);

        const streamsOfSocket: TerminalStrean[] = [];

        socket.on('openTerminal', async (podInfo) => {

            const terminalInfo = terminalSetupInfoZodModel.parse(podInfo);
            const streamInputKey = StreamUtils.getInputStreamName(terminalInfo);
            const streamOutputKey = StreamUtils.getOutputStreamName(terminalInfo);

            const podReachable = await setupPodService.waitUntilPodIsRunningFailedOrSucceded(terminalInfo.namespace, terminalInfo.podName);
            if (!podReachable) {
                socket.emit(streamOutputKey);
                return;
            }

            const exec = new k8s.Exec(k3s.getKubeConfig());

            const stdoutStream = new stream.PassThrough();
            const stderrStream = new stream.PassThrough();
            const stdinStream = new stream.PassThrough();

            const websocket = await exec.exec(
                terminalInfo.namespace,
                terminalInfo.podName,
                terminalInfo.containerName,
                ['/bin/sh'],
                process.stdout,
                process.stderr,
                process.stdin,
               /* stdoutStream,
                stderrStream,
                stdinStream,*/
                true /* tty */,
                (status: k8s.V1Status) => {
                    console.log('Exited with status:');
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
            stderrStream.on('data', (chunk) => {
                console.log(chunk)
                socket.emit(streamOutputKey, chunk.toString());
            });
            socket.on(streamInputKey, (data) => {
                stdinStream!.write(data);
            });

            streamsOfSocket.push({ stdoutStream, stderrStream, stdinStream, streamInputKey, streamOutputKey, websocket });


            console.log(`Client ${socket.id} joined terminal stream for ${streamInputKey}`);
        });

        socket.on('closeTerminal', (podInfo) => {
            const terminalInfo = terminalSetupInfoZodModel.parse(podInfo);
            const streamInputKey = StreamUtils.getInputStreamName(terminalInfo);

            const streams = streamsOfSocket.find(stream => stream.streamInputKey === streamInputKey);
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

        console.log(`Stopped log stream for ${streams.streamInputKey}.`);
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