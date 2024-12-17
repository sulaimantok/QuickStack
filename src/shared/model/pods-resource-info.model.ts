import { z } from "zod";

export const podsResourceInfoZodModel = z.object({
    cpuPercent: z.number(),
    cpuAbsolut: z.number(),
    ramPercent: z.number(),
    ramAbsolut: z.number(),
});

export type PodsResourceInfoModel = z.infer<typeof podsResourceInfoZodModel>;


