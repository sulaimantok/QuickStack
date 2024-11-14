import { stringToNumber, stringToOptionalNumber } from "@/lib/zod.utils";
import { pid } from "process";
import { z } from "zod";

export const nodeInfoZodModel = z.object({
  name: z.string(),
  status: z.string(),
  os: z.string(),
  architecture: z.string(),
  cpuCapacity: z.string(),
  ramCapacity: z.string(),
  ip: z.string(),
  containerRuntimeVersion: z.string(),
  kernelVersion: z.string(),
  kubeProxyVersion: z.string(),
  kubeletVersion: z.string(),
  memoryOk: z.boolean(),
  diskOk: z.boolean(),
  pidOk: z.boolean(),
  schedulable: z.boolean(),
  memoryStatusText: z.string().optional(),
  diskStatusText: z.string().optional(),
  pidStatusText: z.string().optional(),
})

export type NodeInfoModel = z.infer<typeof nodeInfoZodModel>;