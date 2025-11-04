// ============================================
// FILE: client/src/services/companies.service.ts
// ============================================
import { api } from './api';
import { Company, CompanyMetrics } from '../types';

export interface ScreenerFilters {
  sector?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  minDividendYield?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const companiesService = {
  async getAll(filters?: ScreenerFilters): Promise<Company[]> {
    const response = await api.get<{ data: Company[] }>('/companies', {
      params: filters,
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Company> {
    const response = await api.get<{ data: Company }>(`/companies/${id}`);
    return response.data.data;
  },

  async getByTicker(ticker: string): Promise<Company> {
    const response = await api.get<{ data: Company }>(`/companies/ticker/${ticker}`);
    return response.data.data;
  },

  async getMetrics(companyId: string): Promise<CompanyMetrics> {
    const response = await api.get<{ data: CompanyMetrics }>(
      `/companies/${companyId}/metrics`
    );
    return response.data.data;
  },

  async search(query: string): Promise<Company[]> {
    const response = await api.get<{ data: Company[] }>('/companies/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};