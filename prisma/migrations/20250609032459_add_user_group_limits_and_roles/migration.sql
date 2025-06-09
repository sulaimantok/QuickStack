-- AlterTable
ALTER TABLE "User" ADD COLUMN "maxCpu" INTEGER;
ALTER TABLE "User" ADD COLUMN "maxMemory" INTEGER;
ALTER TABLE "User" ADD COLUMN "maxStorage" INTEGER;

-- AlterTable
ALTER TABLE "UserGroup" ADD COLUMN "maxApps" INTEGER;
ALTER TABLE "UserGroup" ADD COLUMN "maxCpu" INTEGER;
ALTER TABLE "UserGroup" ADD COLUMN "maxMemory" INTEGER;
ALTER TABLE "UserGroup" ADD COLUMN "maxProjects" INTEGER;
ALTER TABLE "UserGroup" ADD COLUMN "roles" TEXT;

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
    "createProjects" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleProjectPermission_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoleProjectPermission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoleProjectPermission" ("createApps", "createdAt", "deleteApps", "id", "projectId", "readApps", "updatedAt", "userGroupId", "writeApps") SELECT "createApps", "createdAt", "deleteApps", "id", "projectId", "readApps", "updatedAt", "userGroupId", "writeApps" FROM "RoleProjectPermission";
DROP TABLE "RoleProjectPermission";
ALTER TABLE "new_RoleProjectPermission" RENAME TO "RoleProjectPermission";
CREATE UNIQUE INDEX "RoleProjectPermission_userGroupId_projectId_key" ON "RoleProjectPermission"("userGroupId", "projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
