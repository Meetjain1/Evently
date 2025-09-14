#!/bin/bash

# This script verifies all project requirements have been met
# Usage: ./verify-project.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Results file
RESULTS_FILE="project-verification-results.log"
echo "Evently Project Verification Results - $(date)" > $RESULTS_FILE
echo "==============================================" >> $RESULTS_FILE

# Function to check a requirement and log the result
check_requirement() {
  local name=$1
  local check_command=$2
  local success_message=$3
  local failure_message=$4
  
  echo -e "${YELLOW}Checking: ${name}...${NC}"
  echo "Checking: ${name}..." >> $RESULTS_FILE
  
  if eval "$check_command"; then
    echo -e "${GREEN}✓ PASS: ${success_message}${NC}"
    echo "✓ PASS: ${success_message}" >> $RESULTS_FILE
    return 0
  else
    echo -e "${RED}✗ FAIL: ${failure_message}${NC}"
    echo "✗ FAIL: ${failure_message}" >> $RESULTS_FILE
    return 1
  fi
}

# Begin verification
echo -e "${BLUE}====== EVENTLY PROJECT VERIFICATION ======${NC}"
echo -e "${BLUE}This script will verify all project requirements have been met.${NC}"
echo ""

# Count for requirement tracking
TOTAL_REQUIREMENTS=0
PASSED_REQUIREMENTS=0

# A. Check for removal of test scripts, mock directory, SQLite config
((TOTAL_REQUIREMENTS++))
check_requirement "Test Files Cleanup" \
  "! find . -name '*.spec.ts' -o -name '*.test.ts' | grep -q ." \
  "No test files found" \
  "Test files still exist in the project"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

((TOTAL_REQUIREMENTS++))
check_requirement "Mock Directory Cleanup" \
  "! find . -type d -name 'mock' -o -name 'mocks' | grep -q ." \
  "No mock directories found" \
  "Mock directories still exist in the project"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

((TOTAL_REQUIREMENTS++))
check_requirement "SQLite Removal" \
  "! grep -r 'sqlite' --include='*.ts' --include='*.js' --include='package.json' . | grep -v 'verify-project.sh' | grep -q ." \
  "No SQLite references found" \
  "SQLite references still exist in the project"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# B. Check for TypeScript/build fixes
((TOTAL_REQUIREMENTS++))
check_requirement "TypeScript Build" \
  "npm run build" \
  "TypeScript builds without errors" \
  "TypeScript build has errors"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

((TOTAL_REQUIREMENTS++))
check_requirement "Console.log Removal" \
  "! grep -r 'console.log' --include='*.ts' --include='*.js' . | grep -v 'verify-project.sh' | grep -v 'logger' | grep -q ." \
  "No console.log statements found" \
  "console.log statements still exist in the project"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# C. Check database configuration
((TOTAL_REQUIREMENTS++))
check_requirement "MySQL Configuration" \
  "grep -q 'mysql' ./src/database/data-source.ts" \
  "MySQL is configured as the database" \
  "MySQL configuration not found in data-source.ts"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

((TOTAL_REQUIREMENTS++))
check_requirement "Database Schema" \
  "[ -f ./database/schema.sql ]" \
  "Database schema file exists" \
  "Database schema file is missing"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# D. Server configuration
((TOTAL_REQUIREMENTS++))
check_requirement "Server Configuration" \
  "grep -q 'localhost:3000\\|127.0.0.1:3000' ./src/app.ts" \
  "Server is configured to use localhost:3000" \
  "Server is not configured to use localhost:3000"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# E. Endpoint verification
((TOTAL_REQUIREMENTS++))
check_requirement "API Testing Script" \
  "[ -f ./scripts/test-api.sh ]" \
  "API testing script exists" \
  "API testing script is missing"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# F. Hardcoding removal
((TOTAL_REQUIREMENTS++))
check_requirement "Environment Variables" \
  "grep -q 'process.env' ./src/config/index.ts" \
  "Environment variables are used for configuration" \
  "Environment variables not properly used"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# G. Test data scripts
((TOTAL_REQUIREMENTS++))
check_requirement "Test Data Generation" \
  "[ -f ./dev-scripts/generate-test-data.js ] && [ -f ./dev-scripts/import-test-data.js ]" \
  "Test data generation scripts exist" \
  "Test data generation scripts are missing"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# H. Documentation
((TOTAL_REQUIREMENTS++))
check_requirement "API Testing Guide" \
  "[ -f ./dev-scripts/generate-api-docs.js ]" \
  "API documentation generator script exists" \
  "API documentation generator script is missing"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

((TOTAL_REQUIREMENTS++))
check_requirement "Architecture Documentation" \
  "[ -f ./ARCHITECTURE.md ]" \
  "Architecture documentation exists" \
  "Architecture documentation is missing"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# I. Additional quality checks
((TOTAL_REQUIREMENTS++))
check_requirement "Proper .gitignore" \
  "[ -f ./.gitignore ] && grep -q 'node_modules\\|dist\\|.env' ./.gitignore" \
  "Proper .gitignore file exists" \
  ".gitignore file is missing or incomplete"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

((TOTAL_REQUIREMENTS++))
check_requirement "Port Management Scripts" \
  "[ -f ./scripts/ensure-port-available.sh ] || [ -f ./scripts/free-port.sh ]" \
  "Port management scripts exist" \
  "Port management scripts are missing"
[ $? -eq 0 ] && ((PASSED_REQUIREMENTS++))

# Summary
echo -e "\n${BLUE}====== VERIFICATION SUMMARY ======${NC}"
echo "Total Requirements: $TOTAL_REQUIREMENTS"
echo "Passed Requirements: $PASSED_REQUIREMENTS"
echo "Failed Requirements: $((TOTAL_REQUIREMENTS - PASSED_REQUIREMENTS))"
echo "Success Rate: $(( (PASSED_REQUIREMENTS * 100) / TOTAL_REQUIREMENTS ))%"

echo -e "\nVerification summary:" >> $RESULTS_FILE
echo "Total Requirements: $TOTAL_REQUIREMENTS" >> $RESULTS_FILE
echo "Passed Requirements: $PASSED_REQUIREMENTS" >> $RESULTS_FILE
echo "Failed Requirements: $((TOTAL_REQUIREMENTS - PASSED_REQUIREMENTS))" >> $RESULTS_FILE
echo "Success Rate: $(( (PASSED_REQUIREMENTS * 100) / TOTAL_REQUIREMENTS ))%" >> $RESULTS_FILE

echo -e "\nVerification results saved to: $RESULTS_FILE"

# Final verdict
if [ $PASSED_REQUIREMENTS -eq $TOTAL_REQUIREMENTS ]; then
  echo -e "\n${GREEN}All requirements have been met! The project is ready for submission.${NC}"
  echo -e "\nAll requirements have been met! The project is ready for submission." >> $RESULTS_FILE
  exit 0
else
  echo -e "\n${RED}Some requirements have not been met. Please fix the issues and run the verification again.${NC}"
  echo -e "\nSome requirements have not been met. Please fix the issues and run the verification again." >> $RESULTS_FILE
  exit 1
fi
