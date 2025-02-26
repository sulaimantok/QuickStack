import { Prisma } from "@prisma/client";
import dataAccess from "../adapter/db.client";
import { revalidateTag, unstable_cache } from "next/cache";
import { Tags } from "../utils/cache-tag-generator.utils";

const adminRoleName = 'Admin';

export class RoleService {

    async save(item: Prisma.RoleUncheckedCreateInput | Prisma.RoleUncheckedUpdateInput) {
        try {
            if (item.id) {
                await dataAccess.client.role.update({
                    where: {
                        id: item.id as string
                    },
                    data: item
                });
            } else {
                await dataAccess.client.role.create({
                    data: item as Prisma.RoleUncheckedCreateInput
                });
            }
        } finally {
            revalidateTag(Tags.roles());
            revalidateTag(Tags.users());
        }
    }

    async setRolePermissions(roleId: string, permissions: Prisma.RoleAppPermissionUncheckedCreateInput[]) {
        try {
            await dataAccess.client.$transaction(async tx => {
                await tx.roleAppPermission.deleteMany({
                    where: {
                        roleId
                    }
                });
                await tx.roleAppPermission.createMany({
                    data: permissions.map(p => ({
                        ...p,
                        roleId
                    }))
                });
            });
        } finally {
            revalidateTag(Tags.roles());
            revalidateTag(Tags.users());
        }
    }

    async getAll() {
        return await unstable_cache(async () => await dataAccess.client.role.findMany({
            include: {
                roleAppPermissions: true
            }
        }),
            [Tags.roles()], {
            tags: [Tags.roles()]
        })();
    }
    async getById(id: string) {
        return await unstable_cache(async () => await dataAccess.client.role.findFirstOrThrow({
            where: {
                id
            },
            include: {
                roleAppPermissions: true
            }
        }),
            [Tags.roles(), id], {
            tags: [Tags.roles()]
        })();
    }

    async assignUserToRole(userId: string, roleId: string) {
        try {
            await dataAccess.client.user.update({
                where: {
                    id: userId,
                },
                data: {
                    roleId,
                },
            });
        } finally {
            revalidateTag(Tags.roles());
            revalidateTag(Tags.users());
        }
    }

    async deleteById(id: string) {
        try {
            await dataAccess.client.role.delete({
                where: {
                    id
                }
            });
        } finally {
            revalidateTag(Tags.roles());
            revalidateTag(Tags.users());
        }
    }
}

const roleService = new RoleService();
export default roleService;