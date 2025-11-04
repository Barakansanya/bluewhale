// ============================================
// FILE: client/src/types/index.ts
// ============================================
export enum UserRole {
  USER = 'USER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum Sector {
  FINANCIALS = 'FINANCIALS',
  CONSUMER_GOODS = 'CONSUMER_GOODS',
  INDUSTRIALS = 'INDUSTRIALS',
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTHCARE = 'HEALTHCARE',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  ENERGY = 'ENERGY',
  MATERIALS = 'MATERIALS',
  UTILITIES = 'UTILITIES',
  REAL_ESTATE = 'REAL_ESTATE',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  subscription: SubscriptionTier;
  subscriptionEndsAt?: string;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: Sector;
  industry?: string;
  marketCap?: number;
  description?: string;
  website?: string;
  logoUrl?: string;
  lastPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  volume?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMetrics {
  id: string;
  companyId: string;
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  evToEbitda?: number;
  roe?: number;
  roa?: number;
  roic?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  currentRatio?: number;
  quickRatio?: number;
  debtToEquity?: number;
  interestCoverage?: number;
  dividendYield?: number;
  payoutRatio?: number;
  revenueGrowth?: number;
  epsGrowth?: number;
  asOfDate: string;
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  company: Company;
  targetPrice?: number;
  notes?: string;
  addedAt: string;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
}