import { stringToNumber } from "@/shared/utils/zod.utils";
import { z } from "zod";

export const roleEditZodModel = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1),
})

export type RoleEditModel = z.infer<typeof roleEditZodModel>;
