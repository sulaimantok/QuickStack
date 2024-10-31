import { z } from "zod";

export const buildJobSchemaZod = z.object({
    name: z.string(),
    startTime: z.date(),
    status:  z.union([z.literal('UNKNOWN'), z.literal('RUNNING'), z.literal('FAILED'), z.literal('SUCCEEDED')]),
});

export type BuildJobModel = z.infer<typeof buildJobSchemaZod>;


