/*
  Warnings:

  - Added the required column `size` to the `AppVolume` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppVolume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "containerMountPath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppVolume_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppVolume" ("appId", "containerMountPath", "createdAt", "id", "updatedAt") SELECT "appId", "containerMountPath", "createdAt", "id", "updatedAt" FROM "AppVolume";
DROP TABLE "AppVolume";
ALTER TABLE "new_AppVolume" RENAME TO "AppVolume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
