import { z } from "zod";

export const terminalSetupInfoZodModel = z.object({
    namespace: z.string().min(1),
    podName: z.string().min(1),
    containerName: z.string().min(1),
});

export type TerminalSetupInfoModel = z.infer<typeof terminalSetupInfoZodModel>;