

import { Prisma, User } from "@prisma/client";
import dataAccess from "../data-access/data-access.client";
import { revalidateTag, unstable_cache } from "next/cache";
import { Tags } from "../utils/cache-tag-generator.utils";
import bcrypt from "bcrypt";

const saltRounds = 10;

export class UserService {

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

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
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