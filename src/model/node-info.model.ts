import { stringToNumber, stringToOptionalNumber } from "@/lib/zod.utils";
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
})

export type NodeInfoModel = z.infer<typeof nodeInfoZodModel>;