import { Prisma, Role, RoleAppPermission } from "@prisma/client";
import dataAccess from "../adapter/db.client";
import { revalidateTag, unstable_cache } from "next/cache";
import { Tags } from "../utils/cache-tag-generator.utils";
import { ServiceException } from "@/shared/model/service.exception.model";
import { RoleEditModel } from "@/shared/model/role-edit.model";
import { adminRoleName } from "@/shared/model/role-extended.model.ts";
import { UserRole } from "@/shared/model/sim-session.model";

export class RoleService {

    async getRoleByUserMail(email: string): Promise<UserRole | null> {
        return await unstable_cache(async (mail: string) => await dataAccess.client.user.findFirst({
            select: {
                role: {
                    select: {
                        name: true,
                        id: true,
                        canAccessBackups: true,
                        roleProjectPermissions: {
                            select: {
                                projectId: true,
                                project: {
                                    select: {
                                        apps: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                },
                                createApps: true,
                                deleteApps: true,
                                writeApps: true,
                                readApps: true,
                                roleAppPermissions: true,
                            }
                        }
                    }
                }
            },
            where: {
                email: mail
            }
        }).then(user => {
            return user?.role ?? null;
        }),
            [Tags.roles(), Tags.users()], {
            tags: [Tags.roles(), Tags.users()]
        })(email);
    }

    async saveWithPermissions(item: RoleEditModel) {
        try {
            if (item.name === adminRoleName) {
                throw new ServiceException("You cannot assign the name 'admin' to a role");
            }
            await dataAccess.client.$transaction(async tx => {
                // save role first

                let savedRole: Role;
                if (item.id) {
                    savedRole = await tx.role.update({
                        where: {
                            id: item.id as string
                        },
                        data: {
                            name: item.name,
                            canAccessBackups: item.canAccessBackups,
                        }
                    });
                } else {
                    savedRole = await tx.role.create({
                        data: {
                            name: item.name,
                            canAccessBackups: item.canAccessBackups,
                        }
                    });
                }

                // save project and app permissions

                await tx.roleProjectPermission.deleteMany({
                    where: {
                        roleId: savedRole.id
                    }
                });

                for (let projectRolePermission of item.roleProjectPermissions) {
                    const forThisProjectCustomAppRolesExist = projectRolePermission.roleAppPermissions.length > 0;
                    const projectRolePermissionData = {
                        roleId: savedRole.id,
                        projectId: projectRolePermission.projectId,
                        createApps: forThisProjectCustomAppRolesExist ? false : projectRolePermission.createApps,
                        deleteApps: forThisProjectCustomAppRolesExist ? false : projectRolePermission.deleteApps,
                        writeApps: forThisProjectCustomAppRolesExist ? false : projectRolePermission.writeApps,
                        readApps: projectRolePermission.readApps
                    };
                    const savedProjectRolePermission = await tx.roleProjectPermission.create({
                        data: projectRolePermissionData
                    });

                    // save app permissions
                    await tx.roleAppPermission.deleteMany({
                        where: {
                            roleProjectPermissionId: savedProjectRolePermission.id
                        }
                    });

                    await tx.roleAppPermission.createMany({
                        data: projectRolePermission.roleAppPermissions.map((app) => ({
                            ...app,
                            roleProjectPermissionId: savedProjectRolePermission.id
                        }))
                    });
                }
            });
        } finally {
            revalidateTag(Tags.roles());
            revalidateTag(Tags.users());
        }
    }

    async save(item: Prisma.RoleUncheckedCreateInput | Prisma.RoleUncheckedUpdateInput) {
        try {
            if (item.name === adminRoleName) {
                throw new ServiceException("You cannot assign the name 'admin' to a role");
            }
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

    async getAll(): Promise<UserRole[]> {
        return await unstable_cache(async () => await dataAccess.client.role.findMany({
            include: {
                roleProjectPermissions: {
                    select: {
                        projectId: true,
                        project: {
                            select: {
                                apps: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        },
                        createApps: true,
                        deleteApps: true,
                        writeApps: true,
                        readApps: true,
                        roleAppPermissions: true,
                    }
                }
            }
        }),
            [Tags.roles()], {
            tags: [Tags.roles()]
        })();
    }
    async getById(id: string): Promise<UserRole> {
        return await unstable_cache(async () => await dataAccess.client.role.findFirstOrThrow({
            where: {
                id
            },
            include: {
                roleProjectPermissions: {
                    select: {
                        projectId: true,
                        project: {
                            select: {
                                apps: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        },
                        createApps: true,
                        deleteApps: true,
                        writeApps: true,
                        readApps: true,
                        roleAppPermissions: true,
                    }
                }
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

    async getOrCreateAdminRole() {
        let adminRole = await dataAccess.client.role.findFirst({
            where: {
                name: adminRoleName
            }
        });
        if (!adminRole) {
            adminRole = await dataAccess.client.role.create({
                data: {
                    name: adminRoleName
                }
            });
        }
        return adminRole;
    }

    async createDefaultRolesIfNotExists() {
        try {
            const roles = await dataAccess.client.role.findMany({
                where: {
                    name: {
                        in: [adminRoleName]
                    }
                }
            });
            if (roles.length === 0) {
                const adminRole = await this.getOrCreateAdminRole();
                await dataAccess.client.user.updateMany({
                    where: {
                        roleId: null
                    },
                    data: {
                        roleId: adminRole.id
                    }
                });
            }
        } finally {
            revalidateTag(Tags.roles());
            revalidateTag(Tags.users());
        }
    }
}

const roleService = new RoleService();
export default roleService;