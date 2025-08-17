# Development Guide

This guide provides detailed information for developers working on the AI Agent Platform.

## 🏗️ Architecture Overview

The platform follows a **Hybrid Microservices Architecture** with the following design principles:

### Service Communication
- **Synchronous**: HTTP/REST APIs for direct service-to-service communication
- **Asynchronous**: Redis pub/sub for event-driven communication
- **API Gateway**: Nginx for request routing and security

### Data Flow
```
Frontend → API Gateway → Service → Database/Redis
                ↓
            AI Service (for AI operations)
```

## 🛠️ Development Environment Setup

### Prerequisites
- **Node.js 18+**: For NestJS services
- **Python 3.11+**: For AI service
- **Docker & Docker Compose**: For containerization
- **MySQL 8.0**: Database (provided via Docker)
- **Redis 6.2**: Cache and message bus (provided via Docker)

### Local Development

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd ai-agent-platform
   cp env.example .env
   # Edit .env with your configuration
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up db redis -d
   ```

3. **Install dependencies**
   ```bash
   # Backend services
   cd auth && npm install
   cd ../company && npm install
   cd ../agents && npm install
   cd ../notifications && npm install
   
   # AI service
   cd ../ai && pip install -r requirements.txt
   
   # Frontend
   cd ../frontend && npm install
   ```

4. **Start services in development mode**
   ```bash
   # Terminal 1: Auth Service
   cd auth && npm run start:dev
   
   # Terminal 2: Company Service
   cd company && npm run start:dev
   
   # Terminal 3: Agents Service
   cd agents && npm run start:dev
   
   # Terminal 4: Notifications Service
   cd notifications && npm run start:dev
   
   # Terminal 5: AI Service
   cd ai && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Terminal 6: Frontend
   cd frontend && npm start
   ```

## 📁 Project Structure

```
ai-agent-platform/
├── ai/                          # AI Service (Python/FastAPI)
│   ├── app/
│   │   ├── main.py             # FastAPI application
│   │   ├── config.py           # Configuration
│   │   ├── models.py           # Pydantic models
│   │   └── services/           # Business logic
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
├── auth/                        # Authentication Service (NestJS)
│   ├── src/
│   │   ├── main.ts             # Application entry point
│   │   ├── app.module.ts       # Root module
│   │   ├── auth.controller.ts  # API endpoints
│   │   ├── auth.service.ts     # Business logic
│   │   ├── entities/           # Database entities
│   │   ├── dto/                # Data transfer objects
│   │   └── strategies/         # Passport strategies
│   ├── package.json
│   └── Dockerfile
├── company/                     # Company Service (NestJS)
│   ├── src/
│   │   ├── users/              # User management
│   │   ├── workflows/          # Workflow execution
│   │   └── integrations/       # External integrations
│   ├── package.json
│   └── Dockerfile
├── agents/                      # Agents Service (NestJS)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── notifications/               # Notifications Service (NestJS)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── stores/             # State management
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   ├── package.json
│   └── Dockerfile
├── api/                         # API Gateway (Nginx)
│   ├── nginx.conf
│   └── Dockerfile
├── mysql/                       # Database initialization
│   └── init/
│       └── 01-init.sql
├── docker-compose.yml           # Service orchestration
├── env.example                  # Environment template
└── README.md                    # Project documentation
```

## 🔧 Service Development

### Adding a New Service

1. **Create service directory**
   ```bash
   mkdir new-service
   cd new-service
   ```

2. **Initialize NestJS service**
   ```bash
   npm init -y
   npm install @nestjs/common @nestjs/core @nestjs/platform-express
   # Add other dependencies as needed
   ```

3. **Add to docker-compose.yml**
   ```yaml
   new-service:
     build: { context: ./new-service }
     container_name: new-service
     restart: unless-stopped
     environment:
       - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}
     depends_on: [db]
     networks: [app-network]
   ```

4. **Update API Gateway**
   ```nginx
   location /api/new-service/ {
     rewrite ^/api/new-service/(.*) /$1 break;
     proxy_pass http://new-service:3000;
   }
   ```

### Database Migrations

1. **Create migration**
   ```bash
   cd auth
   npm run migration:generate -- -n CreateUsersTable
   ```

2. **Run migration**
   ```bash
   npm run migration:run
   ```

3. **Revert migration**
   ```bash
   npm run migration:revert
   ```

### API Development

#### NestJS Controller Example
```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() req) {
    return this.usersService.findAll(req.user.companyId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user);
  }
}
```

#### FastAPI Endpoint Example
```python
@app.post("/summarize", response_model=AIResponse)
async def summarize_text(request: SummarizeRequest):
    start_time = time.time()
    
    try:
        summary = await ai_service.summarize_text(request.text, request.model)
        
        return AIResponse(
            success=True,
            data={"summary": summary},
            model_used=request.model,
            tokens_used=ai_service.get_last_token_count(),
            execution_time_ms=int((time.time() - start_time) * 1000)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Integration Tests
```bash
# Run E2E tests
npm run test:e2e
```

### Test Structure
```
src/
├── __tests__/
│   ├── unit/
│   │   └── service.spec.ts
│   ├── integration/
│   │   └── controller.spec.ts
│   └── e2e/
│       └── app.e2e-spec.ts
```

### Test Examples

#### Unit Test (NestJS)
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user credentials', async () => {
    const user = new User();
    user.email = 'test@example.com';
    user.password_hash = await bcrypt.hash('password', 10);

    jest.spyOn(repository, 'findOne').mockResolvedValue(user);

    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
  });
});
```

#### Integration Test (FastAPI)
```python
def test_summarize_text():
    client = TestClient(app)
    
    response = client.post("/summarize", json={
        "text": "This is a test text for summarization.",
        "model": "gpt-3.5-turbo"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "summary" in data["data"]
```

## 🔍 Debugging

### NestJS Debugging
```bash
# Start with debug mode
npm run start:debug

# Attach debugger in VS Code
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Debug NestJS",
  "port": 9229,
  "restart": true,
  "localRoot": "${workspaceFolder}",
  "remoteRoot": "/app"
}
```

### FastAPI Debugging
```bash
# Start with debug mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### Database Debugging
```bash
# Connect to MySQL container
docker exec -it db mysql -u root -p

# View logs
docker-compose logs db
```

## 📊 Monitoring & Logging

### Logging Configuration
```typescript
// NestJS logging
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll() {
    this.logger.log('Finding all users');
    // ... implementation
  }
}
```

```python
# FastAPI logging
import logging

logger = logging.getLogger(__name__)

@app.post("/summarize")
async def summarize_text(request: SummarizeRequest):
    logger.info(f"Processing summarization request: {len(request.text)} characters")
    # ... implementation
```

### Health Checks
```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service'
    };
  }
}
```

## 🚀 Deployment

### Production Build
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:3306/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-production-secret
```

### Scaling
```yaml
# docker-compose.prod.yml
services:
  auth:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

## 🤝 Contributing

### Code Standards
- **TypeScript**: Use strict mode, proper typing
- **Python**: Follow PEP 8, type hints
- **React**: Functional components, hooks
- **Testing**: Minimum 80% coverage
- **Documentation**: JSDoc/TypeDoc comments

### Git Workflow
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m "Add amazing feature"`
3. Push to branch: `git push origin feature/amazing-feature`
4. Create pull request with description

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## 🆘 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check environment variables
docker-compose config

# Restart service
docker-compose restart service-name
```

#### Database Connection Issues
```bash
# Check database status
docker-compose ps db

# Check database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up db -d
```

#### API Gateway Issues
```bash
# Check nginx configuration
docker exec api-gateway nginx -t

# Reload nginx
docker exec api-gateway nginx -s reload
```

### Performance Issues
- **Database**: Check query performance, add indexes
- **Redis**: Monitor memory usage, implement eviction policies
- **Services**: Add caching, optimize database queries
- **Frontend**: Implement code splitting, lazy loading

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)

---

**Happy coding! 🎉**
