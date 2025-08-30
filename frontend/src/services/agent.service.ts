import { createAsyncThunk } from '@reduxjs/toolkit';
import { companyClient } from '@configs/http-client';
import { 
  Agent, 
  CreateAgentData, 
  UpdateAgentData,
  AgentConfiguration,
  KnowledgeBase,
  LLMConfig
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
    return response.data || [];
  },

  createAgent: async (agentData: CreateAgentData): Promise<Agent> => {
    const response = await companyClient.post('/agents', agentData);
    return response.data;
  },

  updateAgent: async (id: string, data: UpdateAgentData): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}`, data);
    return response.data;
  },

  updateLLMConfiguration: async (id: string, llmConfig: LLMConfig): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/llm-config`, llmConfig);
    return response.data;
  },

  updateKnowledgeBaseConfiguration: async (id: string, knowledgeBases: string[]): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/knowledge-base-config`, { knowledge_bases: knowledgeBases });
    return response.data;
  },

  updateToolsConfiguration: async (id: string, tools: any[]): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/tools-config`, { tools });
    return response.data;
  },

  updatePromptsConfiguration: async (id: string, promptsConfig: any): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/prompts-config`, { prompts: promptsConfig });
    return response.data;
  },

  updateMemoryConfiguration: async (id: string, memoryConfig: any): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/memory-config`, { memory: memoryConfig });
    return response.data;
  },

  updateBehaviorConfiguration: async (id: string, behaviorConfig: any): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/behavior-config`, { behavior: behaviorConfig });
    return response.data;
  },

  updateSecurityConfiguration: async (id: string, securityConfig: any): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/security-config`, { security: securityConfig });
    return response.data;
  },

  updateMonitoringConfiguration: async (id: string, monitoringConfig: any): Promise<Agent> => {
    const response = await companyClient.put(`/agents/${id}/monitoring-config`, { monitoring: monitoringConfig });
    return response.data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await companyClient.delete(`/agents/${id}`);
  },

  // Knowledge Base API functions
  fetchKnowledgeBases: async (companyId: string): Promise<KnowledgeBase[]> => {
    const response = await companyClient.get(`/knowledge-bases/company/${companyId}`);
    return response.data || [];
  },

  createKnowledgeBase: async (knowledgeBaseData: any): Promise<KnowledgeBase> => {
    const response = await companyClient.post('/knowledge-bases', knowledgeBaseData);
    return response.data;
  },

  updateKnowledgeBase: async (id: string, data: any): Promise<KnowledgeBase> => {
    const response = await companyClient.put(`/knowledge-bases/${id}`, data);
    return response.data;
  },

  deleteKnowledgeBase: async (id: string): Promise<void> => {
    await companyClient.delete(`/knowledge-bases/${id}`);
  },

  toggleKnowledgeBaseStatus: async (id: string): Promise<KnowledgeBase> => {
    const response = await companyClient.put(`/knowledge-bases/${id}/toggle-status`);
    return response.data;
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
      
      // Add to store
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

export const updateLLMConfiguration = createAsyncThunk(
  'agents/updateLLMConfiguration',
  async ({ agentId, llmConfig }: { agentId: string; llmConfig: LLMConfig }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateLLMConfiguration(agentId, llmConfig);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update LLM configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateKnowledgeBaseConfiguration = createAsyncThunk(
  'agents/updateKnowledgeBaseConfiguration',
  async ({ agentId, knowledgeBases }: { agentId: string; knowledgeBases: string[] }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateKnowledgeBaseConfiguration(agentId, knowledgeBases);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update knowledge base configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateToolsConfiguration = createAsyncThunk(
  'agents/updateToolsConfiguration',
  async ({ agentId, tools }: { agentId: string; tools: any[] }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateToolsConfiguration(agentId, tools);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update tools configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updatePromptsConfiguration = createAsyncThunk(
  'agents/updatePromptsConfiguration',
  async ({ agentId, promptsConfig }: { agentId: string; promptsConfig: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updatePromptsConfiguration(agentId, promptsConfig);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update prompts configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateMemoryConfiguration = createAsyncThunk(
  'agents/updateMemoryConfiguration',
  async ({ agentId, memoryConfig }: { agentId: string; memoryConfig: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateMemoryConfiguration(agentId, memoryConfig);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update memory configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateBehaviorConfiguration = createAsyncThunk(
  'agents/updateBehaviorConfiguration',
  async ({ agentId, behaviorConfig }: { agentId: string; behaviorConfig: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateBehaviorConfiguration(agentId, behaviorConfig);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update behavior configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateSecurityConfiguration = createAsyncThunk(
  'agents/updateSecurityConfiguration',
  async ({ agentId, securityConfig }: { agentId: string; securityConfig: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateSecurityConfiguration(agentId, securityConfig);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update security configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateMonitoringConfiguration = createAsyncThunk(
  'agents/updateMonitoringConfiguration',
  async ({ agentId, monitoringConfig }: { agentId: string; monitoringConfig: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateMonitoringConfiguration(agentId, monitoringConfig);
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update monitoring configuration';
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
      
      // Remove from store
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

// Knowledge Base async thunks
export const fetchKnowledgeBases = createAsyncThunk(
  'agents/fetchKnowledgeBases',
  async (companyId: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.fetchKnowledgeBases(companyId);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch knowledge bases';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const createKnowledgeBase = createAsyncThunk(
  'agents/createKnowledgeBase',
  async (knowledgeBaseData: any, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.createKnowledgeBase(knowledgeBaseData);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create knowledge base';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const updateKnowledgeBase = createAsyncThunk(
  'agents/updateKnowledgeBase',
  async ({ id, data }: { id: string; data: any }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateKnowledgeBase(id, data);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update knowledge base';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const deleteKnowledgeBase = createAsyncThunk(
  'agents/deleteKnowledgeBase',
  async (id: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      await agentAPI.deleteKnowledgeBase(id);
      
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete knowledge base';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

export const toggleKnowledgeBaseStatus = createAsyncThunk(
  'agents/toggleKnowledgeBaseStatus',
  async (id: string, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.toggleKnowledgeBaseStatus(id);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle knowledge base status';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);

// Save agent configuration
export const saveAgentConfiguration = createAsyncThunk(
  'agents/saveAgentConfiguration',
  async ({ agentId, configuration }: { agentId: string; configuration: AgentConfiguration }, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAgentsLoading(true));
      dispatch(clearAgentsError());
      
      const response = await agentAPI.updateAgent(agentId, { configuration });
      
      // Update store
      dispatch(updateAgentAction(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save agent configuration';
      dispatch(setAgentsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAgentsLoading(false));
    }
  }
);
