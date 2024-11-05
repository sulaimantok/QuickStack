import { stringToNumber, stringToOptionalNumber } from "@/lib/zod.utils";
import { z } from "zod";

export const appdefaultPortZodModel = z.object({
  defaultPort: stringToNumber,
})

export type AppDefaultPortsModel = z.infer<typeof appdefaultPortZodModel>;