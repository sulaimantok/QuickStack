/*
  Warnings:

  - You are about to drop the `AppPorts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `defaultPort` on the `App` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AppPorts_appId_port_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AppPorts";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AppPort" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppPort_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'GIT',
    "containerImageSource" TEXT,
    "gitUrl" TEXT,
    "gitBranch" TEXT,
    "gitUsername" TEXT,
    "gitToken" TEXT,
    "dockerfilePath" TEXT NOT NULL DEFAULT './Dockerfile',
    "replicas" INTEGER NOT NULL DEFAULT 1,
    "envVars" TEXT NOT NULL DEFAULT '',
    "memoryReservation" INTEGER,
    "memoryLimit" INTEGER,
    "cpuReservation" INTEGER,
    "cpuLimit" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "App_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_App" ("containerImageSource", "cpuLimit", "cpuReservation", "createdAt", "dockerfilePath", "envVars", "gitBranch", "gitToken", "gitUrl", "gitUsername", "id", "memoryLimit", "memoryReservation", "name", "projectId", "replicas", "sourceType", "updatedAt") SELECT "containerImageSource", "cpuLimit", "cpuReservation", "createdAt", "dockerfilePath", "envVars", "gitBranch", "gitToken", "gitUrl", "gitUsername", "id", "memoryLimit", "memoryReservation", "name", "projectId", "replicas", "sourceType", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AppPort_appId_port_key" ON "AppPort"("appId", "port");
