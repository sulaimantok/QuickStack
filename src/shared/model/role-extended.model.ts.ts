import { z } from "zod";
import { UserGroupModel, RoleProjectPermissionModel, RoleAppPermissionModel } from "@/shared/model/generated-zod";

export type RoleExtended = z.infer<typeof UserGroupModel> & {
    roleAppPermissions: (z.infer<typeof RoleAppPermissionModel> & {
        app: {
            name: string;
        };
    })[];
    roleProjectPermissions: (z.infer<typeof RoleProjectPermissionModel> & {
        createProjects: boolean;
    })[];
    maxProjects?: number;
    maxCpu?: number;
    maxMemory?: number;
}

export enum RolePermissionEnum {
    READ = 'READ',
    READWRITE = 'READWRITE'
}


export const adminRoleName = "admin";
