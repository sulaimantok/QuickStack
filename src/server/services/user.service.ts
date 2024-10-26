

import { Prisma, User } from "@prisma/client";
import dataAccess from "../adapter/db.client";
import { revalidateTag, unstable_cache } from "next/cache";
import { Tags } from "../utils/cache-tag-generator.utils";
import bcrypt from "bcrypt";
import { ServiceException } from "@/model/service.exception.model";

const saltRounds = 10;

export class UserService {

    async changePassword(userMail: string, oldPassword: string, newPassword: string) {
        try {
            const user = await dataAccess.client.user.findUnique({
                where: {
                    email: userMail
                }
            });
            if (!user) {
                throw new ServiceException("User not found");
            }
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                throw new ServiceException("Old password is incorrect");
            }
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await dataAccess.client.user.update({
                where: {
                    email: userMail
                },
                data: {
                    password: hashedPassword
                }
            });
        } finally {
            revalidateTag(Tags.users());
        }
    }

    async maptoDtoUser(user: User) {
        return {
            id: user.id,
            email: user.email
        };
    }

    async authorize(credentials: Record<"password" | "username", string> | undefined) {
        try {
            if (!credentials || !credentials.username || !credentials.password) {
                return null;
            }
            const dbUser = await dataAccess.client.user.findFirst({
                where: {
                    email: credentials.username
                }
            });
            if (!dbUser) {
                return null;
            }
            const isPasswordValid = await bcrypt.compare(credentials.password, dbUser.password);
            if (!isPasswordValid) {
                return null;
            }
            return this.maptoDtoUser(dbUser);
        } finally {
            revalidateTag(Tags.users());
        }
    }

    async registerUser(email: string, password: string) {
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const user = await dataAccess.client.user.create({
                data: {
                    email,
                    password: hashedPassword
                }
            });
            return user;
        } finally {
            revalidateTag(Tags.users());
        }
    }

    async getAllUsers() {
        return await unstable_cache(async () => await dataAccess.client.user.findMany(),
            [Tags.users()], {
            tags: [Tags.users()]
        })();
    }
}

const userService = new UserService();
export default userService;