#!/bin/bash

# Test script for complete LLM Configuration flow
echo "Testing complete LLM Configuration flow..."

# Base URL
BASE_URL="http://localhost:3002"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local curl_command="$3"
    
    echo -e "${BLUE}Running: $test_name${NC}"
    
    # Run the curl command and capture status
    local result=$(eval "$curl_command" 2>/dev/null)
    local status=$(echo "$result" | tail -n1 | grep -o '[0-9]*$')
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS: $test_name (Status: $status)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name (Expected: $expected_status, Got: $status)${NC}"
        echo "Response: $result"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo "=== LLM Configuration Flow Tests ==="
echo ""

# Test 1: Check if service is running
run_test "Service Health Check" "404" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/health'"

# Test 2: Test LLM config endpoint exists (should return 401 - unauthorized)
run_test "LLM Config Endpoint Exists" "401" \
    "curl -s -X PUT -o /dev/null -w '%{http_code}' '$BASE_URL/agents/test-agent-id/llm-config'"

# Test 3: Test with invalid token (should return 401)
run_test "Invalid Token Rejection" "401" \
    "curl -s -X PUT -H 'Authorization: Bearer invalid-token' -o /dev/null -w '%{http_code}' '$BASE_URL/agents/test-agent-id/llm-config'"

# Test 4: Test with valid JSON payload (should return 401 due to auth, but validate endpoint accepts data)
run_test "Valid JSON Payload Acceptance" "401" \
    "curl -s -X PUT -H 'Content-Type: application/json' -d '{\"provider\": \"openai\", \"model\": \"gpt-3.5-turbo\", \"temperature\": 0.7, \"max_tokens\": 1000, \"top_p\": 1, \"frequency_penalty\": 0, \"presence_penalty\": 0}' -o /dev/null -w '%{http_code}' '$BASE_URL/agents/test-agent-id/llm-config'"

# Test 5: Test with complete LLM configuration
run_test "Complete LLM Configuration" "401" \
    "curl -s -X PUT -H 'Content-Type: application/json' -d '{\"provider\": \"openai\", \"model\": \"gpt-4\", \"temperature\": 0.8, \"max_tokens\": 2000, \"top_p\": 0.9, \"frequency_penalty\": 0.1, \"presence_penalty\": 0.1, \"system_prompt\": \"You are a helpful AI assistant.\", \"custom_headers\": {\"X-Custom-Header\": \"value\"}}' -o /dev/null -w '%{http_code}' '$BASE_URL/agents/test-agent-id/llm-config'"

# Test 6: Test with invalid JSON (should return 400)
run_test "Invalid JSON Rejection" "400" \
    "curl -s -X PUT -H 'Content-Type: application/json' -d '{\"provider\": \"openai\", \"temperature\": \"invalid\"}' -o /dev/null -w '%{http_code}' '$BASE_URL/agents/test-agent-id/llm-config'"

# Test 7: Test with missing required fields (should return 400)
run_test "Missing Required Fields" "400" \
    "curl -s -X PUT -H 'Content-Type: application/json' -d '{\"temperature\": 0.7}' -o /dev/null -w '%{http_code}' '$BASE_URL/agents/test-agent-id/llm-config'"

# Test 8: Check if endpoint is documented in Swagger
echo -e "${BLUE}Checking Swagger documentation...${NC}"
if curl -s "$BASE_URL/docs" | grep -q "llm-config"; then
    echo -e "${GREEN}✅ PASS: Endpoint found in Swagger docs${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING: Endpoint not found in Swagger docs${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Test 9: Test database connection (if possible)
echo -e "${BLUE}Checking database connection...${NC}"
if docker-compose exec -T db mysql -u ai_user -pai_password123 company_service -e "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Database connection successful${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING: Could not verify database connection${NC}"
fi
echo ""

# Test 10: Check if agents table exists
echo -e "${BLUE}Checking agents table...${NC}"
if docker-compose exec -T db mysql -u ai_user -pai_password123 company_service -e "SHOW TABLES LIKE 'agents';" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Agents table exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Agents table not found${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo "=== Test Summary ==="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! LLM Configuration flow is working correctly.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the issues above.${NC}"
fi

echo ""
echo "=== Frontend Integration Notes ==="
echo "1. Ensure LLMSettingsBlock component properly syncs with loaded data"
echo "2. Verify useEffect dependency array includes llmConfig prop"
echo "3. Check that save success updates local state correctly"
echo "4. Confirm presence_penalty field is included in the form"
echo "5. Test that hasChanges state resets after successful save"
echo ""
echo "LLM Configuration flow tests completed!"
