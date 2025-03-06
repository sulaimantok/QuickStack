import { Session } from "next-auth";

export interface UserSession {
    email: string;
    roleName?: string;
    roleId?: string;
}
