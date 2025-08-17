// Agent-related interfaces and types

export interface Agent {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  created_by: string;
  status: string;
  agent_type: string;
  configuration?: any;
  created_at: string;
  updated_at: string;
}

export interface AgentsState {
  agents: Agent[];
  currentAgent: Agent | null;
  loading: boolean;
  error: string | null;
}

export interface CreateAgentData {
  name: string;
  description?: string;
  company_id: string;
  agent_type: string;
  configuration?: any;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  agent_type?: string;
  configuration?: any;
}
