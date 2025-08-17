import { createAsyncThunk } from '@reduxjs/toolkit';
import { companyClient } from '@configs/http-client';
import { 
  Agent, 
  CreateAgentData, 
  UpdateAgentData 
} from '../interfaces/agent.interface';
import { 
  setAgents, 
  addAgent, 
  updateAgent as updateAgentAction, 
  removeAgent,
  setAgentsLoading, 
  setAgentsError, 
  clearAgentsError 
} from '../store/reducers';

// API Service functions
export const agentAPI = {
  fetchAgents: async (companyId: string): Promise<Agent[]> => {
    const response = await companyClient.get(`/agents/company/${companyId}`);
    return response.data;
  },

  createAgent: async (agentData: CreateAgentData): Promise<Agent> => {
    const response = await companyClient.post('/agents', agentData);
    return response.data;
  },

  updateAgent: async (id: string, data: UpdateAgentData): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}`, data);
    return response.data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await companyClient.delete(`/agents/${id}`);
  }
};

// Async thunks
export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (companyId: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.fetchAgents(companyId);
      
      // Update store
      dispatch(setAgents(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch agents';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (agentData: CreateAgentData, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.createAgent(agentData);
      
      // Update store
      dispatch(addAgent(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create agent';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async ({ id, data }: { id: string; data: UpdateAgentData }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateAgent(id, data);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update agent';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      await agentAPI.deleteAgent(id);
      
      // Update store
      dispatch(removeAgent(id));
      
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete agent';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);
