/*
  Warnings:

  - Added the required column `containerImageSource` to the `App` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'GIT',
    "containerImageSource" TEXT NOT NULL,
    "gitUrl" TEXT NOT NULL,
    "gitBranch" TEXT NOT NULL,
    "gitUsername" TEXT,
    "gitToken" TEXT,
    "dockerfilePath" TEXT NOT NULL DEFAULT './Dockerfile',
    "replicas" INTEGER NOT NULL DEFAULT 1,
    "envVars" TEXT NOT NULL,
    "memoryReservation" INTEGER,
    "memoryLimit" INTEGER,
    "cpuReservation" INTEGER,
    "cpuLimit" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "App_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_App" ("cpuLimit", "cpuReservation", "createdAt", "dockerfilePath", "envVars", "gitBranch", "gitToken", "gitUrl", "gitUsername", "id", "memoryLimit", "memoryReservation", "name", "projectId", "replicas", "updatedAt") SELECT "cpuLimit", "cpuReservation", "createdAt", "dockerfilePath", "envVars", "gitBranch", "gitToken", "gitUrl", "gitUsername", "id", "memoryLimit", "memoryReservation", "name", "projectId", "replicas", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
