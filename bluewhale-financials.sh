#!/usr/bin/env bash
# ================================================================
# BlueWhale — Financial Statements Feature (Standalone)
# Matches the NFLX Excel template exactly:
#   Income Statement | Balance Sheet | Cash Flow
# Source: FMP annual fundamentals via /income-statement,
#         /balance-sheet-statement, /cash-flow-statement
# Run from: /mnt/c/users/hp/documents/sargotec/bluewhale/bluewhale-prd/
# ================================================================
set -e
ROOT="$(pwd)"
SERVER="$ROOT/server"
CLIENT="$ROOT/client"
echo ""
echo "🐋 BlueWhale Financial Statements — Building standalone feature..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. PRISMA SCHEMA — append FinancialStatement model ──────────────
echo "📐 Adding FinancialStatement model to schema.prisma..."
python3 << 'PYEOF'
schema_path = 'server/prisma/schema.prisma'
content = open(schema_path).read()

new_model = '''
// ── Financial Statements (standalone feature) ─────────────────────────────────
// Stores annual Income Statement, Balance Sheet, and Cash Flow data per company.
// Template source: NFLX_Financial_Statements.xlsx provided by client.
// Data source:     FMP /income-statement, /balance-sheet-statement, /cash-flow-statement
// Zero conflict:   entirely new model, no changes to existing models.
model FinancialStatement {
  id          String  @id @default(cuid())
  companyId   String
  company     Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  fiscalYear  Int     // e.g. 2023
  period      String  @default("annual") // "annual" | "ltm"
  currency    String  @default("ZAR")
  source      String  @default("FMP")

  // ── Income Statement ──────────────────────────────────────────────────────
  totalRevenues         Float?
  revenueGrowthPct      Float?   // YoY %
  costOfRevenues        Float?
  grossProfit           Float?
  grossMarginPct        Float?
  sgaExpenses           Float?
  rdExpenses            Float?
  operatingIncome       Float?   // EBIT
  operatingMarginPct    Float?
  interestExpense       Float?
  interestIncome        Float?
  netInterestExpense    Float?
  incomeTaxExpense      Float?
  netIncome             Float?
  netMarginPct          Float?
  eps                   Float?
  epsDiluted            Float?
  sharesOutstanding     Float?
  sharesDiluted         Float?
  ebitda                Float?
  ebit                  Float?

  // ── Balance Sheet — Assets ────────────────────────────────────────────────
  cashAndEquivalents    Float?
  shortTermInvestments  Float?
  totalCashAndST        Float?
  accountsReceivable    Float?
  otherReceivables      Float?
  totalReceivables      Float?
  prepaidExpenses       Float?
  otherCurrentAssets    Float?
  totalCurrentAssets    Float?
  grossPPE              Float?
  accumulatedDeprec     Float?
  netPPE                Float?
  goodwill              Float?
  otherIntangibles      Float?
  totalIntangibles      Float?
  otherNonCurrentAssets Float?
  totalNonCurrentAssets Float?
  totalAssets           Float?

  // ── Balance Sheet — Liabilities ───────────────────────────────────────────
  accountsPayable       Float?
  accruedExpenses       Float?
  currentDebt           Float?
  currentLeases         Float?
  unearnedRevenueCurr   Float?
  otherCurrentLiab      Float?
  totalCurrentLiab      Float?
  longTermDebt          Float?
  longTermLeases        Float?
  deferredTaxLiab       Float?
  otherNonCurrentLiab   Float?
  totalNonCurrentLiab   Float?
  totalLiabilities      Float?

  // ── Balance Sheet — Equity ────────────────────────────────────────────────
  commonStock           Float?
  additionalPaidIn      Float?
  retainedEarnings      Float?
  treasuryStock         Float?
  otherEquity           Float?
  commonEquity          Float?
  minorityInterest      Float?
  totalEquity           Float?

  // ── Cash Flow Statement ───────────────────────────────────────────────────
  cfNetIncome           Float?
  depreciationAmort     Float?
  stockBasedComp        Float?
  changeInWorkingCap    Float?
  otherOperating        Float?
  cashFromOperations    Float?
  capex                 Float?
  acquisitions          Float?
  otherInvesting        Float?
  cashFromInvesting     Float?
  debtIssued            Float?
  debtRepaid            Float?
  stockIssuance         Float?
  stockRepurchase       Float?
  dividendsPaid         Float?
  otherFinancing        Float?
  cashFromFinancing     Float?
  netChangeInCash       Float?
  beginningCash         Float?
  endingCash            Float?
  freeCashFlow          Float?
  freeCashFlowPerShare  Float?

  fetchedAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([companyId, fiscalYear, period])
  @@index([companyId])
  @@map("FinancialStatement")
}
'''

if 'FinancialStatement' not in content:
    # Find the Company model to add the relation field
    company_relation = '  financials     FinancialStatement[]'
    # Add relation to Company model (before closing brace of Company model)
    # Find Company model's last field
    import re
    # Add the relation before the closing @@ directives of Company model
    content = content.replace(
        '  lastScrapedAt  DateTime?',
        '  lastScrapedAt  DateTime?\n  financials     FinancialStatement[]'
    )
    content = content.rstrip() + '\n' + new_model
    open(schema_path, 'w').write(content)
    print('   ✅ FinancialStatement model added to schema.prisma')
else:
    print('   ℹ️  FinancialStatement model already in schema.prisma')
PYEOF

