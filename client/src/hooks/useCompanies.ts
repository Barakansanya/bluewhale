// ============================================
// FILE: client/src/hooks/useCompanies.ts
// ============================================
import { useQuery } from '@tanstack/react-query';
import { companiesService, ScreenerFilters } from '../services/companies.service';

export const useCompanies = (filters?: ScreenerFilters) => {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => companiesService.getAll(filters),
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companiesService.getById(id),
    enabled: !!id,
  });
};

export const useCompanyMetrics = (companyId: string) => {
  return useQuery({
    queryKey: ['companyMetrics', companyId],
    queryFn: () => companiesService.getMetrics(companyId),
    enabled: !!companyId,
  });
};