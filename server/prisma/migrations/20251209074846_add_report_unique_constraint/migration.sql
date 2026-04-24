/*
  Warnings:

  - A unique constraint covering the columns `[companyId,title]` on the table `CompanyReport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CompanyReport_companyId_title_key" ON "CompanyReport"("companyId", "title");
