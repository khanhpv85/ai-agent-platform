# Quick Start Guide

Get up and running with the AI Agent Platform in minutes!

## 🚀 Prerequisites

- **Docker & Docker Compose** (latest version)
- **Git** (for cloning the repository)
- **Text Editor** (VS Code recommended)

## ⚡ Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-agent-platform
```

### 2. Configure Environment
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings
# At minimum, update these values:
# - DB_ROOT_PASSWORD (choose a secure password)
# - JWT_SECRET (generate a random string)
# - OPENAI_API_KEY (get from OpenAI)
```

### 3. Start the Platform
```bash
# Run the setup script
./scripts/setup.sh

# Or manually:
docker-compose up -d
```

### 4. Access the Platform
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:80
- **Auth Service Docs**: http://localhost:3000/docs
- **AI Service Docs**: http://localhost:8000/docs

## 🎯 First Steps

### 1. Create Your Account
1. Navigate to http://localhost:3000
2. Click "Register" to create a new account
3. Fill in your details and company information
4. Verify your email (if configured)

### 2. Create Your First Agent
1. Log in to the platform
2. Navigate to "Agents" in the sidebar
3. Click "Create New Agent"
4. Define your agent's purpose and capabilities
5. Save the agent

### 3. Build Your First Workflow
1. Select your agent
2. Click "Workflows" tab
3. Use the visual workflow builder
4. Add steps like:
   - **AI Reasoning**: Process data with AI
   - **API Call**: Connect to external services
   - **Condition**: Add decision logic
   - **Notification**: Send alerts

### 4. Deploy and Monitor
1. Activate your workflow
2. Monitor execution in real-time
3. View logs and performance metrics
4. Iterate and improve

## 🔧 Configuration Options

### AI Service Configuration
```env
# OpenAI (recommended for beginners)
OPENAI_API_KEY=your-openai-api-key

# Google Gemini (alternative)
GOOGLE_API_KEY=your-google-api-key

# Anthropic Claude (alternative)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### External Integrations
```env
# Email notifications (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key

# Slack notifications
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Database Configuration
```env
# Database settings (defaults work for most cases)
DB_ROOT_PASSWORD=your-secure-password
DB_NAME=ai_agent_platform
DB_USER=ai_user
DB_PASSWORD=your-db-password
```

## 📊 Monitoring Your Platform

### Service Health
```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs -f auth-service
```

### Database Status
```bash
# Connect to database
docker exec -it db mysql -u root -p

# Check tables
USE ai_agent_platform;
SHOW TABLES;
```

### API Health Checks
- Auth Service: http://localhost:3000/health
- AI Service: http://localhost:8000/health
- API Gateway: http://localhost/health

## 🛠️ Common Operations

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart auth-service
```

### Update Platform
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Database
```bash
# Create backup
docker exec db mysqldump -u root -p ai_agent_platform > backup.sql

# Restore backup
docker exec -i db mysql -u root -p ai_agent_platform < backup.sql
```

### Reset Platform
```bash
# Stop all services
docker-compose down

# Remove all data (WARNING: This deletes everything!)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 🎨 Customization

### Frontend Customization
```bash
# Edit frontend code
cd frontend/src

# Start frontend in development mode
cd frontend
npm install
npm start
```

### Backend Customization
```bash
# Edit service code
cd auth/src  # or company/src, agents/src, etc.

# Start service in development mode
cd auth
npm install
npm run start:dev
```

### AI Service Customization
```bash
# Edit AI service code
cd ai/app

# Start AI service in development mode
cd ai
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🔍 Troubleshooting

### Platform Won't Start
```bash
# Check Docker status
docker --version
docker-compose --version

# Check available ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :80

# Check disk space
df -h
```

### Database Issues
```bash
# Check database container
docker-compose ps db

# View database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up db -d
```

### API Issues
```bash
# Test API endpoints
curl http://localhost/health
curl http://localhost:3000/health
curl http://localhost:8000/health

# Check API gateway logs
docker-compose logs api-gateway
```

### Frontend Issues
```bash
# Check frontend container
docker-compose ps frontend

# View frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

## 📚 Next Steps

### Learn More
- **Architecture**: Read `docs/REQUIREMENT.md`
- **Development**: Read `docs/DEVELOPMENT.md`
- **API Documentation**: Visit service docs URLs

### Advanced Features
- **Custom AI Models**: Integrate your own models
- **Advanced Workflows**: Build complex automation
- **External APIs**: Connect to your business systems
- **Analytics**: Monitor and optimize performance

### Community & Support
- **Issues**: Report bugs on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Contributions**: Submit pull requests
- **Documentation**: Help improve docs

## 🎉 Congratulations!

You've successfully set up the AI Agent Platform! 

**What's next?**
1. Create your first AI agent
2. Build a simple workflow
3. Connect to external services
4. Monitor and optimize performance
5. Scale for production use

**Need help?**
- Check the troubleshooting section above
- Visit the documentation
- Join the community discussions
- Open an issue for bugs

---

**Happy automating! 🤖✨**
