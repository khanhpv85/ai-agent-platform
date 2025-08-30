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
  initialState: {
    ...authInitialState,
    users: [],
    currentUser: null,
  },
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
      state.users = [];
      state.currentUser = null;
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
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase('auth/fetchUsers/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/fetchUsers/fulfilled', (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload;
      })
      .addCase('auth/fetchUsers/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create user
      .addCase('auth/createUser/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/createUser/fulfilled', (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase('auth/createUser/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase('auth/updateUser/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/updateUser/fulfilled', (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase('auth/updateUser/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete user
      .addCase('auth/deleteUser/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/deleteUser/fulfilled', (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase('auth/deleteUser/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Activate user
      .addCase('auth/activateUser/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/activateUser/fulfilled', (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase('auth/activateUser/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Deactivate user
      .addCase('auth/deactivateUser/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/deactivateUser/fulfilled', (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase('auth/deactivateUser/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Resend verification
      .addCase('auth/resendUserVerification/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/resendUserVerification/fulfilled', (state) => {
        state.loading = false;
      })
      .addCase('auth/resendUserVerification/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset password
      .addCase('auth/resetUserPassword/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('auth/resetUserPassword/fulfilled', (state) => {
        state.loading = false;
      })
      .addCase('auth/resetUserPassword/rejected', (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Company reducer
const companyInitialState = {
  companies: [],
  currentCompany: null,
  pagination: null,
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
    setPagination: (state, action) => {
      state.pagination = action.payload;
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
  setPagination,
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


