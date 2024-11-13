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
    "defaultPort" INTEGER NOT NULL DEFAULT 80,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "App_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_App" ("containerImageSource", "cpuLimit", "cpuReservation", "createdAt", "defaultPort", "dockerfilePath", "envVars", "gitBranch", "gitToken", "gitUrl", "gitUsername", "id", "memoryLimit", "memoryReservation", "name", "projectId", "replicas", "sourceType", "updatedAt") SELECT "containerImageSource", "cpuLimit", "cpuReservation", "createdAt", "defaultPort", "dockerfilePath", "envVars", "gitBranch", "gitToken", "gitUrl", "gitUsername", "id", "memoryLimit", "memoryReservation", "name", "projectId", "replicas", "sourceType", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
CREATE TABLE "new_AppDomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostname" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "useSsl" BOOLEAN NOT NULL DEFAULT true,
    "redirectHttps" BOOLEAN NOT NULL DEFAULT true,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppDomain_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AppDomain" ("appId", "createdAt", "hostname", "id", "port", "redirectHttps", "updatedAt", "useSsl") SELECT "appId", "createdAt", "hostname", "id", "port", "redirectHttps", "updatedAt", "useSsl" FROM "AppDomain";
DROP TABLE "AppDomain";
ALTER TABLE "new_AppDomain" RENAME TO "AppDomain";
CREATE UNIQUE INDEX "AppDomain_hostname_key" ON "AppDomain"("hostname");
CREATE TABLE "new_AppVolume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "containerMountPath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "accessMode" TEXT NOT NULL DEFAULT 'rwo',
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppVolume_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AppVolume" ("accessMode", "appId", "containerMountPath", "createdAt", "id", "size", "updatedAt") SELECT "accessMode", "appId", "containerMountPath", "createdAt", "id", "size", "updatedAt" FROM "AppVolume";
DROP TABLE "AppVolume";
ALTER TABLE "new_AppVolume" RENAME TO "AppVolume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
