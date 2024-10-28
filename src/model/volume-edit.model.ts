import { stringToNumber } from "@/lib/zod.utils";
import { z } from "zod";

export const appVolumeEditZodModel = z.object({
  containerMountPath: z.string().trim().min(1),
  size: stringToNumber,
})

export type AppVolumeEditModel = z.infer<typeof appVolumeEditZodModel>;