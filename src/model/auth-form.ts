import { z } from "zod";

export const authFormInputSchemaZod = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export type AuthFormInputSchema = z.infer<typeof authFormInputSchemaZod>;

