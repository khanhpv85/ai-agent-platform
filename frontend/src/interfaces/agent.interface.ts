// Agent-related interfaces and types

export interface Agent {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  created_by: string;
  status: AgentStatus;
  agent_type: AgentType;
  configuration: AgentConfiguration;
  created_at: string;
  updated_at: string;
}

export enum AgentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused'
}

export enum AgentType {
  WORKFLOW = 'workflow',
  CHATBOT = 'chatbot',
  ASSISTANT = 'assistant',
  ANALYST = 'analyst',
  AUTOMATION = 'automation'
}

// Knowledge Base Interface
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  source_type: SourceType;
  source_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum SourceType {
  DOCUMENT = 'document',
  DATABASE = 'database',
  API = 'api',
  WEBSITE = 'website',
  FILE = 'file'
}

// LLM Configuration
export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  system_prompt?: string;
  custom_headers?: Record<string, string>;
}

export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  AZURE = 'azure',
  CUSTOM = 'custom'
}

// Tool Configuration
export interface AgentTool {
  id: string;
  name: string;
  type: ToolType;
  description: string;
  config: any;
  is_enabled: boolean;
  order: number;
}

export enum ToolType {
  WEB_SEARCH = 'web_search',
  CALCULATOR = 'calculator',
  FILE_READER = 'file_reader',
  API_CALLER = 'api_caller',
  DATABASE_QUERY = 'database_query',
  EMAIL_SENDER = 'email_sender',
  CALENDAR = 'calendar',
  CUSTOM_FUNCTION = 'custom_function'
}

// Prompt Configuration
export interface PromptConfig {
  system_prompt: string;
  user_prompt_template: string;
  context_prompt?: string;
  examples?: PromptExample[];
  variables?: PromptVariable[];
}

export interface PromptExample {
  input: string;
  output: string;
  description?: string;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default_value?: any;
}

// Agent Configuration
export interface AgentConfiguration {
  llm: LLMConfig;
  knowledge_bases: string[]; // Array of knowledge base IDs
  tools: AgentTool[];
  prompts: PromptConfig;
  memory: MemoryConfig;
  behavior: BehaviorConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

// Memory Configuration
export interface MemoryConfig {
  type: MemoryType;
  max_tokens: number;
  retention_days: number;
  include_context: boolean;
  include_metadata: boolean;
}

export enum MemoryType {
  NONE = 'none',
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
  HYBRID = 'hybrid'
}

// Behavior Configuration
export interface BehaviorConfig {
  personality: string;
  response_style: ResponseStyle;
  confidence_threshold: number;
  fallback_response: string;
  max_conversation_turns: number;
  auto_escalate: boolean;
}

export enum ResponseStyle {
  CONCISE = 'concise',
  DETAILED = 'detailed',
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  TECHNICAL = 'technical'
}

// Security Configuration
export interface SecurityConfig {
  data_encryption: boolean;
  access_control: AccessControl[];
  content_filtering: boolean;
  audit_logging: boolean;
  rate_limiting: RateLimitConfig;
}

export interface AccessControl {
  user_id?: string;
  role: string;
  permissions: string[];
}

export interface RateLimitConfig {
  requests_per_minute: number;
  requests_per_hour: number;
  burst_limit: number;
}

// Monitoring Configuration
export interface MonitoringConfig {
  performance_tracking: boolean;
  error_alerting: boolean;
  usage_analytics: boolean;
  conversation_logging: boolean;
  custom_metrics: string[];
}

// Agent State
export interface AgentsState {
  agents: Agent[];
  currentAgent: Agent | null;
  knowledgeBases: KnowledgeBase[];
  loading: boolean;
  error: string | null;
}

// Create/Update DTOs
export interface CreateAgentData {
  name: string;
  description?: string;
  company_id: string;
  agent_type: AgentType;
  configuration: AgentConfiguration;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  status?: AgentStatus;
  agent_type?: AgentType;
  configuration?: Partial<AgentConfiguration>;
}

// Configuration Templates
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  agent_type: AgentType;
  configuration: AgentConfiguration;
  category: string;
  tags: string[];
}
