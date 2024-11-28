import { memo } from "react";
import { z } from "zod";

export const podsResourceInfoZodModel = z.object({
    cpuAbsolut: z.string(),
    cpuPercent: z.string(),
    memoryAbsolut: z.string(),
    memoryPercent: z.string(),
    volumePercent: z.string(),
});

export type PodsResourceInfoModel = z.infer<typeof podsResourceInfoZodModel>;


