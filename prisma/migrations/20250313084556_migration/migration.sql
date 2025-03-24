/*
  Warnings:

  - You are about to drop the column `canCreateNewApps` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `RoleAppPermission` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "RoleProjectPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createApps" BOOLEAN NOT NULL DEFAULT false,
    "deleteApps" BOOLEAN NOT NULL DEFAULT false,
    "writeApps" BOOLEAN NOT NULL DEFAULT false,
    "readApps" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleProjectPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoleProjectPermission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canAccessBackups" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Role" ("canAccessBackups", "createdAt", "description", "id", "name", "updatedAt") SELECT "canAccessBackups", "createdAt", "description", "id", "name", "updatedAt" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE TABLE "new_RoleAppPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "roleProjectPermissionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleAppPermission_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoleAppPermission_roleProjectPermissionId_fkey" FOREIGN KEY ("roleProjectPermissionId") REFERENCES "RoleProjectPermission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RoleAppPermission" ("appId", "createdAt", "id", "permission", "updatedAt") SELECT "appId", "createdAt", "id", "permission", "updatedAt" FROM "RoleAppPermission";
DROP TABLE "RoleAppPermission";
ALTER TABLE "new_RoleAppPermission" RENAME TO "RoleAppPermission";
CREATE UNIQUE INDEX "RoleAppPermission_roleProjectPermissionId_appId_key" ON "RoleAppPermission"("roleProjectPermissionId", "appId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RoleProjectPermission_roleId_projectId_key" ON "RoleProjectPermission"("roleId", "projectId");
