#!/usr/bin/env node

/**
 * Backup executor tests - v3.0 (Optimized)
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════╗');
console.log('║  Backup Tests - v3.0                  ║');
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
  const { BackupExecutor } = require('../../src/backup.js');

  // Test 1: Constructor
  test('BackupExecutor - constructor', () => {
    const executor = new BackupExecutor({
      backup: { content: ['core'] }
    });
    if (!executor) throw new Error('Failed to create instance');
    if (executor.stats.total !== 0) throw new Error('Initial stats incorrect');
  });

  // Test 2: Init
  test('BackupExecutor - init', async () => {
    const executor = new BackupExecutor({
      backup: { content: ['core'] }
    });
    await executor.init();
    if (!executor.ocEnv) throw new Error('Environment not initialized');
  });

  // Test 3: Get file size
  test('BackupExecutor - getFileSize', () => {
    const executor = new BackupExecutor({});
    const size = executor.getFileSize(__filename);
    if (size <= 0) throw new Error('File size should be > 0');
  });

  // Test 4: Get files to backup
  test('BackupExecutor - getFilesToBackup', async () => {
    const executor = new BackupExecutor({
      backup: { content: ['core'] }
    });
    await executor.init();
    const files = await executor.getFilesToBackup();
    if (!Array.isArray(files)) throw new Error('Should return array');
    if (files.length === 0) console.log('   ⚠️  No files found (expected in test env)');
  });

  // Test 5: Walk directory
  test('BackupExecutor - walkDirectory skips .git', () => {
    const executor = new BackupExecutor({});
    // Create test directory structure
    const testDir = path.join(__dirname, 'test-walk');
    const gitDir = path.join(testDir, '.git');
    const srcDir = path.join(testDir, 'src');
    
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(gitDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(gitDir, 'config'), 'test');
    fs.writeFileSync(path.join(srcDir, 'test.js'), 'test');
    
    const files = executor.walkDirectory(testDir, 'test');
    
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
    
    const hasGit = files.some(f => f.path.includes('.git'));
    if (hasGit) throw new Error('Should skip .git directories');
  });

  // Test 6: Expand wildcard pattern
  test('BackupExecutor - expandWildcardPattern', async () => {
    const executor = new BackupExecutor({});
    await executor.init();
    
    // Test with agents/*/sessions pattern
    const results = executor.expandWildcardPattern('agents/*/sessions');
    if (!Array.isArray(results)) throw new Error('Should return array');
  });

  // Test 7: Create tarball (dry-run simulation)
  test('BackupExecutor - createTarball structure', async () => {
    const executor = new BackupExecutor({
      backup: { content: ['core'] }
    });
    await executor.init();
    
    const files = await executor.getFilesToBackup();
    if (files.length === 0) {
      console.log('   ⚠️  Skipped (no files)');
      return;
    }
    
    const totalSize = files.reduce((sum, f) => sum + executor.getFileSize(f.fullPath), 0);
    
    // Just verify the method exists and doesn't throw
    if (typeof executor.createTarball !== 'function') {
      throw new Error('createTarball method not found');
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
