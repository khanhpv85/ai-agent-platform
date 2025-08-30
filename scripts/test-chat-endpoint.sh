#!/bin/bash

# Test script for AI Agent Platform Chat Endpoint
# This script tests the public API gateway chat functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_GATEWAY_URL="http://localhost:8080"
COMPANY_ID="test-company-123"
API_KEY="test-api-key-123"

echo -e "${BLUE}🤖 AI Agent Platform - Chat Endpoint Test${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "SUCCESS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "ERROR" ]; then
        echo -e "${RED}❌ $message${NC}"
    elif [ "$status" = "INFO" ]; then
        echo -e "${BLUE}ℹ️  $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    fi
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    
    print_status "INFO" "Checking if $service_name is running..."
    
    if curl -s -f "$url/health" > /dev/null; then
        print_status "SUCCESS" "$service_name is running"
        return 0
    else
        print_status "ERROR" "$service_name is not running at $url"
        return 1
    fi
}

# Function to create test API key
create_test_api_key() {
    print_status "INFO" "Creating test API key..."
    
    # This would normally be done through the internal API
    # For testing, we'll use a mock API key
    echo "$API_KEY"
}

# Function to test chat endpoint
test_chat_endpoint() {
    local api_key=$1
    
    print_status "INFO" "Testing chat endpoint..."
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_GATEWAY_URL/v1/chat/completions" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d '{
            "messages": [
                {"role": "user", "content": "Hello! How are you today?"}
            ],
            "model": "gpt-3.5-turbo",
            "temperature": 0.7,
            "max_tokens": 100,
            "company_id": "'$COMPANY_ID'"
        }')
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "Chat endpoint test passed"
        echo -e "${BLUE}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_status "ERROR" "Chat endpoint test failed with HTTP $http_code"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Function to test streaming chat endpoint
test_streaming_chat() {
    local api_key=$1
    
    print_status "INFO" "Testing streaming chat endpoint..."
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_GATEWAY_URL/v1/chat/completions/stream" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d '{
            "messages": [
                {"role": "user", "content": "Tell me a short story about a robot."}
            ],
            "model": "gpt-3.5-turbo",
            "temperature": 0.7,
            "max_tokens": 150,
            "company_id": "'$COMPANY_ID'"
        }')
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "Streaming chat endpoint test passed"
        echo -e "${BLUE}Streaming response:${NC}"
        echo "$response_body" | head -20
    else
        print_status "ERROR" "Streaming chat endpoint test failed with HTTP $http_code"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Function to test usage endpoint
test_usage_endpoint() {
    local api_key=$1
    
    print_status "INFO" "Testing usage endpoint..."
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_GATEWAY_URL/v1/usage" \
        -H "Authorization: Bearer $api_key")
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "Usage endpoint test passed"
        echo -e "${BLUE}Usage data:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_status "ERROR" "Usage endpoint test failed with HTTP $http_code"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}Starting API Gateway tests...${NC}"
    
    # Check if API Gateway is running
    if ! check_service "API Gateway" "$API_GATEWAY_URL"; then
        print_status "ERROR" "Please start the API Gateway first:"
        echo "  docker-compose up -d api-gateway"
        exit 1
    fi
    
    # Check if AI Service is running
    if ! check_service "AI Service" "http://localhost:8000"; then
        print_status "WARNING" "AI Service is not running. Some tests may fail."
    fi
    
    # Check if Company Service is running
    if ! check_service "Company Service" "http://localhost:3002"; then
        print_status "WARNING" "Company Service is not running. Some tests may fail."
    fi
    
    # Create test API key
    local test_api_key=$(create_test_api_key)
    
    echo ""
    echo -e "${BLUE}Running endpoint tests...${NC}"
    echo "=================================="
    
    # Test chat endpoint
    test_chat_endpoint "$test_api_key"
    
    echo ""
    
    # Test streaming chat endpoint
    test_streaming_chat "$test_api_key"
    
    echo ""
    
    # Test usage endpoint
    test_usage_endpoint "$test_api_key"
    
    echo ""
    echo -e "${GREEN}🎉 All tests completed!${NC}"
}

# Run main function
main "$@"
