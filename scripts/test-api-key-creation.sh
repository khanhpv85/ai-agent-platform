#!/bin/bash

echo "🔍 Testing API Key Creation Flow"
echo "=================================="

# Test 1: Check if companies endpoint is accessible
echo "1. Testing companies endpoint..."
curl -s "http://localhost:3002/companies/test" | jq .

echo -e "\n2. Testing API keys endpoint..."
curl -s "http://localhost:3002/api-keys/test" | jq .

echo -e "\n3. Testing companies endpoint with auth (should return 401)..."
curl -s "http://localhost:3002/companies" -H "Authorization: Bearer test-token" | jq .

echo -e "\n4. Testing API keys company endpoint with auth (should return 401)..."
curl -s "http://localhost:3002/api-keys/company/test-company-id" -H "Authorization: Bearer test-token" | jq .

echo -e "\n✅ Test completed. Check the responses above."
echo "📝 Note: 401 errors are expected when using test tokens."
