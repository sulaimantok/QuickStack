import { stringToNumber } from "@/shared/utils/zod.utils";
import { access } from "fs";
import { z } from "zod";

export const appVolumeEditZodModel = z.object({
  containerMountPath: z.string().trim().min(1),
  size: stringToNumber,
  accessMode: z.string().min(1).nullish(),
})

export type AppVolumeEditModel = z.infer<typeof appVolumeEditZodModel>;