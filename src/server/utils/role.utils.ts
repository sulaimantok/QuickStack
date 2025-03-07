import { adminRoleName, RolePermissionEnum } from "@/shared/model/role-extended.model.ts";
import { UserSession } from "@/shared/model/sim-session.model";

export class RoleUtils {
    static getRolePermissionForApp(session: UserSession, appId: string) {
        return (session.permissions?.find(app => app.appId === appId)?.permission ?? null) as RolePermissionEnum | null;
    }

    static sessionHasReadAccessForApp(session: UserSession, appId: string) {
        if (this.isAdmin(session)) {
            return true;
        }
        const rolePermission = this.getRolePermissionForApp(session, appId);
        const roleHasReadAccessForApp = rolePermission === RolePermissionEnum.READ || rolePermission === RolePermissionEnum.READWRITE;
        return !!roleHasReadAccessForApp;
    }

    static sessionHasWriteAccessForApp(session: UserSession, appId: string) {
        if (this.isAdmin(session)) {
            return true;
        }
        const rolePermission = this.getRolePermissionForApp(session, appId);
        const roleHasReadAccessForApp = rolePermission === RolePermissionEnum.READWRITE;
        return roleHasReadAccessForApp;
    }

    static isAdmin(session: UserSession) {
        return session.roleName === adminRoleName;
    }
}