import { createAsyncThunk } from '@reduxjs/toolkit';
import { companyClient } from '@configs/http-client';
import { 
  Workflow, 
  WorkflowExecution,
  CreateWorkflowData, 
  UpdateWorkflowData,
  ExecuteWorkflowData
} from '../interfaces/workflow.interface';
import { 
  setWorkflows, 
  setCurrentWorkflow, 
  addWorkflow, 
  updateWorkflow as updateWorkflowAction, 
  removeWorkflow,
  setExecutions,
  setWorkflowsLoading, 
  setWorkflowsError, 
  clearWorkflowsError 
} from '../store/reducers';

// API Service functions
export const workflowAPI = {
  fetchWorkflows: async (companyId: string): Promise<Workflow[]> => {
    const response = await companyClient.get(`/workflows/company/${companyId}`);
    return response.data;
  },

  fetchAgentWorkflows: async (agentId: string): Promise<Workflow[]> => {
    const response = await companyClient.get(`/workflows/agent/${agentId}`);
    return response.data;
  },

  createWorkflow: async (workflowData: CreateWorkflowData): Promise<Workflow> => {
    const response = await companyClient.post('/workflows', workflowData);
    return response.data;
  },

  updateWorkflow: async (id: string, data: UpdateWorkflowData): Promise<Workflow> => {
    const response = await companyClient.put(`/workflows/${id}`, data);
    return response.data;
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    await companyClient.delete(`/workflows/${id}`);
  },

  executeWorkflow: async (id: string, inputData: ExecuteWorkflowData): Promise<any> => {
    const response = await companyClient.post(`/workflows/${id}/execute`, { input_data: inputData });
    return response.data;
  },

  fetchWorkflowExecutions: async (workflowId: string): Promise<WorkflowExecution[]> => {
    const response = await companyClient.get(`/workflows/${workflowId}/executions`);
    return response.data;
  }
};

// Async thunks
export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchWorkflows',
  async (companyId: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      const response = await workflowAPI.fetchWorkflows(companyId);
      
      // Update store
      dispatch(setWorkflows(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch workflows';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const fetchAgentWorkflows = createAsyncThunk(
  'workflows/fetchAgentWorkflows',
  async (agentId: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      const response = await workflowAPI.fetchAgentWorkflows(agentId);
      
      // Update store
      dispatch(setWorkflows(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch workflows';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const createWorkflow = createAsyncThunk(
  'workflows/createWorkflow',
  async (workflowData: CreateWorkflowData, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      const response = await workflowAPI.createWorkflow(workflowData);
      
      // Update store
      dispatch(addWorkflow(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create workflow';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  'workflows/updateWorkflow',
  async ({ id, data }: { id: string; data: UpdateWorkflowData }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      const response = await workflowAPI.updateWorkflow(id, data);
      
      // Update store
      dispatch(updateWorkflowAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update workflow';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  'workflows/deleteWorkflow',
  async (id: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      await workflowAPI.deleteWorkflow(id);
      
      // Update store
      dispatch(removeWorkflow(id));
      
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete workflow';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const executeWorkflow = createAsyncThunk(
  'workflows/executeWorkflow',
  async ({ id, inputData }: { id: string; inputData: ExecuteWorkflowData }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      const response = await workflowAPI.executeWorkflow(id, inputData);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to execute workflow';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const fetchWorkflowExecutions = createAsyncThunk(
  'workflows/fetchWorkflowExecutions',
  async (workflowId: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setWorkflowsLoading(true));
      dispatch(clearWorkflowsError());
      
      const response = await workflowAPI.fetchWorkflowExecutions(workflowId);
      
      // Update store
      dispatch(setExecutions(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch workflow executions';
      dispatch(setWorkflowsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);
