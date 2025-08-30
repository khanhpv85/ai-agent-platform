#!/bin/bash

# Test script for Knowledge Base API endpoints
echo "Testing Knowledge Base API endpoints..."

# Base URL
BASE_URL="http://localhost:3002"

# Test 1: Check if the service is running
echo "1. Testing service health..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/health"

# Test 2: Test knowledge bases endpoint (should return 401 - unauthorized)
echo "2. Testing knowledge bases endpoint (should return 401)..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/knowledge-bases/company/test-company"

# Test 3: Test with invalid token (should return 401)
echo "3. Testing with invalid token (should return 401)..."
curl -s -H "Authorization: Bearer invalid-token" -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/knowledge-bases/company/test-company"

# Test 4: Check database connection
echo "4. Checking database connection..."
docker-compose exec db mysql -u ai_user -pai_password123 company_service -e "SELECT COUNT(*) as knowledge_base_count FROM knowledge_bases;" 2>/dev/null

# Test 5: Check if the knowledge_bases table exists and has correct structure
echo "5. Checking table structure..."
docker-compose exec db mysql -u ai_user -pai_password123 company_service -e "SHOW TABLES LIKE 'knowledge_bases';" 2>/dev/null

echo "API tests completed!"
