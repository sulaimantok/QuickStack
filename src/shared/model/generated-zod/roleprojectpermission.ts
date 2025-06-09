import * as z from "zod"
import * as imports from "../../../../prisma/null"
import { CompleteUserGroup, RelatedUserGroupModel, CompleteProject, RelatedProjectModel, CompleteRoleAppPermission, RelatedRoleAppPermissionModel } from "./index"

export const RoleProjectPermissionModel = z.object({
  id: z.string(),
  userGroupId: z.string(),
  projectId: z.string(),
  createApps: z.boolean(),
  deleteApps: z.boolean(),
  writeApps: z.boolean(),
  readApps: z.boolean(),
  createProjects: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRoleProjectPermission extends z.infer<typeof RoleProjectPermissionModel> {
  userGroup: CompleteUserGroup
  project: CompleteProject
  roleAppPermissions: CompleteRoleAppPermission[]
}

/**
 * RelatedRoleProjectPermissionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoleProjectPermissionModel: z.ZodSchema<CompleteRoleProjectPermission> = z.lazy(() => RoleProjectPermissionModel.extend({
  userGroup: RelatedUserGroupModel,
  project: RelatedProjectModel,
  roleAppPermissions: RelatedRoleAppPermissionModel.array(),
}))
