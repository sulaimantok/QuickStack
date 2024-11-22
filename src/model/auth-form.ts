import { z } from "zod";

export const authFormInputSchemaZod = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
export type AuthFormInputSchema = z.infer<typeof authFormInputSchemaZod>;

export const registgerFormInputSchemaZod = authFormInputSchemaZod.merge(z.object({
    qsHostname: z.string().url().optional(),
}));
export type RegisterFormInputSchema = z.infer<typeof registgerFormInputSchemaZod>;

export const twoFaInputSchemaZod = z.object({
    twoFactorCode: z.string().length(6)
});
export type TwoFaInputSchema = z.infer<typeof twoFaInputSchemaZod>;