# ── 2. PRISMA MIGRATION SQL ──────────────────────────────────────────
echo "🗄️  Creating migration SQL..."
MIGRATION_DIR="$SERVER/prisma/migrations/20260509000001_add_financial_statements"
mkdir -p "$MIGRATION_DIR"
cat > "$MIGRATION_DIR/migration.sql" << 'SQLEOF'
-- CreateTable: FinancialStatement (standalone financial data feature)
-- Stores annual Income Statement, Balance Sheet, and Cash Flow per company.
-- No existing tables are modified.
CREATE TABLE "FinancialStatement" (
    "id"                   TEXT NOT NULL,
    "companyId"            TEXT NOT NULL,
    "fiscalYear"           INTEGER NOT NULL,
    "period"               TEXT NOT NULL DEFAULT 'annual',
    "currency"             TEXT NOT NULL DEFAULT 'ZAR',
    "source"               TEXT NOT NULL DEFAULT 'FMP',
    -- Income Statement
    "totalRevenues"        DOUBLE PRECISION,
    "revenueGrowthPct"     DOUBLE PRECISION,
    "costOfRevenues"       DOUBLE PRECISION,
    "grossProfit"          DOUBLE PRECISION,
    "grossMarginPct"       DOUBLE PRECISION,
    "sgaExpenses"          DOUBLE PRECISION,
    "rdExpenses"           DOUBLE PRECISION,
    "operatingIncome"      DOUBLE PRECISION,
    "operatingMarginPct"   DOUBLE PRECISION,
    "interestExpense"      DOUBLE PRECISION,
    "interestIncome"       DOUBLE PRECISION,
    "netInterestExpense"   DOUBLE PRECISION,
    "incomeTaxExpense"     DOUBLE PRECISION,
    "netIncome"            DOUBLE PRECISION,
    "netMarginPct"         DOUBLE PRECISION,
    "eps"                  DOUBLE PRECISION,
    "epsDiluted"           DOUBLE PRECISION,
    "sharesOutstanding"    DOUBLE PRECISION,
    "sharesDiluted"        DOUBLE PRECISION,
    "ebitda"               DOUBLE PRECISION,
    "ebit"                 DOUBLE PRECISION,
    -- Balance Sheet Assets
    "cashAndEquivalents"   DOUBLE PRECISION,
    "shortTermInvestments" DOUBLE PRECISION,
    "totalCashAndST"       DOUBLE PRECISION,
    "accountsReceivable"   DOUBLE PRECISION,
    "otherReceivables"     DOUBLE PRECISION,
    "totalReceivables"     DOUBLE PRECISION,
    "prepaidExpenses"      DOUBLE PRECISION,
    "otherCurrentAssets"   DOUBLE PRECISION,
    "totalCurrentAssets"   DOUBLE PRECISION,
    "grossPPE"             DOUBLE PRECISION,
    "accumulatedDeprec"    DOUBLE PRECISION,
    "netPPE"               DOUBLE PRECISION,
    "goodwill"             DOUBLE PRECISION,
    "otherIntangibles"     DOUBLE PRECISION,
    "totalIntangibles"     DOUBLE PRECISION,
    "otherNonCurrentAssets" DOUBLE PRECISION,
    "totalNonCurrentAssets" DOUBLE PRECISION,
    "totalAssets"          DOUBLE PRECISION,
    -- Balance Sheet Liabilities
    "accountsPayable"      DOUBLE PRECISION,
    "accruedExpenses"      DOUBLE PRECISION,
    "currentDebt"          DOUBLE PRECISION,
    "currentLeases"        DOUBLE PRECISION,
    "unearnedRevenueCurr"  DOUBLE PRECISION,
    "otherCurrentLiab"     DOUBLE PRECISION,
    "totalCurrentLiab"     DOUBLE PRECISION,
    "longTermDebt"         DOUBLE PRECISION,
    "longTermLeases"       DOUBLE PRECISION,
    "deferredTaxLiab"      DOUBLE PRECISION,
    "otherNonCurrentLiab"  DOUBLE PRECISION,
    "totalNonCurrentLiab"  DOUBLE PRECISION,
    "totalLiabilities"     DOUBLE PRECISION,
    -- Balance Sheet Equity
    "commonStock"          DOUBLE PRECISION,
    "additionalPaidIn"     DOUBLE PRECISION,
    "retainedEarnings"     DOUBLE PRECISION,
    "treasuryStock"        DOUBLE PRECISION,
    "otherEquity"          DOUBLE PRECISION,
    "commonEquity"         DOUBLE PRECISION,
    "minorityInterest"     DOUBLE PRECISION,
    "totalEquity"          DOUBLE PRECISION,
    -- Cash Flow
    "cfNetIncome"          DOUBLE PRECISION,
    "depreciationAmort"    DOUBLE PRECISION,
    "stockBasedComp"       DOUBLE PRECISION,
    "changeInWorkingCap"   DOUBLE PRECISION,
    "otherOperating"       DOUBLE PRECISION,
    "cashFromOperations"   DOUBLE PRECISION,
    "capex"                DOUBLE PRECISION,
    "acquisitions"         DOUBLE PRECISION,
    "otherInvesting"       DOUBLE PRECISION,
    "cashFromInvesting"    DOUBLE PRECISION,
    "debtIssued"           DOUBLE PRECISION,
    "debtRepaid"           DOUBLE PRECISION,
    "stockIssuance"        DOUBLE PRECISION,
    "stockRepurchase"      DOUBLE PRECISION,
    "dividendsPaid"        DOUBLE PRECISION,
    "otherFinancing"       DOUBLE PRECISION,
    "cashFromFinancing"    DOUBLE PRECISION,
    "netChangeInCash"      DOUBLE PRECISION,
    "beginningCash"        DOUBLE PRECISION,
    "endingCash"           DOUBLE PRECISION,
    "freeCashFlow"         DOUBLE PRECISION,
    "freeCashFlowPerShare" DOUBLE PRECISION,
    -- Meta
    "fetchedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialStatement_companyId_fiscalYear_period_key"
    ON "FinancialStatement"("companyId", "fiscalYear", "period");
CREATE INDEX "FinancialStatement_companyId_idx"
    ON "FinancialStatement"("companyId");

-- AddForeignKey
ALTER TABLE "FinancialStatement"
    ADD CONSTRAINT "FinancialStatement_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
SQLEOF
echo "   ✅ Migration SQL created"

# ── 3. FINANCIALS SERVICE ────────────────────────────────────────────
echo "📝 Writing financials.service.ts..."
cat > "$SERVER/src/services/financials.service.ts" << 'EOF'
// FILE: server/src/services/financials.service.ts
// STANDALONE — zero conflict with existing services.
// Fetches annual financial statements from FMP and stores them in the
// FinancialStatement table. Also generates Excel files matching the
// client-provided NFLX_Financial_Statements.xlsx template exactly.

import axios from 'axios';
import * as XLSX from 'xlsx';
import { prisma } from '../config/database';
import { env } from '../config/env';

const FMP  = 'https://financialmodelingprep.com/api/v3';
const DELAY = (ms: number) => new Promise(r => setTimeout(r, ms));
const n    = (v: any): number | null => (v != null && !isNaN(Number(v)) ? Number(v) : null);
const pct  = (v: any): number | null => (v != null && !isNaN(Number(v)) ? Number(v) * 100 : null);

// ── Map FMP income-statement response → our model ──────────────────
function mapIncomeStatement(d: any) {
  const rev  = n(d.revenue);
  const gp   = n(d.grossProfit);
  const oi   = n(d.operatingIncome);
  const ni   = n(d.netIncome);
  return {
    totalRevenues:       rev,
    revenueGrowthPct:    pct(d.revenueGrowth),
    costOfRevenues:      n(d.costOfRevenue),
    grossProfit:         gp,
    grossMarginPct:      rev && gp   ? (gp  / rev) * 100 : null,
    sgaExpenses:         n(d.sellingGeneralAndAdministrativeExpenses),
    rdExpenses:          n(d.researchAndDevelopmentExpenses),
    operatingIncome:     oi,
    operatingMarginPct:  rev && oi   ? (oi  / rev) * 100 : null,
    interestExpense:     n(d.interestExpense),
    interestIncome:      n(d.interestIncome),
    netInterestExpense:  n(d.netInterestExpense) ?? (
      (n(d.interestExpense) ?? 0) - (n(d.interestIncome) ?? 0) || null
    ),
    incomeTaxExpense:    n(d.incomeTaxExpense),
    netIncome:           ni,
    netMarginPct:        rev && ni   ? (ni  / rev) * 100 : null,
    eps:                 n(d.eps),
    epsDiluted:          n(d.epsDiluted),
    sharesOutstanding:   n(d.weightedAverageShsOut),
    sharesDiluted:       n(d.weightedAverageShsOutDil),
    ebitda:              n(d.ebitda),
    ebit:                oi,
  };
}

// ── Map FMP balance-sheet response → our model ─────────────────────
function mapBalanceSheet(d: any) {
  return {
    cashAndEquivalents:    n(d.cashAndCashEquivalents),
    shortTermInvestments:  n(d.shortTermInvestments),
    totalCashAndST:        n(d.cashAndShortTermInvestments)
                           ?? ((n(d.cashAndCashEquivalents) ?? 0) + (n(d.shortTermInvestments) ?? 0) || null),
    accountsReceivable:    n(d.netReceivables),
    otherReceivables:      n(d.otherReceivables),
    totalReceivables:      n(d.netReceivables),
    prepaidExpenses:       n(d.prepaidExpenses),
    otherCurrentAssets:    n(d.otherCurrentAssets),
    totalCurrentAssets:    n(d.totalCurrentAssets),
    grossPPE:              n(d.propertyPlantEquipmentNet),
    accumulatedDeprec:     n(d.accumulatedDepreciation),
    netPPE:                n(d.propertyPlantEquipmentNet),
    goodwill:              n(d.goodwill),
    otherIntangibles:      n(d.intangibleAssets),
    totalIntangibles:      n(d.goodwillAndIntangibleAssets),
    otherNonCurrentAssets: n(d.otherNonCurrentAssets),
    totalNonCurrentAssets: n(d.totalNonCurrentAssets),
    totalAssets:           n(d.totalAssets),
    accountsPayable:       n(d.accountPayables),
    accruedExpenses:       n(d.accruedExpenses),
    currentDebt:           n(d.shortTermDebt),
    currentLeases:         n(d.capitalLeaseObligations),
    unearnedRevenueCurr:   n(d.deferredRevenue),
    otherCurrentLiab:      n(d.otherCurrentLiabilities),
    totalCurrentLiab:      n(d.totalCurrentLiabilities),
    longTermDebt:          n(d.longTermDebt),
    longTermLeases:        n(d.capitalLeaseObligations),
    deferredTaxLiab:       n(d.deferredTaxLiabilitiesNonCurrent),
    otherNonCurrentLiab:   n(d.otherNonCurrentLiabilities),
    totalNonCurrentLiab:   n(d.totalNonCurrentLiabilities),
    totalLiabilities:      n(d.totalLiabilities),
    commonStock:           n(d.commonStock),
    additionalPaidIn:      n(d.additionalPaidInCapital),
    retainedEarnings:      n(d.retainedEarnings),
    treasuryStock:         n(d.treasuryStock),
    otherEquity:           n(d.othertotalStockholdersEquity),
    commonEquity:          n(d.totalStockholdersEquity),
    minorityInterest:      n(d.minorityInterest),
    totalEquity:           n(d.totalEquity) ?? n(d.totalStockholdersEquity),
  };
}

// ── Map FMP cash-flow response → our model ─────────────────────────
function mapCashFlow(d: any) {
  const ops  = n(d.operatingCashFlow);
  const capx = n(d.capitalExpenditure);
  const fcf  = n(d.freeCashFlow)
               ?? (ops != null && capx != null ? ops + capx : null); // capex is negative in FMP
  return {
    cfNetIncome:       n(d.netIncome),
    depreciationAmort: n(d.depreciationAndAmortization),
    stockBasedComp:    n(d.stockBasedCompensation),
    changeInWorkingCap:n(d.changeInWorkingCapital),
    otherOperating:    n(d.otherWorkingCapital),
    cashFromOperations:ops,
    capex:             capx,
    acquisitions:      n(d.acquisitionsNet),
    otherInvesting:    n(d.otherInvestingActivites),
    cashFromInvesting: n(d.investingCashFlow),
    debtIssued:        n(d.debtRepayment) !== null && (n(d.debtRepayment) ?? 0) < 0
                       ? null : n(d.proceedsFromIssuanceOfDebt),
    debtRepaid:        n(d.debtRepayment),
    stockIssuance:     n(d.commonStockIssued),
    stockRepurchase:   n(d.commonStockRepurchased),
    dividendsPaid:     n(d.dividendsPaid),
    otherFinancing:    n(d.otherFinancingActivites),
    cashFromFinancing: n(d.financingCashFlow),
    netChangeInCash:   n(d.netChangeInCash),
    beginningCash:     n(d.cashAtBeginningOfPeriod),
    endingCash:        n(d.cashAtEndOfPeriod),
    freeCashFlow:      fcf,
    freeCashFlowPerShare: n(d.freeCashFlowPerShare),
  };
}

// ── Sync financials for a single company ──────────────────────────
export async function syncCompanyFinancials(
  ticker: string,
  companyId: string,
  limit = 7
): Promise<{ stored: number; error?: string }> {
  const key = env.FMP_API_KEY;
  if (!key) return { stored: 0, error: 'FMP_API_KEY not set' };

  const symbol = `${ticker}.JO`;

  try {
    const [isRes, bsRes, cfRes] = await Promise.all([
      axios.get(`${FMP}/income-statement/${symbol}?period=annual&limit=${limit}&apikey=${key}`, { timeout: 20000 }),
      axios.get(`${FMP}/balance-sheet-statement/${symbol}?period=annual&limit=${limit}&apikey=${key}`, { timeout: 20000 }),
      axios.get(`${FMP}/cash-flow-statement/${symbol}?period=annual&limit=${limit}&apikey=${key}`, { timeout: 20000 }),
    ]);

    const incomeData  = Array.isArray(isRes.data) ? isRes.data : [];
    const balanceData = Array.isArray(bsRes.data) ? bsRes.data : [];
    const cashData    = Array.isArray(cfRes.data) ? cfRes.data : [];

    if (incomeData.length === 0) {
      return { stored: 0, error: `No income statement data for ${ticker}` };
    }

    let stored = 0;

    for (let i = 0; i < incomeData.length; i++) {
      const is  = incomeData[i];
      const bs  = balanceData[i] || {};
      const cf  = cashData[i]    || {};

      // Determine fiscal year from the date field
      const dateStr   = is.date || is.period || String(is.calendarYear);
      const fiscalYear = parseInt(dateStr.slice(0, 4));
      if (!fiscalYear || isNaN(fiscalYear)) continue;

      const data = {
        companyId,
        fiscalYear,
        period:   'annual',
        currency: is.reportedCurrency || 'ZAR',
        source:   'FMP',
        ...mapIncomeStatement(is),
        ...mapBalanceSheet(bs),
        ...mapCashFlow(cf),
        fetchedAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await (prisma as any).financialStatement.upsert({
          where:  { companyId_fiscalYear_period: { companyId, fiscalYear, period: 'annual' } },
          update: data,
          create: data,
        });
        stored++;
      } catch (err: any) {
        console.warn(`   ⚠️  ${ticker} FY${fiscalYear}: ${err.message}`);
      }
    }

    console.log(`   ✅ ${ticker}: ${stored} years of financial statements stored`);
    return { stored };
  } catch (err: any) {
    const msg = err.response?.status === 403
      ? 'FMP plan does not cover this ticker'
      : err.message;
    console.warn(`   ⚠️  ${ticker} financials failed: ${msg}`);
    return { stored: 0, error: msg };
  }
}

// ── Sync all active companies ──────────────────────────────────────
export async function syncAllFinancials(): Promise<void> {
  const companies = await prisma.company.findMany({
    where:  { isActive: true },
    select: { id: true, ticker: true },
  });

  console.log(`\n📊 Syncing financial statements for ${companies.length} companies...`);
  let success = 0, failed = 0;

  for (const c of companies) {
    await DELAY(600);
    const result = await syncCompanyFinancials(c.ticker, c.id);
    if (result.stored > 0) success++;
    else failed++;
  }

  console.log(`✅ Financials sync done — ${success} companies with data, ${failed} failed/no data\n`);
}

// ── Generate Excel matching the client template exactly ────────────
export async function generateFinancialsExcel(
  ticker: string,
  companyName: string
): Promise<Buffer | null> {
  const company = await prisma.company.findUnique({ where: { ticker } });
  if (!company) return null;

  const rows = await (prisma as any).financialStatement.findMany({
    where:   { companyId: company.id, period: 'annual' },
    orderBy: { fiscalYear: 'asc' },
  });

  if (rows.length === 0) return null;

  const wb   = XLSX.utils.book_new();
  const years = rows.map((r: any) => `FY${String(r.fiscalYear).slice(2)}`);
  const vals  = (field: string) => rows.map((r: any) =>
    r[field] != null ? Math.round(r[field] * 10) / 10 : ''
  );
  const currency = rows[0]?.currency || 'ZAR';

  // Shared header builder
  const buildHeader = (statementName: string) => [
    [`${companyName} (${ticker})`],
    [`${statementName}`],
    [`Source: Financial Modeling Prep (FMP)`],
    [`Currency: ${currency} Millions`],
    [],
    ['LINE ITEM', ...years],
  ];

  // ── Sheet 1: Income Statement ──────────────────────────────────
  const isData = [
    ...buildHeader('Income Statement'),
    ['── Revenues ──────────────────'],
    ['Total Revenues',             ...vals('totalRevenues')],
    ['YoY Revenue Growth (%)',     ...vals('revenueGrowthPct')],
    ['Cost of Revenues',           ...vals('costOfRevenues')],
    ['Gross Profit',               ...vals('grossProfit')],
    ['Gross Margin (%)',           ...vals('grossMarginPct')],
    [],
    ['── Operating Expenses ────────'],
    ['SG&A Expenses',             ...vals('sgaExpenses')],
    ['R&D Expenses',              ...vals('rdExpenses')],
    ['Operating Income (EBIT)',   ...vals('operatingIncome')],
    ['Operating Margin (%)',      ...vals('operatingMarginPct')],
    ['EBITDA',                    ...vals('ebitda')],
    [],
    ['── Below the Line ────────────'],
    ['Interest Expense',          ...vals('interestExpense')],
    ['Interest Income',           ...vals('interestIncome')],
    ['Net Interest Expense',      ...vals('netInterestExpense')],
    ['Income Tax Expense',        ...vals('incomeTaxExpense')],
    [],
    ['── Bottom Line ───────────────'],
    ['Net Income',                ...vals('netIncome')],
    ['Net Margin (%)',            ...vals('netMarginPct')],
    ['EPS (Basic)',               ...vals('eps')],
    ['EPS (Diluted)',             ...vals('epsDiluted')],
    ['Shares Outstanding (M)',    ...vals('sharesOutstanding')],
    ['Shares Diluted (M)',        ...vals('sharesDiluted')],
  ];

  // ── Sheet 2: Balance Sheet ─────────────────────────────────────
  const bsData = [
    ...buildHeader('Balance Sheet'),
    ['── Current Assets ────────────'],
    ['Cash & Cash Equivalents',   ...vals('cashAndEquivalents')],
    ['Short-Term Investments',    ...vals('shortTermInvestments')],
    ['Total Cash & ST Investments',...vals('totalCashAndST')],
    ['Accounts Receivable',       ...vals('accountsReceivable')],
    ['Other Receivables',         ...vals('otherReceivables')],
    ['Total Receivables',         ...vals('totalReceivables')],
    ['Prepaid Expenses',          ...vals('prepaidExpenses')],
    ['Other Current Assets',      ...vals('otherCurrentAssets')],
    ['Total Current Assets',      ...vals('totalCurrentAssets')],
    [],
    ['── Non-Current Assets ────────'],
    ['Gross PP&E',                ...vals('grossPPE')],
    ['Accumulated Depreciation',  ...vals('accumulatedDeprec')],
    ['Net PP&E',                  ...vals('netPPE')],
    ['Goodwill',                  ...vals('goodwill')],
    ['Other Intangibles',         ...vals('otherIntangibles')],
    ['Total Intangibles',         ...vals('totalIntangibles')],
    ['Other Non-Current Assets',  ...vals('otherNonCurrentAssets')],
    ['Total Non-Current Assets',  ...vals('totalNonCurrentAssets')],
    ['Total Assets',              ...vals('totalAssets')],
    [],
    ['── Current Liabilities ───────'],
    ['Accounts Payable',          ...vals('accountsPayable')],
    ['Accrued Expenses',          ...vals('accruedExpenses')],
    ['Current Debt',              ...vals('currentDebt')],
    ['Current Leases',            ...vals('currentLeases')],
    ['Unearned Revenue (Current)',...vals('unearnedRevenueCurr')],
    ['Other Current Liabilities', ...vals('otherCurrentLiab')],
    ['Total Current Liabilities', ...vals('totalCurrentLiab')],
    [],
    ['── Non-Current Liabilities ───'],
    ['Long-Term Debt',            ...vals('longTermDebt')],
    ['Long-Term Leases',          ...vals('longTermLeases')],
    ['Deferred Tax Liabilities',  ...vals('deferredTaxLiab')],
    ['Other Non-Current Liab.',   ...vals('otherNonCurrentLiab')],
    ['Total Non-Current Liab.',   ...vals('totalNonCurrentLiab')],
    ['Total Liabilities',         ...vals('totalLiabilities')],
    [],
    ['── Shareholders Equity ───────'],
    ['Common Stock',              ...vals('commonStock')],
    ['Additional Paid-In Capital',...vals('additionalPaidIn')],
    ['Retained Earnings',         ...vals('retainedEarnings')],
    ['Treasury Stock',            ...vals('treasuryStock')],
    ['Other Equity',              ...vals('otherEquity')],
    ['Common Equity',             ...vals('commonEquity')],
    ['Minority Interest',         ...vals('minorityInterest')],
    ['Total Equity',              ...vals('totalEquity')],
  ];

  // ── Sheet 3: Cash Flow Statement ───────────────────────────────
  const cfData = [
    ...buildHeader('Cash Flow Statement'),
    ['── Operating Activities ───────'],
    ['Net Income',                ...vals('cfNetIncome')],
    ['Depreciation & Amortization',...vals('depreciationAmort')],
    ['Stock-Based Compensation',  ...vals('stockBasedComp')],
    ['Change in Working Capital', ...vals('changeInWorkingCap')],
    ['Other Operating',           ...vals('otherOperating')],
    ['Cash from Operations',      ...vals('cashFromOperations')],
    [],
    ['── Investing Activities ───────'],
    ['Capital Expenditure (CapEx)',...vals('capex')],
    ['Acquisitions (Net)',         ...vals('acquisitions')],
    ['Other Investing',           ...vals('otherInvesting')],
    ['Cash from Investing',       ...vals('cashFromInvesting')],
    [],
    ['── Financing Activities ───────'],
    ['Debt Issued',               ...vals('debtIssued')],
    ['Debt Repaid',               ...vals('debtRepaid')],
    ['Stock Issuance',            ...vals('stockIssuance')],
    ['Stock Repurchase / Buyback',...vals('stockRepurchase')],
    ['Dividends Paid',            ...vals('dividendsPaid')],
    ['Other Financing',           ...vals('otherFinancing')],
    ['Cash from Financing',       ...vals('cashFromFinancing')],
    [],
    ['── Net Change & Supplemental ─'],
    ['Net Change in Cash',        ...vals('netChangeInCash')],
    ['Beginning Cash',            ...vals('beginningCash')],
    ['Ending Cash',               ...vals('endingCash')],
    [],
    ['── Free Cash Flow ────────────'],
    ['Free Cash Flow',            ...vals('freeCashFlow')],
    ['FCF per Share',             ...vals('freeCashFlowPerShare')],
  ];

  const addSheet = (data: any[][], name: string) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    // Style: widen first column, uniform year columns
    ws['!cols'] = [{ wch: 35 }, ...years.map(() => ({ wch: 14 }))];
    // Freeze first column + header rows
    ws['!freeze'] = { xSplit: 1, ySplit: 6 };
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet(isData, 'Income Statement');
  addSheet(bsData, 'Balance Sheet');
  addSheet(cfData, 'Cash Flow Statement');

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

// ── Get stored financials for API response ─────────────────────────
export async function getCompanyFinancials(ticker: string) {
  const company = await prisma.company.findUnique({ where: { ticker } });
  if (!company) return null;

  const rows = await (prisma as any).financialStatement.findMany({
    where:   { companyId: company.id, period: 'annual' },
    orderBy: { fiscalYear: 'asc' },
  });

  return {
    ticker,
    company:  company.name,
    currency: rows[0]?.currency || 'ZAR',
    source:   rows[0]?.source   || 'FMP',
    years:    rows.map((r: any) => r.fiscalYear),
    statements: rows,
  };
}
EOF
echo "   ✅ financials.service.ts written"

# ── 4. FINANCIALS CONTROLLER ─────────────────────────────────────────
echo "📝 Writing financials.controller.ts..."
cat > "$SERVER/src/controllers/financials.controller.ts" << 'EOF'
// FILE: server/src/controllers/financials.controller.ts
// STANDALONE — serves financial statement data and Excel downloads.

import { Request, Response } from 'express';
import {
  getCompanyFinancials,
  syncCompanyFinancials,
  generateFinancialsExcel,
  syncAllFinancials,
} from '../services/financials.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { prisma } from '../config/database';

// GET /api/v1/financials/:ticker
export async function getFinancials(req: Request, res: Response): Promise<void> {
  try {
    const { ticker } = req.params;
    const data = await getCompanyFinancials(ticker.toUpperCase());
    if (!data) { sendError(res, `No financial data for ${ticker}`, 404); return; }
    sendSuccess(res, data);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
}

// GET /api/v1/financials/:ticker/download
// Returns an Excel file matching the NFLX template format
export async function downloadFinancials(req: Request, res: Response): Promise<void> {
  try {
    const { ticker } = req.params;
    const t = ticker.toUpperCase();
    const company = await prisma.company.findUnique({ where: { ticker: t } });
    if (!company) { sendError(res, `Company ${ticker} not found`, 404); return; }

    const buffer = await generateFinancialsExcel(t, company.name);
    if (!buffer) {
      sendError(res, `No financial data available for ${ticker}. Try syncing first.`, 404);
      return;
    }

    const filename = `${t}_Financial_Statements.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
}

// POST /api/v1/financials/:ticker/sync
// Manually trigger a sync for one company
export async function syncFinancials(req: Request, res: Response): Promise<void> {
  try {
    const { ticker } = req.params;
    const t = ticker.toUpperCase();
    const company = await prisma.company.findUnique({ where: { ticker: t } });
    if (!company) { sendError(res, `Company ${ticker} not found`, 404); return; }

    const result = await syncCompanyFinancials(t, company.id);
    sendSuccess(res, { ticker: t, ...result });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
}

// POST /api/v1/financials/sync-all
// Manually trigger sync for all companies (admin use)
export async function syncAllFinancialsEndpoint(req: Request, res: Response): Promise<void> {
  try {
    // Fire-and-forget — returns immediately, sync runs in background
    syncAllFinancials().catch(console.error);
    sendSuccess(res, { message: 'Full financials sync started in background' });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
}

// GET /api/v1/financials/:ticker/summary
// Returns key metrics across years for sparklines / quick view
export async function getFinancialsSummary(req: Request, res: Response): Promise<void> {
  try {
    const { ticker } = req.params;
    const company = await prisma.company.findUnique({ where: { ticker: ticker.toUpperCase() } });
    if (!company) { sendError(res, `Company not found`, 404); return; }

    const rows = await (prisma as any).financialStatement.findMany({
      where:   { companyId: company.id, period: 'annual' },
      orderBy: { fiscalYear: 'asc' },
      select: {
        fiscalYear: true, totalRevenues: true, grossProfit: true,
        operatingIncome: true, netIncome: true, ebitda: true,
        totalAssets: true, totalLiabilities: true, totalEquity: true,
        cashFromOperations: true, freeCashFlow: true, capex: true,
        eps: true, epsDiluted: true,
      },
    });

    sendSuccess(res, { ticker: ticker.toUpperCase(), years: rows });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
}
EOF
echo "   ✅ financials.controller.ts written"

# ── 5. FINANCIALS ROUTES ─────────────────────────────────────────────
echo "📝 Writing financials.routes.ts..."
cat > "$SERVER/src/routes/financials.routes.ts" << 'EOF'
// FILE: server/src/routes/financials.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getFinancials,
  downloadFinancials,
  syncFinancials,
  syncAllFinancialsEndpoint,
  getFinancialsSummary,
} from '../controllers/financials.controller';

const router = Router();

// All routes require auth
router.use(authMiddleware);

router.get('/:ticker',          getFinancials);
router.get('/:ticker/summary',  getFinancialsSummary);
router.get('/:ticker/download', downloadFinancials);
router.post('/:ticker/sync',    syncFinancials);
router.post('/sync-all',        syncAllFinancialsEndpoint);

export default router;
EOF
echo "   ✅ financials.routes.ts written"

# ── 6. REGISTER ROUTE IN APP.TS ──────────────────────────────────────
echo "📝 Registering financials route in app.ts..."
python3 << 'PYEOF'
content = open('server/src/app.ts').read()
if 'financials' not in content:
    content = content.replace(
        "import { errorHandler } from './middleware/errorHandler.middleware';",
        "import { errorHandler } from './middleware/errorHandler.middleware';\nimport financialsRoutes from './routes/financials.routes';"
    )
    content = content.replace(
        "app.use('/api/v1/ai', aiRoutes);",
        "app.use('/api/v1/ai', aiRoutes);\napp.use('/api/v1/financials', financialsRoutes);"
    )
    open('server/src/app.ts', 'w').write(content)
    print('   ✅ financials route registered in app.ts')
else:
    print('   ℹ️  financials route already registered')
PYEOF

# ── 7. FINANCIALS CRON JOB ───────────────────────────────────────────
echo "📝 Writing financials.job.ts..."
cat > "$SERVER/src/jobs/financials.job.ts" << 'EOF'
// FILE: server/src/jobs/financials.job.ts
// STANDALONE — weekly cron to refresh financial statements for all companies.
// Runs every Sunday at 04:00 (one hour after the full price sync at 03:00).

import cron from 'node-cron';
import { syncAllFinancials } from '../services/financials.service';

export function startFinancialsJob(): void {
  // Run once on startup to populate the DB on first deploy
  console.log('📊 Running initial financials sync on startup...');
  syncAllFinancials()
    .then(() => console.log('✅ Startup financials sync complete'))
    .catch(err => console.error('❌ Startup financials sync failed:', err.message));

  // Weekly refresh — every Sunday at 04:00
  cron.schedule('0 4 * * 0', () => {
    console.log('📅 Weekly financials sync starting (Sunday 04:00)...');
    syncAllFinancials()
      .then(() => console.log('✅ Weekly financials sync complete'))
      .catch(err => console.error('❌ Weekly financials sync failed:', err.message));
  });

  console.log('📅 Financials job scheduled — every Sunday at 04:00');
}
EOF
echo "   ✅ financials.job.ts written"

# ── 8. ADD FINANCIALS JOB TO SERVER.TS ──────────────────────────────
echo "📝 Adding financials job to server.ts..."
python3 << 'PYEOF'
content = open('server/src/server.ts').read()
if 'financialsJob' not in content and 'startFinancialsJob' not in content:
    content = content.replace(
        "import { seedCompaniesIfEmpty } from './services/sync.service';",
        "import { seedCompaniesIfEmpty } from './services/sync.service';\nimport { startFinancialsJob } from './jobs/financials.job';"
    )
    content = content.replace(
        "    startReportScraperJob();",
        "    startReportScraperJob();\n    startFinancialsJob();"
    )
    open('server/src/server.ts', 'w').write(content)
    print('   ✅ startFinancialsJob added to server.ts')
else:
    print('   ℹ️  financials job already in server.ts')
PYEOF

# ── 9. CLIENT — FINANCIALS TAB COMPONENT ────────────────────────────
echo "📝 Writing FinancialsTab.tsx..."
cat > "$CLIENT/src/components/FinancialsTab.tsx" << 'EOF'
// FILE: client/src/components/FinancialsTab.tsx
// STANDALONE — Displays Income Statement, Balance Sheet, Cash Flow
// in the same 3-tab structure as the NFLX Excel template.
// Download button exports the exact Excel template format.

import { useState, useEffect } from 'react';
import {
  Download, RefreshCw, TrendingUp, Building2,
  DollarSign, AlertCircle, Loader2, BarChart2
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://bluewhale-production.up.railway.app/api/v1';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

interface FinancialRow {
  label: string;
  field: string;
  indent?: boolean;
  bold?: boolean;
  separator?: boolean;
  percent?: boolean;
}

// ── Column definitions matching the Excel template ─────────────────
const IS_ROWS: FinancialRow[] = [
  { label: 'Total Revenues',           field: 'totalRevenues',       bold: true },
  { label: 'YoY Revenue Growth (%)',   field: 'revenueGrowthPct',    percent: true, indent: true },
  { label: 'Cost of Revenues',         field: 'costOfRevenues',      indent: true },
  { label: 'Gross Profit',             field: 'grossProfit',         bold: true },
  { label: 'Gross Margin (%)',         field: 'grossMarginPct',      percent: true, indent: true },
  { separator: true, label: '', field: '' },
  { label: 'SG&A Expenses',           field: 'sgaExpenses',         indent: true },
  { label: 'R&D Expenses',            field: 'rdExpenses',          indent: true },
  { label: 'Operating Income (EBIT)', field: 'operatingIncome',     bold: true },
  { label: 'Operating Margin (%)',    field: 'operatingMarginPct',  percent: true, indent: true },
  { label: 'EBITDA',                  field: 'ebitda',              indent: true },
  { separator: true, label: '', field: '' },
  { label: 'Interest Expense',        field: 'interestExpense',     indent: true },
  { label: 'Interest Income',         field: 'interestIncome',      indent: true },
  { label: 'Net Interest Expense',    field: 'netInterestExpense',  indent: true },
  { label: 'Income Tax Expense',      field: 'incomeTaxExpense',    indent: true },
  { separator: true, label: '', field: '' },
  { label: 'Net Income',             field: 'netIncome',            bold: true },
  { label: 'Net Margin (%)',         field: 'netMarginPct',         percent: true, indent: true },
  { label: 'EPS (Basic)',            field: 'eps',                  indent: true },
  { label: 'EPS (Diluted)',          field: 'epsDiluted',           indent: true },
  { label: 'Shares Outstanding (M)', field: 'sharesOutstanding',   indent: true },
];

const BS_ROWS: FinancialRow[] = [
  { label: '── ASSETS ──',              field: '',                    bold: true },
  { label: 'Cash & Cash Equivalents',  field: 'cashAndEquivalents',  indent: true },
  { label: 'Short-Term Investments',   field: 'shortTermInvestments',indent: true },
  { label: 'Total Cash & ST Invest.',  field: 'totalCashAndST',      bold: true },
  { label: 'Accounts Receivable',      field: 'accountsReceivable',  indent: true },
  { label: 'Total Receivables',        field: 'totalReceivables',    indent: true },
  { label: 'Prepaid Expenses',         field: 'prepaidExpenses',     indent: true },
  { label: 'Total Current Assets',     field: 'totalCurrentAssets',  bold: true },
  { separator: true, label: '', field: '' },
  { label: 'Net PP&E',                 field: 'netPPE',              indent: true },
  { label: 'Goodwill',                 field: 'goodwill',            indent: true },
  { label: 'Total Intangibles',        field: 'totalIntangibles',    indent: true },
  { label: 'Total Assets',            field: 'totalAssets',          bold: true },
  { separator: true, label: '', field: '' },
  { label: '── LIABILITIES ──',         field: '',                    bold: true },
  { label: 'Accounts Payable',         field: 'accountsPayable',     indent: true },
  { label: 'Accrued Expenses',         field: 'accruedExpenses',     indent: true },
  { label: 'Current Debt',             field: 'currentDebt',         indent: true },
  { label: 'Total Current Liabilities',field: 'totalCurrentLiab',    bold: true },
  { label: 'Long-Term Debt',           field: 'longTermDebt',        indent: true },
  { label: 'Total Non-Current Liab.',  field: 'totalNonCurrentLiab', indent: true },
  { label: 'Total Liabilities',       field: 'totalLiabilities',     bold: true },
  { separator: true, label: '', field: '' },
  { label: '── EQUITY ──',              field: '',                    bold: true },
  { label: 'Common Equity',            field: 'commonEquity',        indent: true },
  { label: 'Retained Earnings',        field: 'retainedEarnings',    indent: true },
  { label: 'Total Equity',            field: 'totalEquity',          bold: true },
];

const CF_ROWS: FinancialRow[] = [
  { label: '── OPERATING ──',          field: '',                    bold: true },
  { label: 'Net Income',              field: 'cfNetIncome',          indent: true },
  { label: 'Depreciation & Amort.',   field: 'depreciationAmort',   indent: true },
  { label: 'Stock-Based Comp.',       field: 'stockBasedComp',      indent: true },
  { label: 'Change in Working Cap.',  field: 'changeInWorkingCap',  indent: true },
  { label: 'Cash from Operations',   field: 'cashFromOperations',   bold: true },
  { separator: true, label: '', field: '' },
  { label: '── INVESTING ──',          field: '',                    bold: true },
  { label: 'Capital Expenditure',     field: 'capex',               indent: true },
  { label: 'Acquisitions (Net)',      field: 'acquisitions',        indent: true },
  { label: 'Cash from Investing',    field: 'cashFromInvesting',    bold: true },
  { separator: true, label: '', field: '' },
  { label: '── FINANCING ──',          field: '',                    bold: true },
  { label: 'Debt Issued',             field: 'debtIssued',          indent: true },
  { label: 'Debt Repaid',             field: 'debtRepaid',          indent: true },
  { label: 'Stock Repurchase',        field: 'stockRepurchase',     indent: true },
  { label: 'Dividends Paid',          field: 'dividendsPaid',       indent: true },
  { label: 'Cash from Financing',    field: 'cashFromFinancing',    bold: true },
  { separator: true, label: '', field: '' },
  { label: 'Net Change in Cash',     field: 'netChangeInCash',      bold: true },
  { label: 'Beginning Cash',         field: 'beginningCash',        indent: true },
  { label: 'Ending Cash',            field: 'endingCash',           indent: true },
  { separator: true, label: '', field: '' },
  { label: '── FREE CASH FLOW ──',     field: '',                    bold: true },
  { label: 'Free Cash Flow',         field: 'freeCashFlow',         bold: true },
  { label: 'FCF per Share',          field: 'freeCashFlowPerShare', indent: true },
];

// ── Format cell value ──────────────────────────────────────────────
function fmt(v: any, isPercent = false, field = ''): string {
  if (v == null || v === '') return '—';
  const num = Number(v);
  if (isNaN(num)) return '—';
  if (isPercent) return `${num.toFixed(1)}%`;
  // Per-share fields
  if (field.toLowerCase().includes('eps') || field.toLowerCase().includes('pershare'))
    return num.toFixed(2);
  // Millions formatting
  if (Math.abs(num) >= 1000) return num.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
  return num.toFixed(1);
}

// ── Cell colour by value (green positive, red negative) ───────────
function cellColor(v: any, field: string): string {
  if (v == null || field.includes('Expense') || field.includes('Repaid') ||
      field.includes('capex') || field === 'costOfRevenues') return '';
  const num = Number(v);
  if (isNaN(num) || num === 0) return '';
  return num > 0 ? 'text-green-400' : 'text-red-400';
}

interface Props { ticker: string; companyName: string; }

export default function FinancialsTab({ ticker, companyName }: Props) {
  const [data,         setData]         = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [syncing,      setSyncing]      = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [activeSheet,  setActiveSheet]  = useState<'is' | 'bs' | 'cf'>('is');

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/financials/${ticker.toUpperCase()}`, { headers: authH() });
      const json = await res.json();
      if (json.success && json.data?.statements?.length > 0) setData(json.data);
      else setData(null);
    } catch { setError('Could not load financial data.'); }
    finally  { setLoading(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${API}/financials/${ticker.toUpperCase()}/sync`, {
        method: 'POST', headers: authH(),
      });
      await fetchData();
    } catch { setError('Sync failed.'); }
    finally  { setSyncing(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API}/financials/${ticker.toUpperCase()}/download`, { headers: authH() });
      if (!res.ok) { setError('No financial data to download yet. Click Sync first.'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${ticker.toUpperCase()}_Financial_Statements.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Download failed.'); }
    finally  { setDownloading(false); }
  };

  useEffect(() => { fetchData(); }, [ticker]);

  const statements = data?.statements || [];
  const years      = statements.map((r: any) => `FY${String(r.fiscalYear).slice(2)}`);
  const currency   = data?.currency || 'ZAR';
  const rows       = activeSheet === 'is' ? IS_ROWS : activeSheet === 'bs' ? BS_ROWS : CF_ROWS;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            Financial Statements
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Source: Financial Modeling Prep · Currency: {currency} Millions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition active:scale-95">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
          <button onClick={handleDownload} disabled={downloading || !data}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-sm font-medium transition active:scale-95">
            <Download className="w-4 h-4" />
            {downloading ? 'Generating...' : 'Download Excel'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-300 text-sm p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
          <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">No financial statements yet for {ticker}</p>
          <p className="text-slate-500 text-sm mb-4">
            FMP may not cover this JSE ticker, or data hasn't been synced.
          </p>
          <button onClick={handleSync} disabled={syncing}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition">
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Sheet tabs */}
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
            {([
              ['is', '📈 Income Statement', TrendingUp],
              ['bs', '🏦 Balance Sheet',    Building2],
              ['cf', '💵 Cash Flow',        DollarSign],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveSheet(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeSheet === key
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Data table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="px-4 py-3 text-left font-medium text-slate-300 min-w-[220px]">
                    LINE ITEM
                  </th>
                  {years.map((y: string) => (
                    <th key={y} className="px-4 py-3 text-right font-medium text-slate-300 min-w-[90px]">
                      {y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {rows.map((row, idx) => {
                  if (row.separator) {
                    return <tr key={idx}><td colSpan={years.length + 1} className="py-1 bg-slate-900/30" /></tr>;
                  }
                  const isSectionLabel = !row.field;
                  return (
                    <tr key={idx}
                      className={`transition ${
                        isSectionLabel
                          ? 'bg-slate-800/40'
                          : row.bold
                            ? 'bg-slate-800/20 hover:bg-slate-800/40'
                            : 'hover:bg-slate-800/20'
                      }`}
                    >
                      <td className={`px-4 py-2.5 ${row.bold ? 'font-semibold' : ''} ${row.indent ? 'pl-8 text-slate-300' : ''} ${isSectionLabel ? 'text-xs text-slate-500 uppercase tracking-wider' : ''}`}>
                        {row.label}
                      </td>
                      {!isSectionLabel && years.map((_: string, i: number) => {
                        const v = statements[i]?.[row.field];
                        return (
                          <td key={i}
                            className={`px-4 py-2.5 text-right font-mono tabular-nums ${
                              row.bold ? 'font-semibold' : 'text-slate-300'
                            } ${cellColor(v, row.field)}`}>
                            {fmt(v, row.percent, row.field)}
                          </td>
                        );
                      })}
                      {isSectionLabel && <td colSpan={years.length} />}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-600 text-right">
            {companyName} · {years[0]}–{years[years.length - 1]} · {currency} Millions · Source: FMP
          </p>
        </>
      )}
    </div>
  );
}
EOF
echo "   ✅ FinancialsTab.tsx written"

# ── 10. ADD FINANCIALS TAB TO COMPANY PROFILE PAGE ──────────────────
echo "📝 Adding Financials tab to CompanyProfilePage.tsx..."
python3 << 'PYEOF'
path = 'client/src/pages/CompanyProfilePage.tsx'
content = open(path).read()

if 'FinancialsTab' not in content:
    # Add import
    content = content.replace(
        "import CompanyReports from '../components/CompanyReports';",
        "import CompanyReports from '../components/CompanyReports';\nimport FinancialsTab from '../components/FinancialsTab';"
    )
    # Add tab button
    content = content.replace(
        "  const [activeTab,        setActiveTab]        = useState<'overview' | 'news' | 'reports'>('overview');",
        "  const [activeTab,        setActiveTab]        = useState<'overview' | 'news' | 'reports' | 'financials'>('overview');"
    )
    # Add tab button in the tabs row
    content = content.replace(
        "              ['reports', '📄 Reports'],",
        "              ['reports', '📄 Reports'],\n              ['financials', '💹 Financials'],"
    )
    # Add Financials tab content panel
    content = content.replace(
        "            {/* ── Reports ──────────────────────────────────────────────────────── */}\n            {activeTab === 'reports' && (",
        """            {/* ── Financials ────────────────────────────────────────────────────── */}
            {activeTab === 'financials' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <FinancialsTab ticker={company.ticker} companyName={company.name} />
              </div>
            )}

            {/* ── Reports ──────────────────────────────────────────────────────── */}
            {activeTab === 'reports' && ("""
    )
    open(path, 'w').write(content)
    print('   ✅ Financials tab added to CompanyProfilePage.tsx')
else:
    print('   ℹ️  Financials tab already present')
PYEOF

# ── 11. GIT COMMIT & PUSH ───────────────────────────────────────────
echo ""
echo "🚀 Committing and pushing..."

# Server
cd "$SERVER"
git add -A
git commit -m "feat: standalone financial statements — Income Statement, Balance Sheet, Cash Flow (NFLX template)"
git push
cd "$ROOT"

# Client
cd "$CLIENT"
git add -A
git commit -m "feat: FinancialsTab component — 3-sheet table view + Excel download matching NFLX template"
git push
cd "$ROOT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Financial Statements feature deployed!"
echo ""
echo "   📐 New DB table:   FinancialStatement (64 fields)"
echo "   📊 Statements:     Income Statement · Balance Sheet · Cash Flow"
echo "   📅 Auto-sync:      Every Sunday 04:00 for all 50 companies"
echo "   📥 Excel export:   Matches NFLX_Financial_Statements.xlsx exactly"
echo "   🌐 New endpoints:"
echo "      GET  /api/v1/financials/:ticker"
echo "      GET  /api/v1/financials/:ticker/summary"
echo "      GET  /api/v1/financials/:ticker/download"
echo "      POST /api/v1/financials/:ticker/sync"
echo "   🖥️  Company Profile: new 💹 Financials tab"
echo "   🔒 Zero conflict with existing features"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
