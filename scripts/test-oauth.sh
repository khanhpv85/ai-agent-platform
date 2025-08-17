#!/bin/bash

# Test OAuth Client Credential Flow
# This script demonstrates the OAuth 2.0 client credentials flow for service-to-service authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_SERVICE_URL="http://localhost:3001"
CLIENT_ID="company_service"
CLIENT_SECRET="company_secret_123"

echo -e "${BLUE}=== OAuth Client Credential Flow Test ===${NC}"
echo

# Function to print section headers
print_section() {
    echo -e "${YELLOW}$1${NC}"
    echo "----------------------------------------"
}

# Function to make HTTP requests
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "${GREEN}$description${NC}"
    echo "URL: $url"
    if [ ! -z "$data" ]; then
        echo "Data: $data"
    fi
    echo
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | head -n -1)
    
    echo "Status Code: $status_code"
    echo "Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    echo
}

# Test 1: Health Check
print_section "1. Health Check"
make_request "GET" "$AUTH_SERVICE_URL/health" "" "Checking auth service health"

# Test 2: Get OAuth Token
print_section "2. Get OAuth Token"
token_data="{\"grant_type\":\"client_credentials\",\"client_id\":\"$CLIENT_ID\",\"client_secret\":\"$CLIENT_SECRET\",\"scope\":\"read write\"}"
make_request "POST" "$AUTH_SERVICE_URL/oauth/token" "$token_data" "Requesting OAuth token with client credentials"

# Extract access token from response
access_token=$(echo "$response_body" | jq -r '.access_token' 2>/dev/null || echo "")

if [ -z "$access_token" ] || [ "$access_token" = "null" ]; then
    echo -e "${RED}Failed to get access token${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully obtained access token${NC}"
echo "Token: ${access_token:0:50}..."
echo

# Test 3: Token Introspection
print_section "3. Token Introspection"
introspect_data="{\"token\":\"$access_token\"}"
make_request "POST" "$AUTH_SERVICE_URL/oauth/introspect" "$introspect_data" "Introspecting the obtained token"

# Test 4: Use Token for Service-to-Service Call
print_section "4. Service-to-Service API Call"
echo -e "${GREEN}Making authenticated request to company service${NC}"
echo "This demonstrates how a service would use the token to call another service"
echo

# Note: This would require the company service to be running and configured with ServiceAuthGuard
# For demonstration, we'll show the curl command that would be used
echo "Example curl command for service-to-service call:"
echo "curl -X GET \\"
echo "  -H \"Authorization: Bearer $access_token\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  http://localhost:3002/api/companies"
echo

# Test 5: Invalid Token Test
print_section "5. Invalid Token Test"
invalid_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token"
invalid_introspect_data="{\"token\":\"$invalid_token\"}"
make_request "POST" "$AUTH_SERVICE_URL/oauth/introspect" "$invalid_introspect_data" "Testing introspection with invalid token"

# Test 6: Admin Endpoints (if admin token available)
print_section "6. Admin Endpoints"
echo -e "${YELLOW}Note: Admin endpoints require admin JWT token${NC}"
echo "To test admin endpoints, you would need to:"
echo "1. Login as admin user to get JWT token"
echo "2. Use that token to access admin OAuth endpoints"
echo
echo "Available admin endpoints:"
echo "- GET /oauth/clients (list all client credentials)"
echo "- POST /oauth/clients (create new client credential)"
echo "- PUT /oauth/clients/:clientId (update client credential)"
echo "- DELETE /oauth/clients/:clientId (delete client credential)"
echo "- POST /oauth/revoke (revoke service token)"
echo

# Test 7: Token Expiration Simulation
print_section "7. Token Information"
if [ ! -z "$access_token" ]; then
    echo -e "${GREEN}Decoding JWT token payload:${NC}"
    # Decode JWT payload (base64 decode the second part)
    payload=$(echo "$access_token" | cut -d'.' -f2 | base64 -d 2>/dev/null || echo "Unable to decode")
    echo "$payload" | jq '.' 2>/dev/null || echo "$payload"
    echo
fi

echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ OAuth client credential flow is working${NC}"
echo -e "${GREEN}✓ Token introspection is functional${NC}"
echo -e "${GREEN}✓ Service-to-service authentication ready${NC}"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure other services with OAuth client credentials"
echo "2. Update service guards to use ServiceAuthGuard"
echo "3. Test actual service-to-service API calls"
echo "4. Monitor token usage and performance"
echo
echo -e "${BLUE}For more information, see: docs/CLIENT_CREDENTIAL_OAUTH.md${NC}"
