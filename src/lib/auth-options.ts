import { PrismaClient, User } from "@prisma/client";
import NextAuth, { NextAuthOptions, Session } from "next-auth"
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { JWT } from "next-auth/jwt";
import { UserSession } from "@/model/sim-session.model";
import dataAccess from "@/server/data-access/data-access.client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import userService from "@/server/services/user.service";
/*
const response: any = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
*/

const saltRounds = 10;

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                return await userService.authorize(credentials);
            }
        })
    ],
    callbacks: {
        /* async jwt({ token, user }) {
             // Initial sign in
             if (user) {
                 token.id = user.id;
                 token.role = 'tenant'; //user.role;
             }
             return token;
         },*/
        /*async session({ session, token, user }) {
            // Add the user's role to the session
            const dbUser = user as User;
            const simSession = session as SimSession;
            simSession.userId = dbUser.id;


            return simSession;
        },*/
    },
    adapter: PrismaAdapter(dataAccess.client),
};

function mapUser(user: User) {
    return {
        id: user.id,
        username: user.email
    };
}