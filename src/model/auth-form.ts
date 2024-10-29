import { z } from "zod";

export const authFormInputSchemaZod = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export type AuthFormInputSchema = z.infer<typeof authFormInputSchemaZod>;

export const twoFaInputSchemaZod = z.object({
    twoFactorCode: z.string().length(6)
});

export type TwoFaInputSchema = z.infer<typeof twoFaInputSchemaZod>;

