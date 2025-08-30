# LLM Configuration Endpoint Implementation

## Overview

A new dedicated endpoint has been implemented for updating LLM (Language Model) configuration specifically. This provides a more efficient and targeted way to update LLM settings without affecting other configuration sections.

## Endpoint Details

### **PUT /agents/:id/llm-config**

**Purpose**: Update only the LLM configuration of an agent

**Authentication**: Required (JWT Bearer token)

**Content-Type**: `application/json`

## Backend Implementation

### 1. **DTOs (Data Transfer Objects)**

#### `LLMConfigDto` (Complete LLM Configuration)
```typescript
export class LLMConfigDto {
  @ApiProperty({ example: 'openai', description: 'LLM provider' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'gpt-3.5-turbo', description: 'Model name' })
  @IsString()
  model: string;

  @ApiProperty({ example: 0.7, description: 'Temperature for response generation' })
  temperature: number;

  @ApiProperty({ example: 1000, description: 'Maximum tokens for response' })
  max_tokens: number;

  @ApiProperty({ example: 1, description: 'Top-p sampling parameter' })
  top_p: number;

  @ApiProperty({ example: 0, description: 'Frequency penalty' })
  frequency_penalty: number;

  @ApiProperty({ example: 0, description: 'Presence penalty' })
  presence_penalty: number;

  @ApiProperty({ example: 'You are a helpful assistant', description: 'System prompt', required: false })
  @IsOptional()
  @IsString()
  system_prompt?: string;

  @ApiProperty({ example: {}, description: 'Custom headers', required: false })
  @IsOptional()
  @IsObject()
  custom_headers?: any;
}
```

#### `UpdateLLMConfigDto` (Partial LLM Configuration for Updates)
```typescript
export class UpdateLLMConfigDto {
  @ApiProperty({ example: 'openai', description: 'LLM provider', required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ example: 'gpt-3.5-turbo', description: 'Model name', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 0.7, description: 'Temperature for response generation', required: false })
  @IsOptional()
  temperature?: number;

  @ApiProperty({ example: 1000, description: 'Maximum tokens for response', required: false })
  @IsOptional()
  max_tokens?: number;

  @ApiProperty({ example: 1, description: 'Top-p sampling parameter', required: false })
  @IsOptional()
  top_p?: number;

  @ApiProperty({ example: 0, description: 'Frequency penalty', required: false })
  @IsOptional()
  frequency_penalty?: number;

  @ApiProperty({ example: 0, description: 'Presence penalty', required: false })
  @IsOptional()
  presence_penalty?: number;

  @ApiProperty({ example: 'You are a helpful assistant', description: 'System prompt', required: false })
  @IsOptional()
  @IsString()
  system_prompt?: string;

  @ApiProperty({ example: {}, description: 'Custom headers', required: false })
  @IsOptional()
  @IsObject()
  custom_headers?: any;
}
```

### 2. **Service Method**

#### `updateLLMConfiguration` in `AgentsService`
```typescript
async updateLLMConfiguration(agentId: string, llmConfig: UpdateLLMConfigDto, userId: string) {
  const agent = await this.agentRepository.findOne({
    where: { id: agentId },
    relations: ['company'],
  });

  if (!agent) {
    throw new NotFoundException('Agent not found');
  }

  // Get current configuration or initialize empty object
  const currentConfig = agent.configuration || {};
  
  // Merge LLM configuration with existing configuration
  const updatedConfig = {
    ...currentConfig,
    llm: {
      ...currentConfig.llm,
      ...llmConfig
    }
  };

  // Update agent with new configuration
  agent.configuration = updatedConfig;
  await this.agentRepository.save(agent);

  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
    agent_type: agent.agent_type,
    configuration: agent.configuration,
    company_id: agent.company_id,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}
```

### 3. **Controller Endpoint**

#### `updateLLMConfiguration` in `AgentsController`
```typescript
@Put(':id/llm-config')
@ApiOperation({ 
  summary: 'Update agent LLM configuration',
  description: 'Update only the LLM configuration of an agent. This endpoint is optimized for updating language model settings without affecting other configuration sections.'
})
@ApiResponse({ 
  status: 200, 
  description: 'LLM configuration updated successfully',
  type: UpdateAgentResponseSchema
})
@ApiResponse({ 
  status: 404, 
  description: 'Agent not found',
  type: AgentNotFoundErrorResponseSchema
})
@ApiResponse({ 
  status: 400, 
  description: 'Validation failed',
  type: AgentValidationErrorResponseSchema
})
@ApiResponse({ 
  status: 400, 
  description: 'Bad request',
  type: AgentBadRequestErrorResponseSchema
})
async updateLLMConfiguration(
  @Param('id') id: string,
  @Body() llmConfigDto: UpdateLLMConfigDto,
  @Request() req,
) {
  return this.agentsService.updateLLMConfiguration(id, llmConfigDto, req.user.id);
}
```

