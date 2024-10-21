-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "AppDomain" (
    "hostname" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "useSsl" BOOLEAN NOT NULL DEFAULT true,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("hostname", "appId"),
    CONSTRAINT "AppDomain_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppVolume" (
    "containerMountPath" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("containerMountPath", "appId"),
    CONSTRAINT "AppVolume_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
