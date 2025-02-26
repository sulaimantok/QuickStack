import { Role, RoleAppPermission, User } from "@prisma/client";

export type RoleExtended = Role & {
    roleAppPermissions: RoleAppPermission[];
}
