import { z } from "zod";

export const deploymentStatusEnumZod = z.union([
    z.literal('UNKNOWN'),
    z.literal('BUILDING'),
    z.literal('ERROR'),
    z.literal('DEPLOYED'),
    z.literal('DEPLOYING'),
    z.literal('SHUTDOWN'),
    z.literal('SHUTTING_DOWN'),
]);

export const deploymentInfoZodModel = z.object({
    replicasetName: z.string().optional(),
    buildJobName: z.string().optional(),
    createdAt: z.date(),
    status: deploymentStatusEnumZod,
    gitCommit: z.string().optional(),
});

export type DeploymentInfoModel = z.infer<typeof deploymentInfoZodModel>;
export type DeplyomentStatus = z.infer<typeof deploymentStatusEnumZod>;


