// Company-related interfaces and types

export interface CompanyData {
  id: string;
  name: string;
  domain?: string;
  subscription_plan: string;
  max_agents: number;
  role: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CompanyState {
  companies: CompanyData[];
  currentCompany: CompanyData | null;
  pagination: PaginationData | null;
  loading: boolean;
  error: string | null;
}

export interface CreateCompanyData {
  name: string;
  domain?: string;
  subscription_plan?: string;
  max_agents?: number;
}

export interface UpdateCompanyData {
  name?: string;
  domain?: string;
  subscription_plan?: string;
  max_agents?: number;
}

export interface AddUserToCompanyData {
  userId: string;
  companyId: string;
  companyRole: string;
}
