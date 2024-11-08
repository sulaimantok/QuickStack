import type http from "node:http";
import { Server } from "socket.io";

class SocketIoServer {
	initialize(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
		const io = new Server(server);
		const podLogsNamespace = io.of("/pod-logs");
		podLogsNamespace.on("connection", (socket) => {
			//logService.streamLogs(socket);
		});
	};
}
const socketIoServer = new SocketIoServer();
export default socketIoServer;

