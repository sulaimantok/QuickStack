import { User, UserGroup } from "@prisma/client";
import { UserGroupExtended } from "./sim-session.model";

export type UserExtended = {
    id: string;
    userGroup: UserGroup | null;
    userGroupId: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};
