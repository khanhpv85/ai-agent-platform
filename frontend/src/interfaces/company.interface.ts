// Company-related interfaces and types

export interface CompanyData {
  id: string;
  name: string;
  domain?: string;
  subscription_plan: string;
  max_agents: number;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyState {
  companies: CompanyData[];
  currentCompany: CompanyData | null;
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
