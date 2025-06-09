import * as z from "zod"
import * as imports from "../../../../prisma/null"
import { CompleteUser, RelatedUserModel, CompleteRoleProjectPermission, RelatedRoleProjectPermissionModel } from "./index"

export const UserGroupModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  canAccessBackups: z.boolean(),
  maxProjects: z.number().int().nullish(),
  maxApps: z.number().int().nullish(),
  maxCpu: z.number().int().nullish(),
  maxMemory: z.number().int().nullish(),
  roles: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUserGroup extends z.infer<typeof UserGroupModel> {
  users: CompleteUser[]
  roleProjectPermissions: CompleteRoleProjectPermission[]
}

/**
 * RelatedUserGroupModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserGroupModel: z.ZodSchema<CompleteUserGroup> = z.lazy(() => UserGroupModel.extend({
  users: RelatedUserModel.array(),
  roleProjectPermissions: RelatedRoleProjectPermissionModel.array(),
}))
