-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppDomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostname" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "useSsl" BOOLEAN NOT NULL DEFAULT true,
    "redirectHttps" BOOLEAN NOT NULL DEFAULT true,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppDomain_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppDomain" ("appId", "createdAt", "hostname", "id", "port", "updatedAt", "useSsl") SELECT "appId", "createdAt", "hostname", "id", "port", "updatedAt", "useSsl" FROM "AppDomain";
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
    CONSTRAINT "AppVolume_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AppVolume" ("accessMode", "appId", "containerMountPath", "createdAt", "id", "size", "updatedAt") SELECT "accessMode", "appId", "containerMountPath", "createdAt", "id", "size", "updatedAt" FROM "AppVolume";
DROP TABLE "AppVolume";
ALTER TABLE "new_AppVolume" RENAME TO "AppVolume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
