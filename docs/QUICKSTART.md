# 🚀 AI Agent Platform - Quick Start Guide

Welcome to the AI Agent Platform! This guide will help you get started with our AI PaaS platform for building intelligent applications with autonomous agents and workflows.

## 📋 Prerequisites

- Node.js 18+ or Python 3.8+
- An API key from the AI Agent Platform dashboard
- Basic knowledge of JavaScript/TypeScript or Python

## 🔑 Getting Your API Key

1. **Sign up** at [https://aiagentplatform.com](https://aiagentplatform.com)
2. **Create a company** in your dashboard
3. **Generate an API key** in the API Keys section
4. **Copy your API key** - you'll need it for authentication

## 🛠️ Installation

### JavaScript/TypeScript

```bash
npm install @aiagentplatform/sdk
```

### Python

```bash
pip install aiagentplatform
```

## 🚀 Quick Start Examples

### 1. Chat with AI

#### JavaScript/TypeScript

```typescript
import AIAgentPlatform from '@aiagentplatform/sdk';

const client = new AIAgentPlatform({
  apiKey: 'your-api-key-here',
  company_id: 'your-company-id'
});

// Simple chat
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Hello! How can you help me today?' }
  ],
  model: 'gpt-3.5-turbo',
  company_id: 'your-company-id'
});

console.log(response.data.choices[0].message.content);
```

#### Python

```python
from aiagentplatform import AIAgentPlatform

client = AIAgentPlatform(
    api_key="your-api-key-here",
    company_id="your-company-id"
)

response = client.chat(
    messages=[
        {"role": "user", "content": "Hello! How can you help me today?"}
    ],
    model="gpt-3.5-turbo"
)

print(response.data.choices[0].message.content)
```

### 2. Streaming Chat

#### JavaScript/TypeScript

```typescript
// Streaming chat
const stream = client.chatStream({
  messages: [
    { role: 'user', content: 'Tell me a story about a robot.' }
  ],
  model: 'gpt-3.5-turbo',
  company_id: 'your-company-id'
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

#### Python

```python
# Streaming chat
stream = client.chat_stream(
    messages=[
        {"role": "user", "content": "Tell me a story about a robot."}
    ],
    model="gpt-3.5-turbo"
)

for chunk in stream:
    print(chunk, end='', flush=True)
```

### 3. Execute Autonomous Workflows

#### JavaScript/TypeScript

```typescript
// Execute a workflow
const workflowResponse = await client.executeWorkflow({
  workflow_id: 'your-workflow-id',
  input_data: {
    customer_query: 'I need help with my order',
    customer_id: '12345'
  },
  company_id: 'your-company-id'
});

console.log('Workflow executed:', workflowResponse.data.execution_id);
console.log('Status:', workflowResponse.data.status);

// Check workflow status
const status = await client.getWorkflowStatus(workflowResponse.data.execution_id);
console.log('Current status:', status);
```

#### Python

```python
# Execute a workflow
workflow_response = client.execute_workflow(
    workflow_id="your-workflow-id",
    input_data={
        "customer_query": "I need help with my order",
        "customer_id": "12345"
    }
)

print(f"Workflow executed: {workflow_response.data.execution_id}")
print(f"Status: {workflow_response.data.status}")

# Check workflow status
status = client.get_workflow_status(workflow_response.data.execution_id)
print(f"Current status: {status}")
```

### 4. Check Usage Statistics

#### JavaScript/TypeScript

```typescript
// Get usage statistics
const usage = await client.getUsageStats();
console.log('Current usage:', usage.current_month_usage);
console.log('Monthly limit:', usage.monthly_limit);
console.log('Usage percentage:', usage.usage_percentage);
```

#### Python

```python
# Get usage statistics
usage = client.get_usage_stats()
print(f"Current usage: {usage.current_month_usage}")
print(f"Monthly limit: {usage.monthly_limit}")
print(f"Usage percentage: {usage.usage_percentage}")
```

## 🔧 Advanced Examples

### 1. Multi-turn Conversation

```typescript
const conversation = [
  { role: 'system', content: 'You are a helpful customer service agent.' },
  { role: 'user', content: 'I have a problem with my order #12345' },
  { role: 'assistant', content: 'I can help you with that. What seems to be the issue?' },
  { role: 'user', content: 'It hasn\'t arrived yet and it\'s been 5 days' }
];

const response = await client.chat({
  messages: conversation,
  model: 'gpt-4',
  temperature: 0.7,
  company_id: 'your-company-id'
});
```

### 2. Complex Workflow with Multiple Steps

```typescript
// Execute a complex workflow
const workflowResponse = await client.executeWorkflow({
  workflow_id: 'customer-support-workflow',
  input_data: {
    customer_query: 'My order is late',
    customer_id: '12345',
    order_id: 'ORD-789',
    priority: 'high',
    channel: 'email'
  },
  company_id: 'your-company-id'
});

// Monitor workflow progress
let status = workflowResponse.data.status;
while (status === 'running') {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  const statusResponse = await client.getWorkflowStatus(workflowResponse.data.execution_id);
  status = statusResponse.status;
  console.log('Workflow status:', status);
}

console.log('Workflow completed with result:', workflowResponse.data.result);
```

### 3. Error Handling

```typescript
try {
  const response = await client.chat({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'gpt-4',
    company_id: 'your-company-id'
  });
} catch (error) {
  if (error.message === 'Rate limit exceeded') {
    console.log('You\'ve hit your rate limit. Please upgrade your plan.');
  } else if (error.message === 'Invalid API key') {
    console.log('Please check your API key.');
  } else {
    console.log('An error occurred:', error.message);
  }
}
```

## 📊 Rate Limits

| Plan | Requests/Minute | Requests/Month |
|------|----------------|----------------|
| Free | 10 | 1,000 |
| Pro | 100 | 100,000 |
| Enterprise | 1,000 | 1,000,000 |

## 🔒 Security Best Practices

1. **Never expose your API key** in client-side code
2. **Use environment variables** to store API keys
3. **Rotate API keys** regularly
4. **Monitor usage** to prevent unexpected charges
5. **Use HTTPS** for all API calls

## 📚 Next Steps

1. **Explore the API Documentation**: Visit [https://docs.aiagentplatform.com](https://docs.aiagentplatform.com)
2. **Join our Community**: [Discord](https://discord.gg/aiagentplatform)
3. **Check out Examples**: [GitHub Examples](https://github.com/aiagentplatform/examples)
4. **Build your first agent**: Follow our [Agent Building Guide](https://docs.aiagentplatform.com/agents)

## 🆘 Need Help?

- **Documentation**: [https://docs.aiagentplatform.com](https://docs.aiagentplatform.com)
- **Support**: [support@aiagentplatform.com](mailto:support@aiagentplatform.com)
- **Discord**: [https://discord.gg/aiagentplatform](https://discord.gg/aiagentplatform)
- **GitHub Issues**: [https://github.com/aiagentplatform/sdk-javascript/issues](https://github.com/aiagentplatform/sdk-javascript/issues)

---

Happy building! 🚀
