import { memo } from "react";
import { z } from "zod";

export const podsResourceInfoZodModel = z.object({
    cpuPercent: z.string(),
    cpuAbsolut: z.string(),
    ramPercent: z.string(),
    ramAbsolut: z.string(),
});

export type PodsResourceInfoModel = z.infer<typeof podsResourceInfoZodModel>;


