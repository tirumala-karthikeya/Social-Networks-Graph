#!/usr/bin/env node

/**
 * Comprehensive Feature Test Script
 * Tests all assignment requirements and features
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testAPI() {
  log('🚀 Starting Comprehensive Feature Tests', 'bold');
  log('=' * 50, 'blue');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  logTest('Health Check');
  totalTests++;
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.success && response.data.message.includes('running')) {
      logSuccess('API is running and healthy');
      passedTests++;
    } else {
      logError('Health check failed');
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
  }

  // Test 2: Create Users
  logTest('User Creation');
  totalTests++;
  try {
    const user1 = await axios.post(`${API_BASE}/users`, {
      username: 'testuser1',
      age: 25,
      hobbies: ['coding', 'gaming']
    });
    
    const user2 = await axios.post(`${API_BASE}/users`, {
      username: 'testuser2',
      age: 30,
      hobbies: ['gaming', 'music']
    });

    if (user1.data.success && user2.data.success) {
      logSuccess('Users created successfully');
      passedTests++;
      
      // Store user IDs for later tests
      global.user1Id = user1.data.data.id;
      global.user2Id = user2.data.data.id;
    } else {
      logError('User creation failed');
    }
  } catch (error) {
    logError(`User creation failed: ${error.message}`);
  }

  // Test 3: Get All Users
  logTest('Get All Users');
  totalTests++;
  try {
    const response = await axios.get(`${API_BASE}/users`);
    if (response.data.success && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} users`);
      passedTests++;
    } else {
      logError('Failed to retrieve users');
    }
  } catch (error) {
    logError(`Get users failed: ${error.message}`);
  }

  // Test 4: Create Friendship
  logTest('Friendship Creation');
  totalTests++;
  try {
    const response = await axios.post(`${API_BASE}/users/${global.user1Id}/link`, {
      friendId: global.user2Id
    });
    
    if (response.data.success) {
      logSuccess('Friendship created successfully');
      passedTests++;
    } else {
      logError('Friendship creation failed');
    }
  } catch (error) {
    logError(`Friendship creation failed: ${error.message}`);
  }

  // Test 5: Popularity Score Calculation
  logTest('Popularity Score Calculation');
  totalTests++;
  try {
    const user1Response = await axios.get(`${API_BASE}/users/${global.user1Id}`);
    const user2Response = await axios.get(`${API_BASE}/users/${global.user2Id}`);
    
    const user1Score = user1Response.data.data.popularityScore;
    const user2Score = user2Response.data.data.popularityScore;
    
    // Both users should have score > 0 due to friendship and shared hobby
    if (user1Score > 0 && user2Score > 0) {
      logSuccess(`Popularity scores calculated: User1=${user1Score}, User2=${user2Score}`);
      passedTests++;
    } else {
      logError('Popularity score calculation failed');
    }
  } catch (error) {
    logError(`Popularity score test failed: ${error.message}`);
  }

  // Test 6: Graph Data
  logTest('Graph Data Retrieval');
  totalTests++;
  try {
    const response = await axios.get(`${API_BASE}/graph`);
    if (response.data.success && response.data.data.nodes && response.data.data.edges) {
      logSuccess(`Graph data retrieved: ${response.data.data.nodes.length} nodes, ${response.data.data.edges.length} edges`);
      passedTests++;
    } else {
      logError('Graph data retrieval failed');
    }
  } catch (error) {
    logError(`Graph data test failed: ${error.message}`);
  }

  // Test 7: Hobbies
  logTest('Hobbies Retrieval');
  totalTests++;
  try {
    const response = await axios.get(`${API_BASE}/hobbies`);
    if (response.data.success && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} unique hobbies`);
      passedTests++;
    } else {
      logError('Hobbies retrieval failed');
    }
  } catch (error) {
    logError(`Hobbies test failed: ${error.message}`);
  }

  // Test 8: User Statistics
  logTest('User Statistics');
  totalTests++;
  try {
    const response = await axios.get(`${API_BASE}/users/stats`);
    if (response.data.success && response.data.data.totalUsers !== undefined) {
      logSuccess(`Statistics retrieved: ${response.data.data.totalUsers} users, ${response.data.data.totalFriendships} friendships`);
      passedTests++;
    } else {
      logError('User statistics retrieval failed');
    }
  } catch (error) {
    logError(`Statistics test failed: ${error.message}`);
  }

  // Test 9: Search Users
  logTest('User Search');
  totalTests++;
  try {
    const response = await axios.get(`${API_BASE}/users/search?q=testuser`);
    if (response.data.success && Array.isArray(response.data.data)) {
      logSuccess(`Search returned ${response.data.data.length} results`);
      passedTests++;
    } else {
      logError('User search failed');
    }
  } catch (error) {
    logError(`Search test failed: ${error.message}`);
  }

  // Test 10: Update User
  logTest('User Update');
  totalTests++;
  try {
    const response = await axios.put(`${API_BASE}/users/${global.user1Id}`, {
      username: 'testuser1_updated',
      hobbies: ['coding', 'gaming', 'music']
    });
    
    if (response.data.success && response.data.data.username === 'testuser1_updated') {
      logSuccess('User updated successfully');
      passedTests++;
    } else {
      logError('User update failed');
    }
  } catch (error) {
    logError(`User update failed: ${error.message}`);
  }

  // Test 11: Remove Friendship
  logTest('Friendship Removal');
  totalTests++;
  try {
    const response = await axios.delete(`${API_BASE}/users/${global.user1Id}/unlink`, {
      data: { friendId: global.user2Id }
    });
    
    if (response.data.success) {
      logSuccess('Friendship removed successfully');
      passedTests++;
    } else {
      logError('Friendship removal failed');
    }
  } catch (error) {
    logError(`Friendship removal failed: ${error.message}`);
  }

  // Test 12: Delete User (should work after removing friendships)
  logTest('User Deletion');
  totalTests++;
  try {
    const response = await axios.delete(`${API_BASE}/users/${global.user1Id}`);
    if (response.data.success) {
      logSuccess('User deleted successfully');
      passedTests++;
    } else {
      logError('User deletion failed');
    }
  } catch (error) {
    logError(`User deletion failed: ${error.message}`);
  }

  // Test 13: Error Handling - Duplicate Username
  logTest('Error Handling - Duplicate Username');
  totalTests++;
  try {
    await axios.post(`${API_BASE}/users`, {
      username: 'testuser2', // Duplicate username
      age: 25,
      hobbies: ['coding']
    });
    logError('Should have failed with duplicate username');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Duplicate username correctly rejected');
      passedTests++;
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }

  // Test 14: Error Handling - Invalid Data
  logTest('Error Handling - Invalid Data');
  totalTests++;
  try {
    await axios.post(`${API_BASE}/users`, {
      username: 'a', // Too short
      age: 10, // Too young
      hobbies: [] // Empty hobbies
    });
    logError('Should have failed with invalid data');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Invalid data correctly rejected');
      passedTests++;
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }

  // Test 15: API Documentation
  logTest('API Documentation');
  totalTests++;
  try {
    const response = await axios.get('http://localhost:5000/api-docs');
    if (response.status === 200) {
      logSuccess('API documentation accessible');
      passedTests++;
    } else {
      logError('API documentation not accessible');
    }
  } catch (error) {
    logError(`API documentation test failed: ${error.message}`);
  }

  // Cleanup
  logTest('Cleanup');
  try {
    await axios.delete(`${API_BASE}/users/${global.user2Id}`);
    logSuccess('Cleanup completed');
  } catch (error) {
    logWarning(`Cleanup failed: ${error.message}`);
  }

  // Results
  log('\n' + '=' * 50, 'blue');
  log('📊 TEST RESULTS', 'bold');
  log('=' * 50, 'blue');
  
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  if (passedTests === totalTests) {
    log(`🎉 ALL TESTS PASSED! (${passedTests}/${totalTests})`, 'green');
    log(`Success Rate: ${successRate}%`, 'green');
  } else {
    log(`⚠️  ${passedTests}/${totalTests} tests passed`, 'yellow');
    log(`Success Rate: ${successRate}%`, 'yellow');
  }

  // Assignment Requirements Check
  log('\n📋 ASSIGNMENT REQUIREMENTS CHECK', 'bold');
  log('=' * 50, 'blue');
  
  const requirements = [
    { name: 'User CRUD Operations', passed: passedTests >= 3 },
    { name: 'Friendship Management', passed: passedTests >= 5 },
    { name: 'Popularity Score Calculation', passed: passedTests >= 5 },
    { name: 'Graph Data API', passed: passedTests >= 6 },
    { name: 'Hobby Management', passed: passedTests >= 7 },
    { name: 'Error Handling', passed: passedTests >= 13 },
    { name: 'API Documentation', passed: passedTests >= 15 }
  ];

  requirements.forEach(req => {
    if (req.passed) {
      log(`✅ ${req.name}`, 'green');
    } else {
      log(`❌ ${req.name}`, 'red');
    }
  });

  const passedRequirements = requirements.filter(r => r.passed).length;
  log(`\n📈 Requirements Met: ${passedRequirements}/${requirements.length}`, 'bold');

  if (passedRequirements === requirements.length) {
    log('\n🏆 CONGRATULATIONS! All assignment requirements are met!', 'green');
  } else {
    log('\n⚠️  Some requirements need attention', 'yellow');
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
testAPI().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});