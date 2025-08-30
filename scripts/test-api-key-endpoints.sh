#!/bin/bash

# Test script for API Key Management Endpoints
# This script demonstrates how to create, manage, and regenerate API keys

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPANY_SERVICE_URL="http://localhost:3002"
COMPANY_ID="test-company-123"
USER_TOKEN="test-jwt-token" # In production, this would be a real JWT token

echo -e "${BLUE}🔑 API Key Management Test${NC}"
echo "=================================="

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

# Function to create API key
create_api_key() {
    local name=$1
    local permissions=$2
    
    print_status "INFO" "Creating API key: $name"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$COMPANY_SERVICE_URL/api-keys" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d '{
            "name": "'$name'",
            "company_id": "'$COMPANY_ID'",
            "permissions": '$permissions'
        }')
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "API key created successfully"
        echo -e "${BLUE}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
        
        # Extract the API key for later use
        local api_key=$(echo "$response_body" | jq -r '.key' 2>/dev/null)
        if [ "$api_key" != "null" ] && [ -n "$api_key" ]; then
            echo "$api_key" > /tmp/test_api_key.txt
            print_status "INFO" "API key saved to /tmp/test_api_key.txt"
        fi
    else
        print_status "ERROR" "Failed to create API key (HTTP $http_code)"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Function to list API keys
list_api_keys() {
    print_status "INFO" "Listing API keys for company"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X GET "$COMPANY_SERVICE_URL/api-keys/company/$COMPANY_ID" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "API keys retrieved successfully"
        echo -e "${BLUE}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_status "ERROR" "Failed to retrieve API keys (HTTP $http_code)"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Function to regenerate API key
regenerate_api_key() {
    local api_key_id=$1
    
    print_status "INFO" "Regenerating API key: $api_key_id"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$COMPANY_SERVICE_URL/api-keys/$api_key_id/regenerate" \
        -H "Authorization: Bearer $USER_TOKEN")
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "API key regenerated successfully"
        echo -e "${BLUE}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
        
        # Extract the new API key
        local new_api_key=$(echo "$response_body" | jq -r '.key' 2>/dev/null)
        if [ "$new_api_key" != "null" ] && [ -n "$new_api_key" ]; then
            echo "$new_api_key" > /tmp/test_api_key.txt
            print_status "INFO" "New API key saved to /tmp/test_api_key.txt"
        fi
    else
        print_status "ERROR" "Failed to regenerate API key (HTTP $http_code)"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Function to test API key validation
test_api_key_validation() {
    local api_key=$1
    
    print_status "INFO" "Testing API key validation"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$COMPANY_SERVICE_URL/api-keys/validate" \
        -H "Content-Type: application/json" \
        -d '{"api_key": "'$api_key'"}')
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "API key validation successful"
        echo -e "${BLUE}Response:${NC}"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_status "ERROR" "API key validation failed (HTTP $http_code)"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Function to test API key with public API
test_api_key_with_public_api() {
    local api_key=$1
    
    print_status "INFO" "Testing API key with public API gateway"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "http://localhost:8080/v1/chat/completions" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" \
        -d '{
            "messages": [{"role": "user", "content": "Test message"}],
            "model": "gpt-3.5-turbo",
            "company_id": "'$COMPANY_ID'"
        }')
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        print_status "SUCCESS" "Public API test successful"
        echo -e "${BLUE}Response:${NC}"
        echo "$response_body" | jq '.data.choices[0].message.content' 2>/dev/null || echo "$response_body"
    else
        print_status "ERROR" "Public API test failed (HTTP $http_code)"
        echo -e "${RED}Response:${NC}"
        echo "$response_body"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}Starting API Key Management tests...${NC}"
    
    # Check if company service is running
    if ! curl -s -f "$COMPANY_SERVICE_URL/health" > /dev/null; then
        print_status "ERROR" "Company service is not running at $COMPANY_SERVICE_URL"
        exit 1
    fi
    
    print_status "SUCCESS" "Company service is running"
    
    echo ""
    echo -e "${BLUE}Running API Key Management tests...${NC}"
    echo "============================================="
    
    # Create API keys with different permissions
    create_api_key "Production API Key" '["read", "write", "chat", "workflow_execute"]'
    echo ""
    
    create_api_key "Read-Only API Key" '["read"]'
    echo ""
    
    create_api_key "Chat API Key" '["read", "chat"]'
    echo ""
    
    # List all API keys
    list_api_keys
    echo ""
    
    # Test API key validation (if we have a key)
    if [ -f "/tmp/test_api_key.txt" ]; then
        local test_key=$(cat /tmp/test_api_key.txt)
        test_api_key_validation "$test_key"
        echo ""
        
        test_api_key_with_public_api "$test_key"
        echo ""
    fi
    
    # Note: Regeneration requires a valid API key ID
    # In a real scenario, you would extract the ID from the list response
    print_status "INFO" "To test regeneration, use the API key ID from the list above"
    print_status "INFO" "Example: ./scripts/test-api-key-endpoints.sh regenerate <api-key-id>"
    
    echo ""
    echo -e "${GREEN}🎉 API Key Management tests completed!${NC}"
}

# Handle regeneration command
if [ "$1" = "regenerate" ] && [ -n "$2" ]; then
    regenerate_api_key "$2"
    exit 0
fi

# Run main function
main "$@"
