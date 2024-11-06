import * as z from "zod"
import * as imports from "../../../prisma/null"
import { CompleteApp, RelatedAppModel } from "./index"

export const AppVolumeModel = z.object({
  id: z.string(),
  containerMountPath: z.string(),
  size: z.number().int(),
  accessMode: z.string(),
  appId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteAppVolume extends z.infer<typeof AppVolumeModel> {
  app: CompleteApp
}

/**
 * RelatedAppVolumeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAppVolumeModel: z.ZodSchema<CompleteAppVolume> = z.lazy(() => AppVolumeModel.extend({
  app: RelatedAppModel,
}))
