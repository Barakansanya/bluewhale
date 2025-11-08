-- CreateTable
CREATE TABLE "HistoricalPrice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricalPrice_companyId_date_idx" ON "HistoricalPrice"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalPrice_companyId_date_key" ON "HistoricalPrice"("companyId", "date");

-- AddForeignKey
ALTER TABLE "HistoricalPrice" ADD CONSTRAINT "HistoricalPrice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
