import deploymentService from "./deployment.service";
import k3s from "../adapter/kubernetes-api.adapter";
import { DefaultEventsMap, Socket } from "socket.io";
import stream from "stream";
import { PodsInfoModel } from "@/model/pods-info.model";

class LogStreamService {

	async streamLogs(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
		console.log('[CONNECT] Client connected:', socket.id);

		let logStream: stream.PassThrough;
		let k3sStreamRequest: any;
		let streamKey: string;

		socket.on('joinPodLog', async (podInfo) => {
			const { namespace, podName } = podInfo;
			if (!namespace || !podName) {
				return;
			}
			const pod = await deploymentService.getPodByName(namespace, podName);

			streamKey = `${namespace}_${pod.podName}`;

			// create stream if not existing
			const retVal = await this.createLogStreamForPod(socket, streamKey, namespace, pod);
			logStream = retVal.logStream;
			k3sStreamRequest = retVal.k3sStreamRequest;

			console.log(`[CONNECTED] Client ${socket.id} joined log stream for ${streamKey}`);
		});

		socket.on('leavePodLog', () => {
			// Über alle Räume iterieren, die dieser Socket abonniert hat
			logStream?.end();
			k3sStreamRequest?.abort();
			console.log(`[LEAVE] Client ${socket.id} left log stream for ${streamKey}`);
		});

		socket.on('disconnect', () => {
			// Über alle Räume iterieren, die dieser Socket abonniert hat
			logStream?.end();
			k3sStreamRequest?.abort();
			console.log(`[DISCONNECTED] Client ${socket.id} disconnected log stream for ${streamKey}`);
		});
	}

	private async createLogStreamForPod(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, streamKey: string, namespace: string, pod: PodsInfoModel) {
		const logStream = new stream.PassThrough();
		logStream.on('data', (chunk) => {
			socket.emit(streamKey, chunk.toString());
		});

		let k3sStreamRequest = await k3s.log.log(namespace, pod.podName, pod.containerName, logStream, {
			follow: true,
			pretty: false,
			tailLines: 100,
		});
		return { logStream, k3sStreamRequest };
	}
}

const logService = new LogStreamService();
export default logService;
