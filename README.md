# AI Agent Platform

A comprehensive, enterprise-grade platform for creating, managing, and deploying autonomous AI agents that automate complex business workflows.

## 🚀 Overview

The AI Agent Platform is designed to transform static business processes into dynamic, intelligent operations. It provides a centralized solution for businesses to create AI agents that can execute complex workflows, make decisions, and interact with enterprise systems autonomously.

### Key Features

- **🤖 AI-Agnostic Architecture**: Support for multiple LLM providers (OpenAI, Google Gemini, Anthropic Claude)
- **🔧 Visual Workflow Builder**: Intuitive drag-and-drop interface for creating complex workflows
- **🏢 Multi-Tenant**: Company-based isolation with role-based access control
- **📊 Real-time Monitoring**: Live dashboard for tracking agent performance and workflow execution
- **🔗 External Integrations**: Built-in support for Slack, Email, Calendar, and custom APIs
- **📚 Knowledge Base Integration**: Connect agents to S3, Google Drive, and other data sources
- **🔒 Enterprise Security**: JWT authentication, role-based permissions, and data encryption

## 🏗️ Architecture

The platform follows a **Hybrid Microservices Architecture** with the following components:

### Core Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **AI Service** | Python/FastAPI | Centralized AI reasoning engine |
| **Auth Service** | NestJS | User authentication & authorization |
| **Company Service** | NestJS | Core business logic & workflow execution |
| **Agents Service** | NestJS | Agent lifecycle management |
| **Notifications Service** | NestJS | External communication (email, Slack) |
| **API Gateway** | Nginx | Request routing & security |
| **Frontend** | React/TypeScript | User interface |

### Infrastructure

- **Database**: MySQL 8.0 for persistent data
- **Cache**: Redis for session management and caching
- **Containerization**: Docker & Docker Compose
- **API Documentation**: Swagger/OpenAPI

## 🛠️ Technology Stack

### Backend Services
- **NestJS 10.2.10** - Structured, scalable Node.js framework
- **TypeScript 5.2.2** - Type-safe JavaScript
- **TypeORM 0.3.17** - Database ORM
- **JWT Authentication** - Secure API access
- **Class Validator** - Request validation

### AI Service
- **Python 3.11** - AI/ML ecosystem
- **FastAPI 0.104.1** - High-performance API framework
- **LangChain 0.1.0** - LLM orchestration
- **OpenAI/Google/Anthropic SDKs** - Multi-provider support
- **Redis 5.0.1** - Caching & message bus

### Frontend
- **React 18.2.0** - Component-based UI
- **TypeScript 5.2.2** - Type safety
- **TailwindCSS 3.3.5** - Utility-first styling
- **React Router 6.18.0** - Client-side routing
- **React Query 3.39.3** - Server state management
- **Zustand 4.4.6** - State management

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx 1.25** - Reverse proxy & load balancing
- **MySQL 8.0** - Primary database
- **Redis 6.2** - Caching & message bus

## 📦 Installation & Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-agent-platform
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize the database**
   ```bash
   ./scripts/init-database.sh
   ```

4. **Start the platform**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:80
   - **Unified Documentation Hub**: http://localhost/docs
   - Individual Service Docs: http://localhost/docs/{service}/

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_ROOT_PASSWORD=your-root-password
DB_NAME=ai_agent_platform
DB_USER=ai_user
DB_PASSWORD=your-db-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# AI Service API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# External Service Integration
SLACK_WEBHOOK_URL=your-slack-webhook-url
SENDGRID_API_KEY=your-sendgrid-api-key

