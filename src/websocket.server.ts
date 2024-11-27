import { WebSocket } from "ws";
import type http from "node:http";

export default async function initializeWebsocket(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {

  // Create a WebSocket server by passing the HTTP server
  const wss = new WebSocket.Server({ server });

  // Event handler for WebSocket connections
  wss.on('connection', (ws) => {
    console.log('A new client has connected.');

    // Event handler for incoming messages from clients
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);

      // Broadcast the received message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    // Event handler for WebSocket connection closing
    ws.on('close', () => {
      console.log('A client has disconnected.');
    });
  });

}