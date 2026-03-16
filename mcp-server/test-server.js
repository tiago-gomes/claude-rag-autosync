#!/usr/bin/env node

/**
 * Automated MCP Server Test Script
 * Tests the Memory RAG MCP server without requiring Claude Code restart
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_TIMEOUT = 30000; // 30 seconds
let serverProcess;

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMCPRequest(request) {
  return new Promise((resolve, reject) => {
    let responseData = '';
    let errorData = '';

    const server = spawn('node', [join(__dirname, 'index.js')], {
      env: { ...process.env, NODE_ENV: 'test' }
    });

    server.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Send request
    server.stdin.write(JSON.stringify(request) + '\n');

    // Timeout
    setTimeout(() => {
      server.kill();
      if (responseData) {
        try {
          resolve(JSON.parse(responseData));
        } catch {
          resolve({ raw: responseData });
        }
      } else {
        reject(new Error('Timeout - no response from server'));
      }
    }, 5000);
  });
}

async function runTests() {
  log('\n=== Memory RAG MCP Server - Automated Test Suite ===\n', 'cyan');

  const tests = [
    {
      name: 'Test 1: List Available Tools',
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      }
    },
    {
      name: 'Test 2: Get System Stats',
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'memory_rag_stats',
          arguments: {}
        }
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log(`\n${test.name}...`, 'yellow');

    try {
      const response = await testMCPRequest(test.request);

      if (response && (response.tools || response.result)) {
        log(`✅ PASSED`, 'green');

        if (response.tools) {
          log(`   Found ${response.tools.length} tools:`, 'blue');
          response.tools.forEach(tool => {
            log(`   - ${tool.name}`, 'blue');
          });
        }

        if (response.result) {
          const content = response.result.content || response.result;
          if (content && content[0] && content[0].text) {
            const data = JSON.parse(content[0].text);
            log(`   Total memories: ${data.total_memories}`, 'blue');
          }
        }

        passed++;
      } else {
        log(`❌ FAILED - Invalid response`, 'red');
        log(`   Response: ${JSON.stringify(response)}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`❌ FAILED - ${error.message}`, 'red');
      failed++;
    }

    await sleep(1000);
  }

  // Summary
  log('\n=== Test Summary ===', 'cyan');
  log(`Total Tests: ${tests.length}`, 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All tests passed! MCP server is ready to use.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Restart Claude Code', 'yellow');
    log('2. Try: "Use memory_rag_search to find memories about Barbershop"', 'yellow');
    log('3. Try: "Use memory_rag_store to store a memory"', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'red');
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
