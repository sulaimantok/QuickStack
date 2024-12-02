/*
  Warnings:

  - A unique constraint covering the columns `[appId,containerMountPath]` on the table `AppVolume` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AppVolume_appId_containerMountPath_key" ON "AppVolume"("appId", "containerMountPath");
