/*
  Warnings:

  - You are about to drop the column `roleId` on the `RoleProjectPermission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - Added the required column `userGroupId` to the `RoleProjectPermission` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoleProjectPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userGroupId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createApps" BOOLEAN NOT NULL DEFAULT false,
    "deleteApps" BOOLEAN NOT NULL DEFAULT false,
    "writeApps" BOOLEAN NOT NULL DEFAULT false,
    "readApps" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleProjectPermission_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoleProjectPermission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoleProjectPermission" ("createApps", "createdAt", "deleteApps", "id", "projectId", "readApps", "updatedAt", "writeApps") SELECT "createApps", "createdAt", "deleteApps", "id", "projectId", "readApps", "updatedAt", "writeApps" FROM "RoleProjectPermission";
DROP TABLE "RoleProjectPermission";
ALTER TABLE "new_RoleProjectPermission" RENAME TO "RoleProjectPermission";
CREATE UNIQUE INDEX "RoleProjectPermission_userGroupId_projectId_key" ON "RoleProjectPermission"("userGroupId", "projectId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "password" TEXT NOT NULL,
    "twoFaSecret" TEXT,
    "twoFaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "userGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "twoFaEnabled", "twoFaSecret", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "twoFaEnabled", "twoFaSecret", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
