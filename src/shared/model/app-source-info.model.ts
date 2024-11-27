import { z } from "zod";

export const appSourceInfoInputZodModel = z.object({
  sourceType: z.enum(["GIT", "CONTAINER"]),
  containerImageSource: z.string().nullish(),

  gitUrl: z.string().nullish(),
  gitBranch: z.string().nullish(),
  gitUsername: z.string().nullish(),
  gitToken: z.string().nullish(),
  dockerfilePath: z.string().nullish(),
});
export type AppSourceInfoInputModel = z.infer<typeof appSourceInfoInputZodModel>;

export const appSourceInfoGitZodModel = z.object({
  gitUrl: z.string(),
  gitBranch: z.string(),
  gitUsername: z.string().nullish(),
  gitToken: z.string().nullish(),
  dockerfilePath: z.string(),
});
export type AppSourceInfoGitModel = z.infer<typeof appSourceInfoGitZodModel>;

export const appSourceInfoContainerZodModel = z.object({
  containerImageSource: z.string(),
});
export type AppSourceInfoContainerModel = z.infer<typeof appSourceInfoContainerZodModel>;
