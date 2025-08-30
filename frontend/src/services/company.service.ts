import { createAsyncThunk } from '@reduxjs/toolkit';
import { companyClient } from '@configs/http-client';
import { 
  CompanyData, 
  CreateCompanyData, 
  UpdateCompanyData 
} from '../interfaces/company.interface';
import { 
  setCompanies, 
  setCurrentCompany, 
  addCompany, 
  updateCompany as updateCompanyAction, 
  removeCompany,
  setCompanyLoading, 
  setCompanyError, 
  clearCompanyError,
  setPagination
} from '../store/reducers';

// API Service functions
export const companyAPI = {
  fetchUserCompanies: async (page: number = 1, limit: number = 10): Promise<any> => {
    const response = await companyClient.get(`/companies?page=${page}&limit=${limit}`);
    return response.data;
  },

  createCompany: async (companyData: CreateCompanyData): Promise<CompanyData> => {
    const response = await companyClient.post('/companies', companyData);
    return response.data;
  },

  updateCompany: async (id: string, data: UpdateCompanyData): Promise<CompanyData> => {
    const response = await companyClient.put(`/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: string): Promise<void> => {
    await companyClient.delete(`/companies/${id}`);
  },

  setDefaultCompany: async (id: string): Promise<CompanyData> => {
    const response = await companyClient.post(`/companies/${id}/set-default`);
    return response.data;
  },

  getDefaultCompany: async (): Promise<CompanyData | null> => {
    const response = await companyClient.get('/companies/default/current');
    return response.data;
  },

  addUserToCompany: async (companyId: string, userData: any): Promise<any> => {
    const response = await companyClient.post(`/users/company/${companyId}`, userData);
    return response.data;
  }
};

// Async thunks
export const fetchUserCompanies = createAsyncThunk(
  'company/fetchUserCompanies',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.fetchUserCompanies(page, limit);
      
      // Ensure response has the expected structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Update store with safe defaults
      const companies = response.companies || [];
      const pagination = response.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
      
      dispatch(setCompanies(companies));
      dispatch(setPagination(pagination));
      if (companies.length > 0) {
        dispatch(setCurrentCompany(companies[0]));
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch companies';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (companyData: CreateCompanyData, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.createCompany(companyData);
      
      // Update store
      dispatch(addCompany(response));
      dispatch(setCurrentCompany(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create company';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async ({ id, data }: { id: string; data: UpdateCompanyData }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.updateCompany(id, data);
      
      // Update store
      dispatch(updateCompanyAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update company';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'company/deleteCompany',
  async (id: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      await companyAPI.deleteCompany(id);
      
      // Update store
      dispatch(removeCompany(id));
      
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete company';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);

export const setDefaultCompany = createAsyncThunk(
  'company/setDefaultCompany',
  async (id: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.setDefaultCompany(id);
      
      // Update store - update the company in the list and set as current
      dispatch(updateCompanyAction(response));
      dispatch(setCurrentCompany(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to set default company';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);

export const getDefaultCompany = createAsyncThunk(
  'company/getDefaultCompany',
  async (_, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.getDefaultCompany();
      
      if (response) {
        dispatch(setCurrentCompany(response));
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get default company';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);

export const addUserToCompany = createAsyncThunk(
  'company/addUserToCompany',
  async ({ companyId, userData }: { companyId: string; userData: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.addUserToCompany(companyId, userData);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to add user to company';
      dispatch(setCompanyError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCompanyLoading(false));
    }
  }
);
