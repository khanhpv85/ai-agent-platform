import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  company_id: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  usage: {
    tokens_used: number;
    model: string;
    endpoint: string;
  };
  timestamp: string;
}

export interface WorkflowRequest {
  workflow_id: string;
  input_data: Record<string, any>;
  company_id: string;
}

export interface WorkflowResponse {
  success: boolean;
  data: {
    execution_id: string;
    status: string;
    result: Record<string, any>;
    execution_time: number;
  };
  usage: {
    tokens_used: number;
    model: string;
    endpoint: string;
  };
  timestamp: string;
}

export interface UsageStats {
  company_id: string;
  plan: string;
  current_month_usage: number;
  monthly_limit: number;
  usage_percentage: number;
}

export interface AIAgentPlatformConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}

export class AIAgentPlatform {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: AIAgentPlatformConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.aiagentplatform.com',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'aiagentplatform-sdk/1.0.0',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 401:
              throw new Error('Invalid API key');
            case 403:
              throw new Error('Access denied');
            case 429:
              throw new Error('Rate limit exceeded');
            case 500:
              throw new Error('Internal server error');
            default:
              throw new Error(data?.detail || `HTTP ${status} error`);
          }
        }
        throw new Error('Network error');
      }
    );
  }

  /**
   * Send a chat completion request
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/v1/chat/completions', request);
    return response.data;
  }

  /**
   * Send a streaming chat completion request
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<string> {
    const response = await this.client.post('/v1/chat/completions/stream', request, {
      responseType: 'stream',
    });

    for await (const chunk of response.data) {
      const text = chunk.toString();
      if (text.startsWith('data: ')) {
        const data = text.slice(6);
        if (data === '[DONE]') {
          break;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0]?.delta?.content) {
            yield parsed.choices[0].delta.content;
          }
        } catch (e) {
          // Skip invalid JSON chunks
        }
      }
    }
  }

  /**
   * Execute an autonomous workflow
   */
  async executeWorkflow(request: WorkflowRequest): Promise<WorkflowResponse> {
    const response = await this.client.post('/v1/agents/workflows/execute', request);
    return response.data;
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowStatus(executionId: string): Promise<any> {
    const response = await this.client.get(`/v1/agents/workflows/${executionId}/status`);
    return response.data;
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await this.client.get('/v1/usage');
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Export types
export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  WorkflowRequest,
  WorkflowResponse,
  UsageStats,
  AIAgentPlatformConfig,
};

// Default export
export default AIAgentPlatform;
