import { stringToNumber, stringToOptionalNumber } from "@/shared/utils/zod.utils";
import { pid } from "process";
import { z } from "zod";

export const nodeResourceZodModel = z.object({
  name: z.string(),
  cpuUsagePercent: z.string(),
  cpuUsageAbsolut: z.string(),
  ramUsagePercent: z.string(),
  ramUsageAbsolut: z.string(),
  diskUsagePercent: z.string(),
})

export type NodeResourceModel = z.infer<typeof nodeResourceZodModel>;