"use client";

import { Manager } from "socket.io-client";

const manager = new Manager();

export const podLogsSocket = manager.socket("/pod-logs");
//export const deploymentStatusSocket = manager.socket("/deployment-status");