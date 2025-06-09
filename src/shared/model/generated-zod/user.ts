import * as z from "zod"
import * as imports from "../../../../prisma/null"
import { CompleteUserGroup, RelatedUserGroupModel, CompleteAccount, RelatedAccountModel, CompleteSession, RelatedSessionModel, CompleteAuthenticator, RelatedAuthenticatorModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string(),
  emailVerified: z.date().nullish(),
  password: z.string(),
  twoFaSecret: z.string().nullish(),
  twoFaEnabled: z.boolean(),
  image: z.string().nullish(),
  userGroupId: z.string().nullish(),
  maxCpu: z.number().int().nullish(),
  maxMemory: z.number().int().nullish(),
  maxStorage: z.number().int().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  userGroup?: CompleteUserGroup | null
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
  Authenticator: CompleteAuthenticator[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  userGroup: RelatedUserGroupModel.nullish(),
  accounts: RelatedAccountModel.array(),
  sessions: RelatedSessionModel.array(),
  Authenticator: RelatedAuthenticatorModel.array(),
}))
