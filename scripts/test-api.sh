#!/bin/bash

# API Endpoint Testing Script
# This script tests all endpoints in the Evently API

# Set the base URL
BASE_URL="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Array to store results
declare -a RESULTS

# Function to make a GET request and check if it's successful
test_get_endpoint() {
  local endpoint=$1
  local description=$2
  local expected_status=${3:-200}
  
  echo -e "${YELLOW}Testing GET $endpoint - $description${NC}"
  
  # Make the request and capture response code
  response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL$endpoint")
  
  if [ "$response" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ Success: GET $endpoint returned $response${NC}"
    RESULTS+=("✓ [GET] $endpoint - $description")
    return 0
  else
    echo -e "${RED}✗ Failed: GET $endpoint returned $response (expected $expected_status)${NC}"
    RESULTS+=("✗ [GET] $endpoint - $description")
    return 1
  fi
}

# Function to make a POST request and check if it's successful
test_post_endpoint() {
  local endpoint=$1
  local data=$2
  local description=$3
  local expected_status=${4:-201}
  
  echo -e "${YELLOW}Testing POST $endpoint - $description${NC}"
  
  # Make the request and capture response code
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$BASE_URL$endpoint")
  
  if [ "$response" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ Success: POST $endpoint returned $response${NC}"
    RESULTS+=("✓ [POST] $endpoint - $description")
    return 0
  else
    echo -e "${RED}✗ Failed: POST $endpoint returned $response (expected $expected_status)${NC}"
    RESULTS+=("✗ [POST] $endpoint - $description")
    return 1
  fi
}

# Function to make a PUT request and check if it's successful
test_put_endpoint() {
  local endpoint=$1
  local data=$2
  local description=$3
  local expected_status=${4:-200}
  
  echo -e "${YELLOW}Testing PUT $endpoint - $description${NC}"
  
  # Make the request and capture response code
  response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$BASE_URL$endpoint")
  
  if [ "$response" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ Success: PUT $endpoint returned $response${NC}"
    RESULTS+=("✓ [PUT] $endpoint - $description")
    return 0
  else
    echo -e "${RED}✗ Failed: PUT $endpoint returned $response (expected $expected_status)${NC}"
    RESULTS+=("✗ [PUT] $endpoint - $description")
    return 1
  fi
}

# Function to make a DELETE request and check if it's successful
test_delete_endpoint() {
  local endpoint=$1
  local description=$2
  local expected_status=${3:-204}
  
  echo -e "${YELLOW}Testing DELETE $endpoint - $description${NC}"
  
  # Make the request and capture response code
  response=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL$endpoint")
  
  if [ "$response" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ Success: DELETE $endpoint returned $response${NC}"
    RESULTS+=("✓ [DELETE] $endpoint - $description")
    return 0
  else
    echo -e "${RED}✗ Failed: DELETE $endpoint returned $response (expected $expected_status)${NC}"
    RESULTS+=("✗ [DELETE] $endpoint - $description")
    return 1
  fi
}

# Function to generate a report
generate_report() {
  echo -e "\n${YELLOW}=== API Endpoint Test Report ===${NC}\n"
  
  local passed=0
  local failed=0
  
  for result in "${RESULTS[@]}"; do
    if [[ $result == "✓"* ]]; then
      echo -e "${GREEN}$result${NC}"
      ((passed++))
    else
      echo -e "${RED}$result${NC}"
      ((failed++))
    fi
  done
  
  echo -e "\n${YELLOW}Summary:${NC}"
  echo -e "${GREEN}Passed: $passed${NC}"
  echo -e "${RED}Failed: $failed${NC}"
  echo -e "${YELLOW}Total: $((passed + failed))${NC}"
}

# Main testing function
run_tests() {
  echo -e "${YELLOW}=== Starting API Endpoint Tests ===${NC}\n"
  
  # Test health endpoint
  test_get_endpoint "/health" "Health check" 200
  
  # Test auth endpoints
  test_post_endpoint "/auth/register" '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Password123!"}' "Register user" 201
  test_post_endpoint "/auth/login" '{"email":"test@example.com","password":"Password123!"}' "Login user" 200
  
  # Test event endpoints
  test_get_endpoint "/events" "Get all events" 200
  test_get_endpoint "/events?page=1&limit=10" "Get paginated events" 200
  
  # Test venue endpoints
  test_get_endpoint "/venues" "Get all venues" 200
  test_get_endpoint "/venues?page=1&limit=10" "Get paginated venues" 200
  
  # Test seat endpoints
  test_get_endpoint "/seats" "Get all seats" 200
  test_get_endpoint "/seats?page=1&limit=10" "Get paginated seats" 200
  
  # Test booking endpoints
  test_get_endpoint "/bookings" "Get all bookings" 200
  
  # Test waitlist endpoints
  test_get_endpoint "/waitlist" "Get all waitlist entries" 200
  
  # Test analytics endpoints
  test_get_endpoint "/analytics/events" "Get event analytics" 200
  test_get_endpoint "/analytics/venues" "Get venue analytics" 200
  test_get_endpoint "/analytics/revenue" "Get revenue analytics" 200
  
  # Generate final report
  generate_report
}

# Run the tests
run_tests
