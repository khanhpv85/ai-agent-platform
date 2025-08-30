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
    return response.data || [];
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

  fetchWorkflowById: async (workflowId: string): Promise<Workflow> => {
    const response = await companyClient.get(`/workflows/${workflowId}`);
    return response.data;
  },

  fetchWorkflowExecutions: async (workflowId: string): Promise<WorkflowExecution[]> => {
    const response = await companyClient.get(`/workflows/${workflowId}/executions`);
    return response.data || [];
  }
};

// Redux Thunks
export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchWorkflows',
  async (companyId: string, { dispatch }) => {
    dispatch(setWorkflowsLoading(true));
    try {
      const workflows = await workflowAPI.fetchWorkflows(companyId);
      dispatch(setWorkflows(workflows));
      return workflows;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to fetch workflows'));
      throw error;
    } finally {
      dispatch(setWorkflowsLoading(false));
    }
  }
);

export const fetchWorkflowById = createAsyncThunk(
  'workflows/fetchWorkflowById',
  async (workflowId: string, { dispatch }) => {
    try {
      const workflow = await workflowAPI.fetchWorkflowById(workflowId);
      dispatch(setCurrentWorkflow(workflow));
      return workflow;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to fetch workflow'));
      throw error;
    }
  }
);

export const createWorkflow = createAsyncThunk(
  'workflows/createWorkflow',
  async (workflowData: CreateWorkflowData, { dispatch }) => {
    try {
      const workflow = await workflowAPI.createWorkflow(workflowData);
      dispatch(addWorkflow(workflow));
      return workflow;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to create workflow'));
      throw error;
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  'workflows/updateWorkflow',
  async ({ id, data }: { id: string; data: UpdateWorkflowData }, { dispatch }) => {
    try {
      const workflow = await workflowAPI.updateWorkflow(id, data);
      dispatch(updateWorkflowAction(workflow));
      return workflow;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to update workflow'));
      throw error;
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  'workflows/deleteWorkflow',
  async (workflowId: string, { dispatch }) => {
    try {
      await workflowAPI.deleteWorkflow(workflowId);
      dispatch(removeWorkflow(workflowId));
      return workflowId;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to delete workflow'));
      throw error;
    }
  }
);

export const executeWorkflow = createAsyncThunk(
  'workflows/executeWorkflow',
  async ({ id, inputData }: { id: string; inputData: ExecuteWorkflowData }, { dispatch }) => {
    try {
      const result = await workflowAPI.executeWorkflow(id, inputData);
      return result;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to execute workflow'));
      throw error;
    }
  }
);

export const fetchWorkflowExecutions = createAsyncThunk(
  'workflows/fetchWorkflowExecutions',
  async (workflowId: string, { dispatch }) => {
    try {
      const executions = await workflowAPI.fetchWorkflowExecutions(workflowId);
      dispatch(setExecutions(executions));
      return executions;
    } catch (error: any) {
      dispatch(setWorkflowsError(error.message || 'Failed to fetch workflow executions'));
      throw error;
    }
  }
);
