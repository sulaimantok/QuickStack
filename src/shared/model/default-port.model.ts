import { stringToNumber, stringToOptionalNumber } from "@/shared/utils/zod.utils";
import { z } from "zod";

export const appdefaultPortZodModel = z.object({
  defaultPort: stringToNumber,
})

export type AppDefaultPortsModel = z.infer<typeof appdefaultPortZodModel>;