# Redis Configuration
REDIS_URL=redis://redis:6379
```

## 🗄️ Database Management

### Initial Setup
The database is automatically initialized with all necessary tables and auth improvements:

```bash
./scripts/init-database.sh
```

This script:
- ✅ Creates all database tables with enhanced auth features
- ✅ Sets up refresh tokens, sessions, and audit logs
- ✅ Creates the default admin user
- ✅ Verifies all auth-related tables exist
- ✅ Tests database connectivity

### Database Schema
The platform includes comprehensive auth features:
- **Enhanced Users Table**: Refresh tokens, login attempts, email verification
- **Session Management**: Multi-device session tracking
- **Security Features**: Account locking, audit logs, password reset
- **Admin Tools**: User management and monitoring capabilities

### Default Credentials
- **Email**: admin@aiagentplatform.com
- **Password**: admin123

## 🚀 Development

### Local Development Setup

1. **Install dependencies for each service**
   ```bash
   # Auth Service
   cd auth && npm install
   
   # Company Service
   cd company && npm install
   
   # Agents Service
   cd agents && npm install
   
   # Notifications Service
   cd notifications && npm install
   
   # AI Service
   cd ai && pip install -r requirements.txt
   
   # Frontend
   cd frontend && npm install
   ```

2. **Start services individually**
   ```bash
   # Start database and Redis
   docker-compose up db redis -d
   
   # Start services in development mode
   cd auth && npm run start:dev
   cd company && npm run start:dev
   cd ai && uvicorn app.main:app --reload
   cd frontend && npm start
   ```

### API Documentation

#### Unified Documentation Hub
- **Main Documentation**: http://localhost/docs
- **Features**: Beautiful landing page with links to all service documentation

#### Individual Service Documentation
- **Auth Service**: http://localhost/docs/auth/
- **Company Service**: http://localhost/docs/company/
- **Agents Service**: http://localhost/docs/agents/
- **Notifications Service**: http://localhost/docs/notifications/
- **AI Service**: http://localhost/docs/ai/

#### Development Access (Direct)
- **Auth Service**: http://localhost:3001/docs
- **Company Service**: http://localhost:3002/docs
- **Agents Service**: http://localhost:3003/docs
- **Notifications Service**: http://localhost:3004/docs
- **AI Service**: http://localhost:8000/docs

## 📚 Usage Guide

### Creating Your First Agent

1. **Register/Login**: Create an account or sign in
2. **Create Company**: Set up your organization
3. **Create Agent**: Define agent goals and capabilities
4. **Build Workflow**: Use the visual workflow builder
5. **Deploy**: Activate your agent

### Workflow Builder

The visual workflow builder allows you to:

- **Drag & Drop**: Connect workflow steps visually
- **AI Integration**: Add AI reasoning steps
- **External APIs**: Connect to third-party services
- **Conditional Logic**: Add decision points
- **Error Handling**: Define fallback actions

### Knowledge Base Integration

Connect your agents to various data sources:

- **S3 Buckets**: Document storage
- **Google Drive**: File management
- **Custom APIs**: External data sources
- **Local Files**: Direct uploads

## 🔧 Configuration

### Database Schema

The platform uses MySQL with the following key tables:

- `users` - User accounts and profiles
- `companies` - Organization information
- `agents` - AI agent definitions
- `workflows` - Workflow configurations
- `workflow_executions` - Execution history
- `knowledge_bases` - Data source connections
- `integrations` - External service configurations

### Security

- **JWT Authentication**: Secure API access
- **Role-Based Access**: User, Manager, Admin roles
- **Company Isolation**: Multi-tenant data separation
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Cross-origin security

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Test Structure

- **Unit Tests**: Individual service testing
- **Integration Tests**: Service communication testing
- **E2E Tests**: Full user journey testing

## 📊 Monitoring & Logging

### Health Checks

- **Service Health**: `/health` endpoints
- **Database Connectivity**: Connection monitoring
- **External Services**: API availability checks

### Logging

- **Structured Logging**: JSON format logs
- **Request Tracing**: End-to-end request tracking
- **Error Monitoring**: Centralized error collection
- **Performance Metrics**: Response time tracking

## 🔄 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   DATABASE_URL=your-production-db-url
   REDIS_URL=your-production-redis-url
   ```

2. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Database Migrations**
   ```bash
   # Run database migrations
   npm run migration:run
   ```

### Scaling

- **Horizontal Scaling**: Multiple service instances
- **Load Balancing**: Nginx upstream configuration
- **Database Scaling**: Read replicas and sharding
- **Caching Strategy**: Redis cluster setup

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow coding standards
4. **Add tests**: Ensure good test coverage
5. **Submit PR**: Create pull request with description

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- **API Documentation**: Swagger UI for each service
- **Architecture Guide**: Detailed system design
- **User Guide**: Step-by-step usage instructions

### Community

- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions
- **Wiki**: Project documentation

### Enterprise Support

For enterprise customers, we provide:

- **Dedicated Support**: Priority issue resolution
- **Custom Development**: Feature development
- **Training**: Team training and workshops
- **Consulting**: Architecture and implementation guidance

## 🔮 Roadmap

### Upcoming Features

- **Advanced AI Models**: Custom model hosting
- **Workflow Templates**: Pre-built workflow library
- **Advanced Analytics**: Detailed performance insights
- **Mobile App**: iOS and Android applications
- **API Marketplace**: Third-party integrations
- **Advanced Security**: SSO, MFA, audit logs

### Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced workflow builder
- **v1.2.0**: Advanced AI integrations
- **v2.0.0**: Enterprise features and scaling

---

**Built with ❤️ by the AI Agent Platform Team**
