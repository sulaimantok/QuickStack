import * as z from "zod"
import * as imports from "../../../../prisma/null"

export const ParameterModel = z.object({
  name: z.string(),
  value: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
