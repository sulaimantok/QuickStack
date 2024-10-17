import { Session } from "next-auth";

export interface UserSession extends Session {
    id?: string;
}
