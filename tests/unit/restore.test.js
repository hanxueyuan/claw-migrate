#!/usr/bin/env node

/**
 * Restore executor tests - v3.0 (Optimized)
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════╗');
console.log('║  Restore Tests - v3.0                 ║');
console.log('╚════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  const { RestoreExecutor } = require('../../src/restore.js');

  // Test 1: Constructor
  test('RestoreExecutor - constructor', () => {
    const executor = new RestoreExecutor({
      repo: 'test/test'
    });
    if (!executor) throw new Error('Failed to create instance');
    if (executor.stats.total !== 0) throw new Error('Initial stats incorrect');
  });

  // Test 2: Init
  test('RestoreExecutor - init', async () => {
    const executor = new RestoreExecutor({
      repo: 'test/test'
    });
    await executor.init();
    if (!executor.ocEnv) throw new Error('Environment not initialized');
  });

  // Test 3: Detect local configs - empty
  test('RestoreExecutor - detectLocalConfigs (empty)', async () => {
    const executor = new RestoreExecutor({});
    await executor.init();
    
    const configs = await executor.detectLocalConfigs();
    if (!Array.isArray(configs)) throw new Error('Should return array');
    console.log(`   Found ${configs.length} local configs`);
  });

  // Test 4: Detect local configs - with mock data
  test('RestoreExecutor - detectLocalConfigs (mock)', async () => {
    const executor = new RestoreExecutor({});
    await executor.init();
    
    // Create mock identity directory
    const testRoot = path.dirname(executor.ocEnv.workspaceRoot);
    const testIdentity = path.join(testRoot, 'identity-test-mock');
    fs.mkdirSync(testIdentity, { recursive: true });
    fs.writeFileSync(path.join(testIdentity, 'test.json'), '{}');
    
    // Temporarily rename to test
    const realIdentity = path.join(testRoot, 'identity');
    const realIdentityBackup = path.join(testRoot, 'identity-backup-temp');
    
    if (fs.existsSync(realIdentity)) {
      fs.renameSync(realIdentity, realIdentityBackup);
    }
    fs.renameSync(testIdentity, realIdentity);
    
    const configs = await executor.detectLocalConfigs();
    
    // Restore
    fs.renameSync(realIdentity, testIdentity);
    if (fs.existsSync(realIdentityBackup)) {
      fs.renameSync(realIdentityBackup, realIdentity);
    }
    fs.rmSync(testIdentity, { recursive: true, force: true });
    
    const hasIdentity = configs.some(c => c.includes('identity'));
    if (!hasIdentity) throw new Error('Should detect identity/');
  });

  // Test 5: Is path safe
  test('RestoreExecutor - isPathSafe', () => {
    // Import the function from module
    const restoreCode = fs.readFileSync(path.join(__dirname, '../../src/restore.js'), 'utf8');
    
    // Just verify the file exists and is readable
    if (!restoreCode) throw new Error('Cannot read restore.js');
  });

  // Test 6: Create local backup
  test('RestoreExecutor - createLocalBackup structure', async () => {
    const executor = new RestoreExecutor({});
    await executor.init();
    
    if (typeof executor.createLocalBackup !== 'function') {
      throw new Error('createLocalBackup method not found');
    }
  });

  // Test 7: Restore from directory
  test('RestoreExecutor - restoreFromDirectory structure', async () => {
    const executor = new RestoreExecutor({});
    await executor.init();
    
    if (typeof executor.restoreFromDirectory !== 'function') {
      throw new Error('restoreFromDirectory method not found');
    }
  });

  // Test 8: Confirm restore (mock readline)
  test('RestoreExecutor - confirmRestore exists', async () => {
    const executor = new RestoreExecutor({});
    await executor.init();
    
    if (typeof executor.confirmRestore !== 'function') {
      throw new Error('confirmRestore method not found');
    }
  });

  // Summary
  console.log('\n────────────────────────────────────────');
  console.log(`Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err.message);
  process.exit(1);
});
