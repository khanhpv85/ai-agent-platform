# API Documentation Guide

This document provides comprehensive information about the API documentation for all services in the AI Agent Platform.

## 📚 Service Documentation URLs

### Development Environment
- **Auth Service**: http://localhost:3000/docs
- **Company Service**: http://localhost:3001/docs  
- **Agents Service**: http://localhost:3002/docs
- **Notifications Service**: http://localhost:3003/docs
- **AI Service**: http://localhost:8000/docs

### Production Environment
- **API Gateway**: https://your-domain.com/docs
- **Individual Services**: Available through internal network

## 🔧 Swagger/OpenAPI Implementation

### NestJS Services (Auth, Company, Agents, Notifications)

All NestJS services use `@nestjs/swagger` for API documentation with the following features:

#### Configuration
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('AI Agent Platform - [Service Name]')
  .setDescription('[Service description]')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

#### Decorators Used
- `@ApiTags()` - Group endpoints by category
- `@ApiOperation()` - Describe endpoint purpose and behavior
- `@ApiResponse()` - Document response schemas and status codes
- `@ApiBearerAuth()` - Indicate authentication requirements
- `@ApiProperty()` - Document DTO properties with examples

#### Example Enhanced Endpoint
```typescript
@Post('login')
@ApiOperation({ 
  summary: 'User login',
  description: 'Authenticate user with email and password. Returns JWT token and user information.',
  tags: ['Authentication']
})
@ApiResponse({ 
  status: 200, 
  description: 'Login successful',
  schema: {
    type: 'object',
    properties: {
      access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-123' },
          email: { type: 'string', example: 'user@example.com' },
          // ... more properties
        }
      }
    }
  }
})
@ApiResponse({ 
  status: 401, 
  description: 'Invalid credentials',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 401 },
      message: { type: 'string', example: 'Invalid credentials' },
      error: { type: 'string', example: 'Unauthorized' }
    }
  }
})
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

### FastAPI Service (AI Service)

The AI service uses FastAPI's built-in OpenAPI support with enhanced documentation:

#### Configuration
```python
app = FastAPI(
    title="AI Agent Platform - AI Service",
    description="""
    # AI Agent Platform - AI Service
    
    Centralized AI reasoning engine for the AI Agent Platform. This service provides a unified interface for AI operations including text summarization, data extraction, classification, content generation, and chat completion.
    
    ## Features
    
    - **Multi-Provider Support**: Works with OpenAI, Google Gemini, and Anthropic Claude
    - **Caching**: Intelligent caching to reduce API costs and improve response times
    - **Logging**: Comprehensive request logging and monitoring
    - **Error Handling**: Robust error handling with detailed error messages
    """,
    version="1.0.0",
    contact={
        "name": "AI Agent Platform Team",
        "email": "support@aiagentplatform.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)
```

#### Enhanced Endpoints
```python
@app.post("/summarize", 
    response_model=AIResponse,
    summary="Summarize Text",
    description="Summarize text using AI models. Supports multiple AI providers and includes intelligent caching.",
    response_description="AI-generated text summary",
    tags=["AI Operations"]
)
async def summarize_text(request: SummarizeRequest):
    """
    Summarize text using AI models.
    
    This endpoint uses AI to create concise summaries of provided text. The service supports
    multiple AI providers and includes intelligent caching to reduce costs and improve performance.
    
    Args:
        request (SummarizeRequest): The text to summarize and model configuration
        
    Returns:
        AIResponse: Summary with metadata including tokens used and execution time
        
    Raises:
        HTTPException: If the AI service encounters an error
    """
    # Implementation...
```

## 📋 API Endpoints by Service

### Authentication Service (`/auth`)
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password
- `POST /auth/users` - Create user (Admin)
- `PUT /auth/users/:id` - Update user (Admin)

### Company Service (`/company`)
- `GET /company` - Get user companies
- `GET /company/:id` - Get company details
- `POST /company` - Create company
- `PUT /company/:id` - Update company
- `DELETE /company/:id` - Delete company

#### Workflows Module
- `GET /workflows/agent/:agentId` - Get agent workflows
- `GET /workflows/:id` - Get workflow details
- `POST /workflows` - Create workflow
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow
- `POST /workflows/:id/execute` - Execute workflow
- `GET /workflows/:id/executions` - Get workflow executions

#### Integrations Module
- `GET /integrations/company/:companyId` - Get company integrations
- `GET /integrations/:id` - Get integration details
- `POST /integrations` - Create integration
- `PUT /integrations/:id` - Update integration
- `DELETE /integrations/:id` - Delete integration
- `POST /integrations/:id/test` - Test integration

### Agents Service (`/agents`)
- `GET /agents/company/:companyId` - Get company agents
- `GET /agents/:id` - Get agent details
- `POST /agents` - Create agent
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent

### Notifications Service (`/notifications`)
- `POST /notifications/send` - Send notification
- `GET /notifications/health` - Health check

### AI Service (`/ai`)
- `GET /health` - Health check
- `POST /summarize` - Summarize text
- `POST /extract` - Extract structured data
- `POST /classify` - Classify text
- `POST /generate` - Generate content
- `POST /chat` - Chat completion
- `GET /models` - List available models

## 🔐 Authentication

All protected endpoints require JWT Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/endpoint
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

## 🧪 Testing APIs

### Using Swagger UI
1. Navigate to the service documentation URL (e.g., http://localhost:3000/docs)
2. Click "Authorize" and enter your JWT token
3. Use the interactive interface to test endpoints

### Using curl
```bash
# Login to get token
curl -X POST "http://localhost:3000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'

# Use token for authenticated requests
curl -X GET "http://localhost:3000/company" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
```

### Using Postman
1. Import the OpenAPI specification from `/openapi.json`
2. Set up environment variables for base URL and token
3. Use the imported collection for testing

## 📈 Monitoring and Logging

### Request Logging
All services log API requests with:
- Request method and path
- Response status code
- Execution time
- User ID (for authenticated requests)
- Request/response size

### Error Tracking
- Detailed error messages
- Stack traces (in development)
- Error categorization
- Performance metrics

## 🔄 API Versioning

Current API version: `v1.0`

Versioning strategy:
- URL-based: `/api/v1/endpoint`
- Header-based: `Accept: application/vnd.api+json;version=1.0`
- Default to latest version when not specified

## 📝 Contributing to Documentation

### Adding New Endpoints
1. Use appropriate decorators (`@ApiOperation`, `@ApiResponse`)
2. Provide comprehensive descriptions
3. Include request/response examples
4. Document error scenarios
5. Add to this documentation guide

### Updating Existing Documentation
1. Update decorators with new information
2. Refresh examples and schemas
3. Update this guide
4. Test documentation accuracy

## 🚀 Best Practices

### Documentation Standards
- Use clear, concise descriptions
- Provide realistic examples
- Document all possible response codes
- Include authentication requirements
- Add usage examples

### Code Organization
- Group related endpoints with `@ApiTags`
- Use consistent naming conventions
- Maintain separation of concerns
- Keep documentation close to implementation

### Testing
- Test all documented endpoints
- Verify response schemas
- Check error handling
- Validate authentication flows

## 📞 Support

For API documentation issues or questions:
- Check the service-specific documentation
- Review the OpenAPI specification
- Contact the development team
- Submit issues through the project repository

---

**Last Updated**: December 2024
**Version**: 1.0.0
