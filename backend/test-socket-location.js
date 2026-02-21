// Socket.IO Location Coordinate Test Script
// Run with: node test-socket-location.js

const io = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';
const TEST_DELAY = 2000; // 2 seconds between tests

console.log('\n🧪 Socket.IO Location Coordinate Test\n' +
            '=====================================\n');
console.log(`📡 Connecting to: ${SOCKET_URL}\n`);

const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

// Track test results
let testsPassed = 0;
let testsFailed = 0;

// On successful connection
socket.on('connect', () => {
  console.log(`✅ Connected successfully`);
  console.log(`   Socket ID: ${socket.id}\n`);
  
  testsPassed++;
  
  // Wait a moment then test location emit
  setTimeout(() => {
    testLocationEmit();
  }, TEST_DELAY);
});

// Connection errors
socket.on('connect_error', (error) => {
  console.error(`❌ Connection error: ${error.message}`);
  console.error(`   Make sure backend is running on ${SOCKET_URL}\n`);
  testsFailed++;
});

socket.on('error', (error) => {
  console.error(`❌ Socket error: ${error}`);
  testsFailed++;
});

socket.on('disconnect', (reason) => {
  console.log(`\n🔌 Disconnected: ${reason}`);
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}\n`);
  process.exit(testsFailed > 0 ? 1 : 0);
});

// Test location emit
function testLocationEmit() {
  const testData = {
    requestId: 'test-req-' + Date.now(),
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    },
    mechanicId: 'test-mechanic-' + Date.now()
  };
  
  console.log('📍 Test 1: Sending location update...');
  console.log(`   Data: ${JSON.stringify(testData, null, 2)}\n`);
  
  socket.emit('update-location', testData, (response) => {
    if (response && response.success) {
      console.log(`✅ Location update acknowledged\n`);
      testsPassed++;
    } else {
      console.error(`❌ Location update failed\n`);
      testsFailed++;
    }
    
    // Test with invalid location
    setTimeout(() => {
      testInvalidLocation();
    }, TEST_DELAY);
  });
}

// Test invalid location (should be rejected)
function testInvalidLocation() {
  const invalidData = {
    requestId: 'test-req-invalid',
    location: {
      latitude: 95, // Invalid: must be -90 to 90
      longitude: -74.0060,
      accuracy: 10
    },
    mechanicId: 'test-mechanic'
  };
  
  console.log('📍 Test 2: Sending INVALID location (latitude > 90)...');
  console.log(`   Expected: Should be rejected at backend\n`);
  
  socket.emit('update-location', invalidData, (response) => {
    if (response && response.error) {
      console.log(`✅ Invalid location correctly rejected`);
      console.log(`   Error: ${response.error}\n`);
      testsPassed++;
    } else {
      console.error(`❌ Invalid location was NOT rejected (security issue)\n`);
      testsFailed++;
    }
    
    // Cleanup
    setTimeout(() => {
      socket.disconnect();
    }, 1000);
  });
}

// Timeout after 30 seconds
setTimeout(() => {
  console.error('\n⏱️  Test timeout - backend not responding\n');
  process.exit(1);
}, 30000);
