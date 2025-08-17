# Port Conflict Resolution

## 🚨 Issue Description

When trying to start the services, we encountered a port conflict error:

```
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint frontend-app: Bind for 0.0.0.0:3000 failed: port is already allocated
```

## 🔍 Root Cause Analysis

The issue was caused by **port conflicts** in the `docker-compose.yml` file:

- **Frontend service**: Trying to use port `3000:3000`
- **Auth service**: Also trying to use port `3000:3000`

Both services were attempting to bind to the same external port (3000), causing Docker to fail when starting the containers.

## ✅ Solution Applied

### 1. **Updated Port Mappings**

Reassigned port mappings to avoid conflicts:

```yaml
# Before (conflicting)
frontend:
  ports: ["3000:3000"]  # ✅ Keep this for frontend

auth:
  ports: ["3000:3000"]  # ❌ Conflict with frontend

# After (resolved)
frontend:
  ports: ["3000:3000"]  # ✅ Frontend on port 3000

auth:
  ports: ["3001:3000"]  # ✅ Auth service on port 3001

company:
  ports: ["3002:3000"]  # ✅ Company service on port 3002

agents:
  ports: ["3003:3000"]  # ✅ Agents service on port 3003

notifications:
  ports: ["3004:3000"]  # ✅ Notifications service on port 3004

ai:
  ports: ["8000:8000"]  # ✅ AI service on port 8000
```

### 2. **Updated Documentation**

Updated all documentation files to reflect the new port mappings:

- **README.md**: Updated development access URLs
- **docs/SWAGGER_IMPLEMENTATION_SUMMARY.md**: Updated port references
- **docs/DOCUMENTATION_FIXES_SUMMARY.md**: Updated port mappings
- **api/docs/index.html**: Updated direct access links
- **scripts/test-docs.sh**: Updated test URLs

### 3. **Final Port Assignment**

| Service | External Port | Internal Port | Purpose |
|---------|---------------|---------------|---------|
| Frontend | 3000 | 3000 | React application |
| Auth | 3001 | 3000 | Authentication service |
| Company | 3002 | 3000 | Company management |
| Agents | 3003 | 3000 | Agent management |
| Notifications | 3004 | 3000 | Notification service |
| AI | 8000 | 8000 | AI operations |
| API Gateway | 80 | 80 | Main gateway |
| Database | 3306 | 3306 | MySQL database |
| Redis | 6379 | 6379 | Cache/queue |

## 🧪 Verification

### Test Results
All services are now running successfully:

```bash
./scripts/test-docs.sh
```

**Output:**
```
✅ All 15 tests passed!

📋 Testing API Gateway Documentation
- Unified Documentation Hub... ✅ OK (Status: 200)
- Auth Service Documentation... ✅ OK (Status: 200)
- Company Service Documentation... ✅ OK (Status: 200)
- Agents Service Documentation... ✅ OK (Status: 200)
- Notifications Service Documentation... ✅ OK (Status: 200)
- AI Service Documentation... ✅ OK (Status: 200)

🔧 Testing Direct Service Access
- Auth service on port 3001... ✅ Running
- Company service on port 3002... ✅ Running
- Agents service on port 3003... ✅ Running
- Notifications service on port 3004... ✅ Running
- AI service on port 8000... ✅ Running
```

### Access URLs

#### Production Access (via API Gateway)
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:80
- **Documentation Hub**: http://localhost/docs

#### Development Access (Direct)
- **Auth Service**: http://localhost:3001/docs
- **Company Service**: http://localhost:3002/docs
- **Agents Service**: http://localhost:3003/docs
- **Notifications Service**: http://localhost:3004/docs
- **AI Service**: http://localhost:8000/docs

## 📝 Lessons Learned

### 1. **Port Planning**
- Always plan port assignments before implementing
- Avoid conflicts between services
- Document port mappings clearly

### 2. **Docker Compose Best Practices**
- Use consistent port mapping patterns
- Keep frontend on standard ports (3000, 8080, etc.)
- Use sequential ports for backend services

### 3. **Documentation Maintenance**
- Update all documentation when port mappings change
- Include both production and development access URLs
- Maintain testing scripts for verification

### 4. **Troubleshooting Steps**
1. Check for port conflicts: `lsof -i :<port>`
2. Stop all containers: `docker-compose down`
3. Update port mappings in docker-compose.yml
4. Update documentation and test scripts
5. Rebuild and restart: `docker-compose up -d`
6. Verify with test script: `./scripts/test-docs.sh`

## 🔄 Future Considerations

### Port Management Strategy
- Consider using environment variables for port assignments
- Implement port validation in startup scripts
- Add port conflict detection in CI/CD pipelines

### Documentation Strategy
- Keep port mappings in a central configuration file
- Automate documentation updates when ports change
- Include port information in service health checks

---

**Resolution Date**: December 2024
**Status**: ✅ Resolved - All services running successfully
**Next Review**: When adding new services
