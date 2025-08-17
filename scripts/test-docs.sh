#!/bin/bash

# Test Documentation URLs Script
# This script tests all documentation endpoints to ensure they're working correctly

echo "🚀 Testing AI Agent Platform Documentation URLs"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    local expected_status=$3
    
    echo -n "Testing $description... "
    
    # Use curl to test the URL
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (Status: $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (Expected: $expected_status, Got: $response)${NC}"
        return 1
    fi
}

# Function to test if service is running
test_service() {
    local port=$1
    local service_name=$2
    
    echo -n "Testing $service_name service on port $port... "
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

# Test API Gateway
echo -e "${BLUE}📋 Testing API Gateway Documentation${NC}"
echo "----------------------------------------"

test_url "http://localhost/docs" "Unified Documentation Hub" "200"
test_url "http://localhost/docs/auth/" "Auth Service Documentation (via Gateway)" "200"
test_url "http://localhost/docs/company/" "Company Service Documentation (via Gateway)" "200"
test_url "http://localhost/docs/agents/" "Agents Service Documentation (via Gateway)" "200"
test_url "http://localhost/docs/notifications/" "Notifications Service Documentation (via Gateway)" "200"
test_url "http://localhost/docs/ai/" "AI Service Documentation (via Gateway)" "200"

echo ""
echo -e "${BLUE}🔧 Testing Direct Service Access${NC}"
echo "-----------------------------------"

# Test individual services
test_service "3001" "Auth"
test_service "3002" "Company"
test_service "3003" "Agents"
test_service "3004" "Notifications"
test_service "8000" "AI"

echo ""
echo -e "${BLUE}📚 Testing Direct Documentation URLs${NC}"
echo "----------------------------------------"

test_url "http://localhost:3001/docs" "Auth Service Direct Documentation" "200"
test_url "http://localhost:3002/docs" "Company Service Direct Documentation" "200"
test_url "http://localhost:3003/docs" "Agents Service Direct Documentation" "200"
test_url "http://localhost:3004/docs" "Notifications Service Direct Documentation" "200"
test_url "http://localhost:8000/docs" "AI Service Direct Documentation" "200"

echo ""
echo -e "${BLUE}🔗 Testing API Gateway Health${NC}"
echo "--------------------------------"

test_url "http://localhost/health" "API Gateway Health Check" "200"

echo ""
echo -e "${BLUE}📊 Summary${NC}"
echo "--------"

echo -e "${YELLOW}Documentation Access Options:${NC}"
echo "1. Unified Hub: http://localhost/docs"
echo "2. Individual (via Gateway): http://localhost/docs/{service}/"
echo "3. Direct Access: http://localhost:{port}/docs"
echo "   - Auth: 3001, Company: 3002, Agents: 3003, Notifications: 3004, AI: 8000"
echo ""
echo -e "${YELLOW}API Gateway Routes:${NC}"
echo "• Auth: http://localhost/api/auth/"
echo "• Company: http://localhost/api/company/"
echo "• Agents: http://localhost/api/agents/"
echo "• Notifications: http://localhost/api/notifications/"
echo "• AI: http://localhost/api/ai/"
echo ""
echo -e "${GREEN}✅ Documentation testing completed!${NC}"
