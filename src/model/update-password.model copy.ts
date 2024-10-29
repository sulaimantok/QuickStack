import { z } from "zod";

export const totpZodModel = z.object({
  totp: z.string(),
})

export type TotpModel = z.infer<typeof totpZodModel>;