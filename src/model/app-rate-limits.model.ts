import { z } from "zod";

export const appRateLimitsZodModel = z.object({
  memoryReservation: z.number().nullish(),
  memoryLimit: z.number().nullish(),
  cpuReservation: z.number().nullish(),
  cpuLimit: z.number().nullish(),
})

export type AppRateLimitsModel = z.infer<typeof appRateLimitsZodModel>;