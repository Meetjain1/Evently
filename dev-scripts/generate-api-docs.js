#!/usr/bin/env node

/**
 * API Testing Documentation Generator
 * 
 * This script tests all endpoints and generates documentation about them.
 * It uses the test-api.sh script to run the tests and then formats the results.
 * 
 * Usage: node generate-api-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const API_TEST_SCRIPT = path.join(__dirname, '..', 'scripts', 'test-api.sh');
const API_TEST_RESULTS = 'api-test-results.log';
const OUTPUT_DOC = path.join(__dirname, '..', 'API_TESTING_GUIDE.md');

// Endpoints grouped by category
const endpointCategories = {
  'Authentication': ['/auth/login', '/auth/register'],
  'Health Check': ['/health'],
  'Users': ['/users', '/users/me', '/users/{id}'],
  'Venues': ['/venues', '/venues/{id}'],
  'Events': ['/events', '/events/{id}', '/events/{id}/publish'],
  'Bookings': ['/bookings', '/bookings/all', '/bookings/{id}', '/bookings/{id}/cancel'],
  'Seats': ['/events/{id}/seats', '/seats/{id}'],
  'Waitlist': ['/waitlist', '/events/{id}/waitlist'],
  'Statistics': ['/stats/events', '/stats/bookings']
};

// HTTP method descriptions
const methodDescriptions = {
  'GET': 'Retrieve data from the server',
  'POST': 'Send data to create a new resource on the server',
  'PUT': 'Update an existing resource on the server',
  'DELETE': 'Remove a resource from the server'
};

// Expected input/output formats for each endpoint
const endpointFormats = {
  '/auth/login': {
    method: 'POST',
    description: 'Authenticate a user and receive a JWT token',
    auth: 'None',
    input: {
      email: 'string - User\'s email address',
      password: 'string - User\'s password'
    },
    output: {
      token: 'string - JWT token for authorization',
      user: 'object - User details'
    },
    example: {
      request: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Password123!"}'`,
      response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "role": "user"
  }
}`
    }
  },
  '/auth/register': {
    method: 'POST',
    description: 'Register a new user account',
    auth: 'None',
    input: {
      firstName: 'string - User\'s first name',
      lastName: 'string - User\'s last name',
      email: 'string - User\'s email address',
      password: 'string - User\'s password (must meet security requirements)'
    },
    output: {
      id: 'string - UUID of the created user',
      firstName: 'string - User\'s first name',
      lastName: 'string - User\'s last name',
      email: 'string - User\'s email address',
      role: 'string - User\'s role (default: "user")'
    },
    example: {
      request: `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"firstName":"Jane","lastName":"Smith","email":"jane@example.com","password":"Password123!"}'`,
      response: `{
  "id": "uuid",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "role": "user"
}`
    }
  },
  '/health': {
    method: 'GET',
    description: 'Check the health status of the API',
    auth: 'None',
    input: {},
    output: {
      status: 'string - "ok" if the service is operational',
      version: 'string - API version',
      uptime: 'number - Service uptime in seconds'
    },
    example: {
      request: `curl http://localhost:3000/api/health`,
      response: `{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}`
    }
  }
};

// Function to generate a markdown table
function generateMarkdownTable(headers, rows) {
  // Create header row
  let table = `| ${headers.join(' | ')} |\n`;
  
  // Create separator row
  table += `| ${headers.map(() => '---').join(' | ')} |\n`;
  
  // Create data rows
  rows.forEach(row => {
    table += `| ${row.join(' | ')} |\n`;
  });
  
  return table;
}

// Function to format the endpoint example
function formatEndpointExample(endpoint) {
  if (!endpointFormats[endpoint]) {
    return 'No example available';
  }
  
  const example = endpointFormats[endpoint].example;
  if (!example) {
    return 'No example available';
  }
  
  return `**Request:**\n\`\`\`bash\n${example.request}\n\`\`\`\n\n**Response:**\n\`\`\`json\n${example.response}\n\`\`\``;
}

// Function to format the endpoint input/output
function formatIOSchema(endpoint) {
  if (!endpointFormats[endpoint]) {
    return { input: 'Not documented', output: 'Not documented' };
  }
  
  const format = endpointFormats[endpoint];
  
  // Format input
  let input = 'None required';
  if (Object.keys(format.input).length > 0) {
    input = '```json\n{\n';
    for (const [key, desc] of Object.entries(format.input)) {
      input += `  "${key}": ${desc}\n`;
    }
    input += '}\n```';
  }
  
  // Format output
  let output = 'No specific output';
  if (Object.keys(format.output).length > 0) {
    output = '```json\n{\n';
    for (const [key, desc] of Object.entries(format.output)) {
      output += `  "${key}": ${desc}\n`;
    }
    output += '}\n```';
  }
  
  return { input, output };
}

// Function to generate API documentation
async function generateAPIDocs() {
  try {
    console.log('Running API tests...');
    try {
      execSync(`bash ${API_TEST_SCRIPT}`, { stdio: 'inherit' });
      console.log('API tests completed successfully.');
    } catch (error) {
      console.log('API tests completed with some failures. Generating documentation anyway.');
    }
    
    // Check if test results file exists
    if (!fs.existsSync(API_TEST_RESULTS)) {
      console.error(`Test results file "${API_TEST_RESULTS}" not found.`);
      process.exit(1);
    }
    
    // Read test results
    const testResults = fs.readFileSync(API_TEST_RESULTS, 'utf8');
    const lines = testResults.split('\n');
    
    // Parse test results
    const testData = [];
    const testRegex = /\[(PASS|FAIL)\] (GET|POST|PUT|DELETE) (\/[^\s]+) - Status: (\d+)/;
    
    lines.forEach(line => {
      const match = line.match(testRegex);
      if (match) {
        const [, result, method, endpoint, status] = match;
        
        // Extract base endpoint (without IDs)
        let baseEndpoint = endpoint.replace(/\/[a-f0-9-]{36}/g, '/{id}');
        
        testData.push({
          endpoint: baseEndpoint,
          method,
          status,
          result: result === 'PASS' ? '✅' : '❌'
        });
      }
    });
    
    // Generate documentation
    let markdown = `# Evently API Testing Guide\n\n`;
    
    // Introduction section
    markdown += `## Introduction\n\n`;
    markdown += `This document provides a comprehensive guide to testing the Evently API endpoints. It includes information about each endpoint, expected request/response formats, and examples.\n\n`;
    markdown += `The API is hosted at \`http://localhost:3000/api\` and requires authentication for most endpoints using JWT tokens.\n\n`;
    
    // Authentication section
    markdown += `## Authentication\n\n`;
    markdown += `Most endpoints require authentication using JWT tokens. To authenticate, include the token in the Authorization header:\n\n`;
    markdown += `\`\`\`\nAuthorization: Bearer your_jwt_token_here\n\`\`\`\n\n`;
    markdown += `You can obtain a token by logging in with the /auth/login endpoint.\n\n`;
    
    // Test results summary
    const totalTests = testData.length;
    const passedTests = testData.filter(test => test.result === '✅').length;
    const failedTests = totalTests - passedTests;
    
    markdown += `## Test Results Summary\n\n`;
    markdown += `- Total Tests: ${totalTests}\n`;
    markdown += `- Passed: ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)\n`;
    markdown += `- Failed: ${failedTests} (${Math.round((failedTests / totalTests) * 100)}%)\n\n`;
    
    // Endpoints by category
    markdown += `## API Endpoints\n\n`;
    
    for (const [category, endpoints] of Object.entries(endpointCategories)) {
      markdown += `### ${category}\n\n`;
      
      // Create a table for the endpoints in this category
      const headers = ['Endpoint', 'Method', 'Description', 'Auth Required', 'Status'];
      const rows = [];
      
      endpoints.forEach(endpoint => {
        const tests = testData.filter(test => test.endpoint === endpoint);
        
        tests.forEach(test => {
          const format = endpointFormats[endpoint] || { description: 'Not documented', auth: 'Unknown' };
          rows.push([
            endpoint,
            test.method,
            format.description || 'Not documented',
            format.auth || 'Unknown',
            `${test.status} ${test.result}`
          ]);
        });
        
        // If no tests found for this endpoint, add a placeholder row
        if (tests.length === 0) {
          const format = endpointFormats[endpoint] || { description: 'Not documented', auth: 'Unknown' };
          rows.push([
            endpoint,
            'N/A',
            format.description || 'Not documented',
            format.auth || 'Unknown',
            'Not tested'
          ]);
        }
      });
      
      markdown += generateMarkdownTable(headers, rows);
      markdown += '\n';
      
      // Detailed endpoint documentation
      endpoints.forEach(endpoint => {
        const format = endpointFormats[endpoint];
        if (format) {
          markdown += `#### ${format.method} ${endpoint}\n\n`;
          markdown += `**Description:** ${format.description}\n\n`;
          markdown += `**Authentication Required:** ${format.auth}\n\n`;
          
          const { input, output } = formatIOSchema(endpoint);
          
          markdown += `**Request Format:**\n\n${input}\n\n`;
          markdown += `**Response Format:**\n\n${output}\n\n`;
          markdown += `**Example:**\n\n${formatEndpointExample(endpoint)}\n\n`;
        }
      });
    }
    
    // Testing guide section
    markdown += `## How to Test\n\n`;
    markdown += `To test the API endpoints, you can use the provided script:\n\n`;
    markdown += `\`\`\`bash\n./scripts/test-api.sh\n\`\`\`\n\n`;
    markdown += `This script will test all endpoints and generate a report with the results.\n\n`;
    markdown += `For manual testing, you can use cURL, Postman, or any other API testing tool. Examples are provided in the endpoint documentation above.\n\n`;
    
    // Common issues section
    markdown += `## Common Issues\n\n`;
    markdown += `- **401 Unauthorized**: Make sure you're including a valid JWT token in the Authorization header.\n`;
    markdown += `- **403 Forbidden**: The authenticated user doesn't have permission to access the resource.\n`;
    markdown += `- **404 Not Found**: The requested resource doesn't exist.\n`;
    markdown += `- **422 Unprocessable Entity**: The request body is invalid. Check the request format.\n\n`;
    
    // Write documentation to file
    fs.writeFileSync(OUTPUT_DOC, markdown);
    
    console.log(`API documentation generated successfully at ${OUTPUT_DOC}`);
    
  } catch (error) {
    console.error('Error generating API documentation:', error);
    process.exit(1);
  }
}

generateAPIDocs();
