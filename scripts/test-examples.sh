#!/bin/bash

# API Testing Script
# Tests the corrected examples against the running server

API_BASE_URL="http://localhost:3000/api"
CONTENT_TYPE="Content-Type: application/json"

echo "🚀 Starting API validation tests..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS=0
PASSED=0
FAILED=0

# Function to test an endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local payload="$3"
    local expected_code="$4"
    local test_name="$5"
    local auth_header="$6"
    
    TESTS=$((TESTS + 1))
    echo ""
    echo "Test $TESTS: $test_name"
    echo "----------------------------------------"
    
    # Build curl command
    if [ -z "$auth_header" ]; then
        response=$(curl -s -w "HTTP_CODE:%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
                   -H "$CONTENT_TYPE" \
                   -d "$payload" 2>/dev/null)
    else
        response=$(curl -s -w "HTTP_CODE:%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
                   -H "$CONTENT_TYPE" \
                   -H "$auth_header" \
                   -d "$payload" 2>/dev/null)
    fi
    
    # Extract HTTP code
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    echo "Expected: HTTP $expected_code"
    echo "Actual: HTTP $http_code"
    
    # Check result
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response body: $response_body"
        FAILED=$((FAILED + 1))
    fi
}

# Test 1: Auth Register (should work even without DB in some cases)
echo ""
echo "🔐 Testing Authentication Endpoints"
echo "==================================="

register_payload='{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "TestPass123",
  "role": "user"
}'

test_endpoint "POST" "/auth/register" "$register_payload" "500" "Register User (DB connection required)"

# Test 2: Login (will fail without DB but validates request format)
login_payload='{
  "email": "test@example.com",
  "password": "TestPass123"
}'

test_endpoint "POST" "/auth/login" "$login_payload" "500" "Login User (DB connection required)"

# Test 3: Validation Error - Missing required field
echo ""
echo "🚨 Testing Validation Errors"
echo "============================"

invalid_register='{
  "lastName": "User",
  "email": "test@example.com",
  "password": "TestPass123"
}'

test_endpoint "POST" "/auth/register" "$invalid_register" "400" "Missing firstName (Validation Error)"

# Test 4: Invalid email format
invalid_email='{
  "firstName": "Test",
  "lastName": "User", 
  "email": "not-an-email",
  "password": "TestPass123"
}'

test_endpoint "POST" "/auth/login" "$invalid_email" "400" "Invalid Email Format"

# Test 5: Missing password
missing_password='{
  "email": "test@example.com"
}'

test_endpoint "POST" "/auth/login" "$missing_password" "400" "Missing Password"

# Test 6: Event creation without auth (should fail)
echo ""
echo "🎫 Testing Event Endpoints"
echo "=========================="

event_payload='{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference featuring the latest innovations and industry trends.",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": 149.99,
  "hasWaitlist": true,
  "maxWaitlistSize": 100,
  "hasSeating": false,
  "isFeatured": true,
  "status": "draft"
}'

test_endpoint "POST" "/events" "$event_payload" "401" "Create Event (No Auth)"

# Test 7: Venue creation without auth (should fail)
venue_payload='{
  "name": "Grand Convention Center",
  "address": "123 Main Street",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "zipCode": "452001",
  "country": "India",
  "totalCapacity": 1500,
  "hasSeating": true,
  "description": "A modern convention center with state-of-the-art facilities."
}'

test_endpoint "POST" "/venues" "$venue_payload" "401" "Create Venue (No Auth)"

# Test 8: Booking without auth (should fail)
booking_payload='{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 2,
  "seatIds": ["660e8400-e29b-41d4-a716-446655440001", "660e8400-e29b-41d4-a716-446655440002"]
}'

test_endpoint "POST" "/bookings" "$booking_payload" "401" "Create Booking (No Auth)"

# Test 9: Join waitlist without auth (should fail) 
waitlist_payload='{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 3
}'

test_endpoint "POST" "/waitlist" "$waitlist_payload" "401" "Join Waitlist (No Auth)"

# Test 10: Check if Swagger docs are accessible
echo ""
echo "📚 Testing Documentation"
echo "========================"

swagger_response=$(curl -s -w "HTTP_CODE:%{http_code}" "http://localhost:3000/api-docs/" 2>/dev/null)
swagger_code=$(echo "$swagger_response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)

TESTS=$((TESTS + 1))
echo ""
echo "Test $TESTS: Swagger Documentation Access"
echo "----------------------------------------"
echo "Expected: HTTP 200"
echo "Actual: HTTP $swagger_code"

if [ "$swagger_code" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo "Total Tests: $TESTS"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the results above.${NC}"
    exit 1
fi