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
  updateCompany, 
  removeCompany,
  setCompanyLoading, 
  setCompanyError, 
  clearCompanyError 
} from '../store/reducers';

// API Service functions
export const companyAPI = {
  fetchUserCompanies: async (): Promise<CompanyData[]> => {
    const response = await companyClient.get('/companies');
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
  }
};

// Async thunks
export const fetchUserCompanies = createAsyncThunk(
  'company/fetchUserCompanies',
  async (_, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setCompanyLoading(true));
      dispatch(clearCompanyError());
      
      const response = await companyAPI.fetchUserCompanies();
      
      // Update store
      dispatch(setCompanies(response));
      if (response.length > 0) {
        dispatch(setCurrentCompany(response[0]));
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch companies';
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
      dispatch(updateCompany(response));
      
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
