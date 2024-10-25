/*
  Warnings:

  - The primary key for the `AppDomain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AppVolume` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `AppDomain` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `AppVolume` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppDomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostname" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "useSsl" BOOLEAN NOT NULL DEFAULT true,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppDomain_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppDomain" ("appId", "createdAt", "hostname", "port", "updatedAt", "useSsl") SELECT "appId", "createdAt", "hostname", "port", "updatedAt", "useSsl" FROM "AppDomain";
DROP TABLE "AppDomain";
ALTER TABLE "new_AppDomain" RENAME TO "AppDomain";
CREATE TABLE "new_AppVolume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "containerMountPath" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppVolume_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppVolume" ("appId", "containerMountPath", "createdAt", "updatedAt") SELECT "appId", "containerMountPath", "createdAt", "updatedAt" FROM "AppVolume";
DROP TABLE "AppVolume";
ALTER TABLE "new_AppVolume" RENAME TO "AppVolume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
