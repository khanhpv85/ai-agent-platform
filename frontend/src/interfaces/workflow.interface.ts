// Workflow-related interfaces and types

export interface WorkflowStep {
  type: string;
  agent_id: string;
  name?: string;
  config?: any;
  order?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  status: string;
  steps: WorkflowStep[];
  triggers?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface WorkflowsState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executions: WorkflowExecution[];
  loading: boolean;
  error: string | null;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  company_id: string;
  status?: string;
  steps: WorkflowStep[];
  triggers?: any;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  status?: string;
  steps?: WorkflowStep[];
  triggers?: any;
}

export interface ExecuteWorkflowData {
  input_data: any;
}
