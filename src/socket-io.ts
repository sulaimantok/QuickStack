import type http from "node:http";
import { Server } from "socket.io";
import k3s from "./server/adapter/kubernetes-api.adapter";
import stream from "stream";
import appService from "./server/services/app.service";
import deploymentService from "./server/services/deployment.service";
import dataAccess from "./server/adapter/db.client";

class WebSocketHandler {



	initializeSocketIo(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {

		const io = new Server(server);

		const podLogsNamespace = io.of("/pod-logs");
		podLogsNamespace.on("connection", (socket) => {

			let req: any;

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

				const logStream = new stream.PassThrough();
				logStream.on('data', (chunk) => {
					socket.emit(`logs_${app.projectId}_${app.id}_${pod.podName}`, chunk.toString());
				});

				req = await k3s.log.log(app.projectId, pod.podName, pod.containerName, logStream, {
					follow: true,
					pretty: false,
					tailLines: 100,
				});



				// on disconnect from client

			});

			socket.on('disconnect', () => {
				if (req) {
					req.abort();
					console.log("Aborted request");
				}
			});
		});

	};

}
const webSocketHandler = new WebSocketHandler();
export default webSocketHandler;