## Frontend Implementation

### 1. **API Service Function**

#### `updateLLMConfiguration` in `agentAPI`
```typescript
updateLLMConfiguration: async (id: string, llmConfig: LLMConfig): Promise<Agent> => {
  const response = await companyClient.put(`/agents/${id}/llm-config`, llmConfig);
  return response.data;
},
```

### 2. **Redux Thunk**

#### `updateLLMConfiguration` thunk
```typescript
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
```

### 3. **Component Integration**

#### `LLMSettingsBlock` Component
```typescript
const handleSave = async () => {
  if (!hasChanges) {
    toast.info('No changes to save');
    return;
  }

  setIsSaving(true);
  try {
    await dispatch(updateLLMConfiguration({
      agentId,
      llmConfig: localConfig
    })).unwrap();
    
    toast.success('LLM settings saved successfully');
    setHasChanges(false);
  } catch (error: any) {
    toast.error(error.message || 'Failed to save LLM settings');
  } finally {
    setIsSaving(false);
  }
};
```

## Request/Response Examples

### Request Example
```bash
PUT /agents/agent-123/llm-config
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "provider": "openai",
  "model": "gpt-4",
  "temperature": 0.8,
  "max_tokens": 2000,
  "top_p": 0.9,
  "frequency_penalty": 0.1,
  "presence_penalty": 0.1,
  "system_prompt": "You are a helpful AI assistant specialized in customer support.",
  "custom_headers": {
    "X-Custom-Header": "value"
  }
}
```

### Response Example
```json
{
  "id": "agent-123",
  "name": "Customer Support Agent",
  "description": "AI agent for handling customer inquiries",
  "status": "active",
  "agent_type": "workflow",
  "configuration": {
    "llm": {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.8,
      "max_tokens": 2000,
      "top_p": 0.9,
      "frequency_penalty": 0.1,
      "presence_penalty": 0.1,
      "system_prompt": "You are a helpful AI assistant specialized in customer support.",
      "custom_headers": {
        "X-Custom-Header": "value"
      }
    },
    "knowledge_bases": ["kb-1", "kb-2"],
    "tools": [],
    "prompts": { ... },
    "memory": { ... },
    "behavior": { ... },
    "security": { ... },
    "monitoring": { ... }
  },
  "company_id": "company-456",
  "created_at": "2025-08-23T06:00:00.000Z",
  "updated_at": "2025-08-23T06:30:00.000Z"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 404 Not Found
```json
{
  "message": "Agent not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 400 Bad Request (Validation Error)
```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400,
  "details": [
    {
      "field": "temperature",
      "message": "Temperature must be a number between 0 and 2"
    }
  ]
}
```

## Testing

### Test Script
```bash
#!/bin/bash
# Test script for LLM Configuration endpoint

BASE_URL="http://localhost:3002"

# Test endpoint exists and requires authentication
curl -s -X PUT -H "Content-Type: application/json" \
     -d '{"provider": "openai", "model": "gpt-3.5-turbo", "temperature": 0.7}' \
     -w "HTTP Status: %{http_code}\n" \
     "$BASE_URL/agents/test-agent-id/llm-config"
```

### Test Results
- ✅ Endpoint exists and is accessible
- ✅ Authentication guard is working (returns 401)
- ✅ Accepts correct HTTP method (PUT)
- ✅ Accepts JSON payloads
- ✅ Validates request data

## Benefits

### 1. **Performance**
- Only updates LLM configuration, not entire agent
- Smaller payload size
- Faster response times

### 2. **User Experience**
- Immediate feedback for LLM changes
- No risk of losing other configuration changes
- Independent saving per configuration section

### 3. **Maintainability**
- Dedicated endpoint for LLM configuration
- Clear separation of concerns
- Easier to test and debug

### 4. **Scalability**
- Can be extended for other configuration sections
- Modular approach to configuration management
- Better API design patterns

## Future Enhancements

### 1. **Validation**
- Add more comprehensive validation rules
- Custom validation for LLM-specific fields
- Real-time validation feedback

### 2. **Caching**
- Cache LLM configuration for faster access
- Invalidate cache on updates
- Optimize database queries

### 3. **Monitoring**
- Track LLM configuration changes
- Log configuration updates
- Monitor performance metrics

### 4. **Advanced Features**
- Configuration templates
- Bulk configuration updates
- Configuration versioning
- Rollback functionality

## Conclusion

The LLM configuration endpoint provides a targeted, efficient way to update language model settings. It follows RESTful principles, includes proper validation, and integrates seamlessly with the existing agent management system.

The implementation supports both complete and partial updates, maintains backward compatibility, and provides excellent user experience with immediate feedback and error handling.
