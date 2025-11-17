/**
 * Tests for shared utility functions
 */

const { today, replaceLine, readJSON } = require('./utils');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Test today() function
function testToday() {
  const result = today();
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!pattern.test(result)) {
    throw new Error(`today() should return YYYY-MM-DD format, got: ${result}`);
  }
  
  const [year, month, day] = result.split('-');
  const now = new Date();
  
  if (parseInt(year) !== now.getFullYear()) {
    throw new Error(`Year mismatch: expected ${now.getFullYear()}, got ${year}`);
  }
  
  console.log('✓ today() test passed');
}

// Test replaceLine() function
function testReplaceLine() {
  const content = `Line 1
Prefix: old value
Line 3`;
  
  const result = replaceLine(content, 'Prefix:', 'Prefix: new value');
  
  if (!result.includes('Prefix: new value')) {
    throw new Error('replaceLine() should replace the line');
  }
  
  if (result.includes('old value')) {
    throw new Error('replaceLine() should remove the old value');
  }
  
  // Test adding a line when prefix not found
  const result2 = replaceLine(content, 'NotFound:', 'NotFound: added');
  if (!result2.startsWith('NotFound: added')) {
    throw new Error('replaceLine() should prepend line when prefix not found');
  }
  
  console.log('✓ replaceLine() test passed');
}

// Test readJSON() function
function testReadJSON() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'utils-test-'));
  const testFile = path.join(tmpDir, 'test.json');
  const testData = { name: 'test', version: '1.0.0' };
  
  try {
    fs.writeFileSync(testFile, JSON.stringify(testData), 'utf-8');
    const result = readJSON(testFile);
    
    if (result.name !== testData.name || result.version !== testData.version) {
      throw new Error('readJSON() should correctly parse JSON file');
    }
    
    console.log('✓ readJSON() test passed');
  } finally {
    fs.unlinkSync(testFile);
    fs.rmdirSync(tmpDir);
  }
}

// Run all tests
try {
  console.log('Running utils.js tests...\n');
  testToday();
  testReplaceLine();
  testReadJSON();
  console.log('\n✓ All tests passed!');
  process.exit(0);
} catch (error) {
  console.error(`\n✗ Test failed: ${error.message}`);
  process.exit(1);
}
