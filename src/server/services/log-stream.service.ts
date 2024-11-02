import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { App, Prisma, Project } from "@prisma/client";
import { StringUtils } from "../utils/string.utils";
import deploymentService from "./deployment.service";
import k3s from "../adapter/kubernetes-api.adapter";
import { DefaultEventsMap, Socket } from "socket.io";
import stream from "stream";
import { PodsInfoModel } from "@/model/pods-info.model";

class LogStreamService {

	activeStreams = new Map<string, { logStream: stream.PassThrough, clients: number, k3sStreamRequest: any }>();

	async streamLogs(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
		console.log('Client connected:', socket.id);

		socket.on('joinPodLog', async (podInfo) => {
			const { appId, podName } = podInfo;
			if (!appId || !podName) {
				return;
			}
			const app = await dataAccess.client.app.findFirstOrThrow({
				where: {
					id: appId
				}
			});

			const pod = await deploymentService.getPodByName(app.projectId, podName);

			const streamKey = `${app.projectId}_${app.id}_${pod.podName}`;
			const existingActiveStream = this.activeStreams.get(streamKey);
			if (!existingActiveStream) {
				// create stream if not existing
				const retVal = await this.createLogStreamForPod(socket, streamKey, app, pod);
				this.activeStreams.set(streamKey, retVal);
			}
			// Client dem Raum hinzufügen und Anzahl der Clients für diesen Pod erhöhen
			socket.join(streamKey);
			this.activeStreams.get(streamKey)!.clients += 1;

			console.log(`Client ${socket.id} joined log stream for ${streamKey}`);
		});

		socket.on('disconnecting', () => {
			// Über alle Räume iterieren, die dieser Socket abonniert hat
			for (const streamKey of Array.from(socket.rooms)) {
				const existingActiveStream = this.activeStreams.get(streamKey);
				if (existingActiveStream) {
					// Anzahl der Clients für diesen Stream verringern
					existingActiveStream.clients -= 1;
					console.log(`Client ${socket.id} left log stream for ${streamKey}`);

					// Falls keine Clients mehr übrig sind, den Stream beenden
					if (existingActiveStream.clients === 0) {
						this.deleteLogStream(existingActiveStream, streamKey);
					}
				}
			}
		});
	}


	private deleteLogStream(existingActiveStream: { logStream: stream.PassThrough; clients: number; k3sStreamRequest: any; }, streamKey: string) {
		existingActiveStream.logStream.end();
		existingActiveStream.k3sStreamRequest.abort();
		this.activeStreams.delete(streamKey);
		console.log(`Stopped log stream for ${streamKey} as no clients are listening.`);
	}

	private async createLogStreamForPod(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, streamKey: string, app: App, pod: PodsInfoModel) {
		const logStream = new stream.PassThrough();
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
		}); /*.catch((err) => {
    console.error(`Error streaming logs for ${streamKey}:`, err);
    logStream.end();
  });*/
		const retVal = { logStream, clients: 0, k3sStreamRequest };
		return retVal;
	}
}

const logService = new LogStreamService();
export default logService;
