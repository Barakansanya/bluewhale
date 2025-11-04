-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ANALYST', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('FINANCIALS', 'CONSUMER_GOODS', 'INDUSTRIALS', 'TECHNOLOGY', 'HEALTHCARE', 'TELECOMMUNICATIONS', 'ENERGY', 'MATERIALS', 'UTILITIES', 'REAL_ESTATE', 'OTHER');

-- CreateEnum
CREATE TYPE "StatementType" AS ENUM ('ANNUAL', 'INTERIM', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'NEW_REPORT', 'EARNINGS_DATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "subscription" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "subscriptionEndsAt" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isin" TEXT,
    "jseCode" TEXT,
    "sector" "Sector" NOT NULL,
    "industry" TEXT,
    "marketCap" DECIMAL(15,2),
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "lastPrice" DECIMAL(10,2),
    "priceChange" DECIMAL(10,2),
    "priceChangePercent" DECIMAL(5,2),
    "volume" BIGINT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "listedDate" TIMESTAMP(3),
    "dataSource" TEXT,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialStatement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalPeriod" TEXT NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "statementType" "StatementType" NOT NULL,
    "revenue" DECIMAL(15,2),
    "costOfRevenue" DECIMAL(15,2),
    "grossProfit" DECIMAL(15,2),
    "operatingExpenses" DECIMAL(15,2),
    "ebitda" DECIMAL(15,2),
    "ebit" DECIMAL(15,2),
    "interestExpense" DECIMAL(15,2),
    "taxExpense" DECIMAL(15,2),
    "netIncome" DECIMAL(15,2),
    "totalAssets" DECIMAL(15,2),
    "currentAssets" DECIMAL(15,2),
    "totalLiabilities" DECIMAL(15,2),
    "currentLiabilities" DECIMAL(15,2),
    "totalEquity" DECIMAL(15,2),
    "cash" DECIMAL(15,2),
    "debt" DECIMAL(15,2),
    "operatingCashFlow" DECIMAL(15,2),
    "investingCashFlow" DECIMAL(15,2),
    "financingCashFlow" DECIMAL(15,2),
    "freeCashFlow" DECIMAL(15,2),
    "eps" DECIMAL(10,4),
    "bvps" DECIMAL(10,4),
    "dividendPerShare" DECIMAL(10,4),
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "sourceUrl" TEXT,
    "isAudited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMetrics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "peRatio" DECIMAL(10,2),
    "pbRatio" DECIMAL(10,2),
    "psRatio" DECIMAL(10,2),
    "evToEbitda" DECIMAL(10,2),
    "roe" DECIMAL(10,2),
    "roa" DECIMAL(10,2),
    "roic" DECIMAL(10,2),
    "grossMargin" DECIMAL(10,2),
    "operatingMargin" DECIMAL(10,2),
    "netMargin" DECIMAL(10,2),
    "currentRatio" DECIMAL(10,2),
    "quickRatio" DECIMAL(10,2),
    "debtToEquity" DECIMAL(10,2),
    "interestCoverage" DECIMAL(10,2),
    "dividendYield" DECIMAL(5,2),
    "payoutRatio" DECIMAL(5,2),
    "revenueGrowth" DECIMAL(10,2),
    "epsGrowth" DECIMAL(10,2),
    "asOfDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyReport" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "fiscalYear" INTEGER,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "summary" TEXT,
    "keyPoints" TEXT[],
    "sentiment" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Watchlist',
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "watchlistId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "targetPrice" DECIMAL(10,2),
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "type" "AlertType" NOT NULL,
    "threshold" DECIMAL(10,2),
    "message" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimentAnalysis" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sentiment" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "summary" TEXT,
    "keywords" TEXT[],
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentimentAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requestsPerDay" INTEGER NOT NULL DEFAULT 1000,
    "requestsUsedToday" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScraperJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScraperJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_subscription_idx" ON "User"("subscription");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Company_isin_key" ON "Company"("isin");

-- CreateIndex
CREATE INDEX "Company_ticker_idx" ON "Company"("ticker");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "Company_marketCap_idx" ON "Company"("marketCap");

-- CreateIndex
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");

-- CreateIndex
CREATE INDEX "FinancialStatement_companyId_fiscalYear_idx" ON "FinancialStatement"("companyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "FinancialStatement_periodEnd_idx" ON "FinancialStatement"("periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialStatement_companyId_fiscalYear_statementType_key" ON "FinancialStatement"("companyId", "fiscalYear", "statementType");

-- CreateIndex
CREATE INDEX "CompanyMetrics_companyId_asOfDate_idx" ON "CompanyMetrics"("companyId", "asOfDate");

-- CreateIndex
CREATE INDEX "CompanyMetrics_peRatio_idx" ON "CompanyMetrics"("peRatio");

-- CreateIndex
CREATE INDEX "CompanyMetrics_dividendYield_idx" ON "CompanyMetrics"("dividendYield");

-- CreateIndex
CREATE INDEX "CompanyReport_companyId_publishDate_idx" ON "CompanyReport"("companyId", "publishDate");

-- CreateIndex
CREATE INDEX "CompanyReport_reportType_idx" ON "CompanyReport"("reportType");

-- CreateIndex
CREATE INDEX "SavedReport_userId_idx" ON "SavedReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedReport_userId_reportId_key" ON "SavedReport"("userId", "reportId");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE INDEX "WatchlistItem_watchlistId_idx" ON "WatchlistItem"("watchlistId");

-- CreateIndex
CREATE INDEX "WatchlistItem_companyId_idx" ON "WatchlistItem"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_watchlistId_companyId_key" ON "WatchlistItem"("watchlistId", "companyId");

-- CreateIndex
CREATE INDEX "Alert_userId_isActive_idx" ON "Alert"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Alert_companyId_idx" ON "Alert"("companyId");

-- CreateIndex
CREATE INDEX "SentimentAnalysis_companyId_analyzedAt_idx" ON "SentimentAnalysis"("companyId", "analyzedAt");

-- CreateIndex
CREATE INDEX "SentimentAnalysis_sentiment_idx" ON "SentimentAnalysis"("sentiment");

-- CreateIndex
CREATE INDEX "NewsArticle_companyId_publishedAt_idx" ON "NewsArticle"("companyId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ScraperJob_status_idx" ON "ScraperJob"("status");

-- CreateIndex
CREATE INDEX "ScraperJob_jobType_idx" ON "ScraperJob"("jobType");

-- CreateIndex
CREATE INDEX "ScraperJob_createdAt_idx" ON "ScraperJob"("createdAt");

-- AddForeignKey
ALTER TABLE "FinancialStatement" ADD CONSTRAINT "FinancialStatement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMetrics" ADD CONSTRAINT "CompanyMetrics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyReport" ADD CONSTRAINT "CompanyReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CompanyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentAnalysis" ADD CONSTRAINT "SentimentAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
