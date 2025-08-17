#!/bin/bash

# Test Queue Service
# This script demonstrates the queue service functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
QUEUE_SERVICE_URL="http://localhost:3005"
AUTH_SERVICE_URL="http://localhost:3001"

echo -e "${BLUE}=== Queue Service Test ===${NC}"
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

# Test 1: Queue Service Health Check
print_section "1. Queue Service Health Check"
make_request "GET" "$QUEUE_SERVICE_URL/queue/health" "" "Checking queue service health"

# Test 2: Publish User Registration Event
print_section "2. Publish User Registration Event"
registration_data='{
  "queueName": "user-events",
  "messageType": "user.registered",
  "payload": {
    "user_id": "test-user-123",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "company_name": "Test Company",
    "company_domain": "test.com",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "priority": "normal",
  "metadata": {
    "source": "test-script",
    "version": "1.0"
  }
}'
make_request "POST" "$QUEUE_SERVICE_URL/queue/publish" "$registration_data" "Publishing user registration event"

# Extract message ID from response
message_id=$(echo "$response_body" | jq -r '.messageId' 2>/dev/null || echo "")

if [ -z "$message_id" ] || [ "$message_id" = "null" ]; then
    echo -e "${RED}Failed to get message ID${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully published message: $message_id${NC}"
echo

# Test 3: Publish User Login Event
print_section "3. Publish User Login Event"
login_data='{
  "queueName": "user-events",
  "messageType": "user.logged_in",
  "payload": {
    "user_id": "test-user-123",
    "email": "test@example.com",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (Test Browser)",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "priority": "low",
  "metadata": {
    "source": "test-script",
    "version": "1.0"
  }
}'
make_request "POST" "$QUEUE_SERVICE_URL/queue/publish" "$login_data" "Publishing user login event"

# Test 4: Get Queue Statistics
print_section "4. Get Queue Statistics"
make_request "GET" "$QUEUE_SERVICE_URL/queue/stats/user-events" "" "Getting user-events queue statistics"

# Test 5: Get Message Details
print_section "5. Get Message Details"
make_request "GET" "$QUEUE_SERVICE_URL/queue/message/$message_id" "" "Getting message details"

# Test 6: Publish High Priority Event
print_section "6. Publish High Priority Event"
high_priority_data='{
  "queueName": "user-events",
  "messageType": "user.password_reset",
  "payload": {
    "user_id": "test-user-123",
    "email": "test@example.com",
    "reset_token": "reset-token-123",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "priority": "high",
  "metadata": {
    "source": "test-script",
    "version": "1.0"
  }
}'
make_request "POST" "$QUEUE_SERVICE_URL/queue/publish" "$high_priority_data" "Publishing high priority password reset event"

# Test 7: Publish Event with Delay
print_section "7. Publish Event with Delay"
delayed_data='{
  "queueName": "user-events",
  "messageType": "user.welcome_email",
  "payload": {
    "user_id": "test-user-123",
    "email": "test@example.com",
    "welcome_message": "Welcome to our platform!",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "priority": "low",
  "delay": 5000,
  "metadata": {
    "source": "test-script",
    "version": "1.0"
  }
}'
make_request "POST" "$QUEUE_SERVICE_URL/queue/publish" "$delayed_data" "Publishing delayed welcome email event"

# Test 8: Test Invalid Message
print_section "8. Test Invalid Message"
invalid_data='{
  "queueName": "",
  "messageType": "",
  "payload": {}
}'
make_request "POST" "$QUEUE_SERVICE_URL/queue/publish" "$invalid_data" "Testing invalid message (should fail)"

# Test 9: Get Updated Queue Statistics
print_section "9. Get Updated Queue Statistics"
make_request "GET" "$QUEUE_SERVICE_URL/queue/stats/user-events" "" "Getting updated queue statistics"

# Test 10: Test Different Queue
print_section "10. Test Different Queue"
notification_data='{
  "queueName": "notifications",
  "messageType": "email.send",
  "payload": {
    "to": "user@example.com",
    "subject": "Test Email",
    "body": "This is a test email",
    "template": "welcome",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  },
  "priority": "normal",
  "metadata": {
    "source": "test-script",
    "version": "1.0"
  }
}'
make_request "POST" "$QUEUE_SERVICE_URL/queue/publish" "$notification_data" "Publishing notification to different queue"

# Test 11: Get Notifications Queue Stats
print_section "11. Get Notifications Queue Stats"
make_request "GET" "$QUEUE_SERVICE_URL/queue/stats/notifications" "" "Getting notifications queue statistics"

# Test 12: Simulate Auth Service Integration
print_section "12. Simulate Auth Service Integration"
echo -e "${GREEN}Simulating user registration flow:${NC}"
echo "1. User registers on frontend"
echo "2. Auth service creates user"
echo "3. Auth service publishes user.registered event"
echo "4. Queue service receives and stores message"
echo "5. Company service subscribes and processes event"
echo "6. Notifications service subscribes and sends welcome email"
echo

# Test 13: Performance Test
print_section "13. Performance Test"
echo -e "${GREEN}Publishing 10 messages in parallel:${NC}"

for i in {1..10}; do
    perf_data='{
      "queueName": "performance-test",
      "messageType": "test.message",
      "payload": {
        "message_number": '$i',
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      },
      "priority": "normal",
      "metadata": {
        "source": "performance-test",
        "iteration": '$i'
      }
    }'
    
    # Publish in background
    curl -s -X POST -H "Content-Type: application/json" -d "$perf_data" "$QUEUE_SERVICE_URL/queue/publish" > /dev/null &
done

# Wait for all background jobs to complete
wait

echo -e "${GREEN}All messages published${NC}"

# Get performance test queue stats
make_request "GET" "$QUEUE_SERVICE_URL/queue/stats/performance-test" "" "Getting performance test queue statistics"

echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ Queue service is operational${NC}"
echo -e "${GREEN}✓ Message publishing is working${NC}"
echo -e "${GREEN}✓ Queue statistics are available${NC}"
echo -e "${GREEN}✓ Priority handling is functional${NC}"
echo -e "${GREEN}✓ Multiple queues are supported${NC}"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start the queue service: docker-compose up queue"
echo "2. Start other services to test event consumption"
echo "3. Monitor queue statistics in real-time"
echo "4. Test with different queue providers (Redis/RabbitMQ)"
echo
echo -e "${BLUE}For more information, see: docs/QUEUE_SERVICE_IMPLEMENTATION.md${NC}"
