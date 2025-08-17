import { createSlice } from '@reduxjs/toolkit';

// Auth reducer
const authInitialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  refreshExpiresIn: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = action.payload.expiresIn;
      state.refreshExpiresIn = action.payload.refreshExpiresIn;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.refreshExpiresIn = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Company reducer
const companyInitialState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
};

export const companySlice = createSlice({
  name: 'company',
  initialState: companyInitialState,
  reducers: {
    setCompanies: (state, action) => {
      state.companies = action.payload;
    },
    setCurrentCompany: (state, action) => {
      state.currentCompany = action.payload;
    },
    addCompany: (state, action) => {
      state.companies.push(action.payload);
    },
    updateCompany: (state, action) => {
      const index = state.companies.findIndex(company => company.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
    },
    removeCompany: (state, action) => {
      state.companies = state.companies.filter(company => company.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Agents reducer
const agentsInitialState = {
  agents: [],
  currentAgent: null,
  loading: false,
  error: null,
};

export const agentsSlice = createSlice({
  name: 'agents',
  initialState: agentsInitialState,
  reducers: {
    setAgents: (state, action) => {
      state.agents = action.payload;
    },
    setCurrentAgent: (state, action) => {
      state.currentAgent = action.payload;
    },
    addAgent: (state, action) => {
      state.agents.push(action.payload);
    },
    updateAgent: (state, action) => {
      const index = state.agents.findIndex(agent => agent.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
    removeAgent: (state, action) => {
      state.agents = state.agents.filter(agent => agent.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Workflows reducer
const workflowsInitialState = {
  workflows: [],
  currentWorkflow: null,
  executions: [],
  loading: false,
  error: null,
};

export const workflowsSlice = createSlice({
  name: 'workflows',
  initialState: workflowsInitialState,
  reducers: {
    setWorkflows: (state, action) => {
      state.workflows = action.payload;
    },
    setCurrentWorkflow: (state, action) => {
      state.currentWorkflow = action.payload;
    },
    addWorkflow: (state, action) => {
      state.workflows.push(action.payload);
    },
    updateWorkflow: (state, action) => {
      const index = state.workflows.findIndex(workflow => workflow.id === action.payload.id);
      if (index !== -1) {
        state.workflows[index] = action.payload;
      }
    },
    removeWorkflow: (state, action) => {
      state.workflows = state.workflows.filter(workflow => workflow.id !== action.payload);
    },
    setExecutions: (state, action) => {
      state.executions = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setUser, 
  setTokens, 
  clearAuth, 
  setLoading: setAuthLoading, 
  setError: setAuthError, 
  clearError: clearAuthError 
} = authSlice.actions;

export const { 
  setCompanies, 
  setCurrentCompany, 
  addCompany, 
  updateCompany, 
  removeCompany,
  setLoading: setCompanyLoading, 
  setError: setCompanyError, 
  clearError: clearCompanyError 
} = companySlice.actions;

export const { 
  setAgents, 
  setCurrentAgent, 
  addAgent, 
  updateAgent, 
  removeAgent,
  setLoading: setAgentsLoading, 
  setError: setAgentsError, 
  clearError: clearAgentsError 
} = agentsSlice.actions;

export const { 
  setWorkflows, 
  setCurrentWorkflow, 
  addWorkflow, 
  updateWorkflow, 
  removeWorkflow,
  setExecutions,
  setLoading: setWorkflowsLoading, 
  setError: setWorkflowsError, 
  clearError: clearWorkflowsError 
} = workflowsSlice.actions;
