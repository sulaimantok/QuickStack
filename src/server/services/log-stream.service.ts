import deploymentService from "./deployment.service";
import k3s from "../adapter/kubernetes-api.adapter";
import { DefaultEventsMap, Socket } from "socket.io";
import stream from "stream";
import { PodsInfoModel } from "@/model/pods-info.model";
import buildService, { buildNamespace } from "./build.service";

class LogStreamService {

	async streamLogs(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
		console.log('[CONNECT] Client connected:', socket.id);

		type socketStreamsBody = {
			logStream: stream.PassThrough,
			k3sStreamRequest: any
		};
		const socketStreams = new Map<string, socketStreamsBody>();

		socket.on('joinPodLog', (podInfo) => this.streamWrapper(socket, async () => {
			let { namespace, podName, buildJobName } = podInfo;
			let pod;
			let streamKey;
			if (namespace && podName) {
				pod = await deploymentService.getPodByName(namespace, podName);
				streamKey = `${namespace}_${podName}`;

			} else if (buildJobName) {
				namespace = buildNamespace;
				pod = await buildService.getPodForJob(buildJobName);
				streamKey = `${buildJobName}`;

			} else {
				console.error('Invalid pod info for streaming logs', podInfo);
				return;
			}

			if (socketStreams.has(streamKey)) {
				console.error(`[INFO] Client ${socket.id} already joined log stream for ${streamKey}`);
				return;
			}

			// create stream if not existing
			const retVal = await this.createLogStreamForPod(socket, streamKey, namespace, pod);
			socketStreams.set(streamKey, {
				logStream: retVal.logStream,
				k3sStreamRequest: retVal.k3sStreamRequest
			});

			console.log(`[JOIN] Client ${socket.id} joined log stream for ${streamKey}`);
		}));

		socket.on('leavePodLog', (data) => {
			const streamKey = data?.streamKey;
			const socketInfo = socketStreams.get(streamKey);
			socketStreams.delete(streamKey);
			socketInfo?.logStream?.end();
			socketInfo?.k3sStreamRequest?.abort();
			console.log(`[LEAVE] Client ${socket.id} left log stream for ${streamKey}`);
		});

		socket.on('disconnect', () => {
			const streamKeys = Array.from(socketStreams.keys());
			for (const [streamKey, socketInfo] of Array.from(socketStreams.entries())) {
				socketInfo?.logStream?.end();
				socketInfo?.k3sStreamRequest?.abort();
			}
			socketStreams.clear();
			console.log(`[DISCONNECTED] Client ${socket.id} disconnected log stream for ${streamKeys}`);
		});
	}

	private async createLogStreamForPod(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, streamKey: string, namespace: string, pod: PodsInfoModel) {
		const logStream = new stream.PassThrough();
		logStream.on('data', (chunk) => {
			socket.emit(streamKey, chunk.toString());
		});

		let k3sStreamRequest = await k3s.log.log(namespace, pod.podName, pod.containerName, logStream, {
			follow: true,
			tailLines: namespace === buildNamespace ? undefined : 100,
			previous: false,
			timestamps: true,
			pretty: false
		});
		return { logStream, k3sStreamRequest };
	}

	private async streamWrapper<T>(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
		func: () => Promise<T>) {
		try {
			return await func();
		} catch (ex) {
			console.error(ex);
			socket.emit('error', (ex as Error)?.message ?? 'An unknown error occurred.');
		}
	}
}

const logService = new LogStreamService();
export default logService;
