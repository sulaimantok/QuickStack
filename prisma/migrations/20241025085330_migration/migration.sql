/*
  Warnings:

  - A unique constraint covering the columns `[hostname]` on the table `AppDomain` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AppDomain_hostname_key" ON "AppDomain"("hostname");
