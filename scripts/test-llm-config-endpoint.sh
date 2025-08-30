#!/bin/bash

# Test script for LLM Configuration endpoint
echo "Testing LLM Configuration endpoint..."

# Base URL
BASE_URL="http://localhost:3002"

# Test 1: Check if the service is running
echo "1. Testing service health..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/health"

# Test 2: Test LLM config endpoint (should return 401 - unauthorized)
echo "2. Testing LLM config endpoint (should return 401)..."
curl -s -X PUT -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/agents/test-agent-id/llm-config"

# Test 3: Test with invalid token (should return 401)
echo "3. Testing with invalid token (should return 401)..."
curl -s -X PUT -H "Authorization: Bearer invalid-token" -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/agents/test-agent-id/llm-config"

# Test 4: Test with valid JSON payload (should return 401 due to auth, but validate endpoint exists)
echo "4. Testing with valid JSON payload..."
curl -s -X PUT -H "Content-Type: application/json" \
     -d '{
       "provider": "openai",
       "model": "gpt-3.5-turbo",
       "temperature": 0.7,
       "max_tokens": 1000,
       "top_p": 1,
       "frequency_penalty": 0,
       "presence_penalty": 0,
       "system_prompt": "You are a helpful assistant"
     }' \
     -o /dev/null -w "HTTP Status: %{http_code}\n" \
     "$BASE_URL/agents/test-agent-id/llm-config"

# Test 5: Check Swagger documentation
echo "5. Checking if endpoint is documented in Swagger..."
curl -s "$BASE_URL/docs" | grep -q "llm-config" && echo "✅ Endpoint found in Swagger docs" || echo "❌ Endpoint not found in Swagger docs"

echo "LLM Configuration endpoint tests completed!"
