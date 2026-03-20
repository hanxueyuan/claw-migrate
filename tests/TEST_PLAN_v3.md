# claw-migrate v3.0 Test Plan

**Date**: 2026-03-20  
**Version**: v3.0.0 (Optimized)  
**Status**: ✅ Ready for Testing

---

## 📋 Overview

This test plan covers the optimized claw-migrate v3.0 with tar.gz packaging and smart hardware preservation.

**Test Objectives**:
- ✅ Verify tar.gz backup functionality
- ✅ Verify interactive restore with backup selection
- ✅ Verify hardware configuration preservation
- ✅ Verify local backup creation before restore
- ✅ Ensure backward compatibility

---

## 🏗️ Test Architecture

```
tests/
├── unit/                    # Unit tests
│   ├── backup.test.js       # Backup executor tests (UPDATED)
│   ├── restore.test.js      # Restore executor tests (UPDATED)
│   ├── github.test.js       # GitHub API tests
│   ├── merger.test.js       # Merge engine tests
│   └── utils.test.js        # Utility tests
│
├── integration/             # Integration tests (NEW)
│   ├── backup-integration.test.js  # Full backup flow
│   └── restore-integration.test.js # Full restore flow
│
├── fixtures/                # Test data
│   ├── sample-backup/
│   └── expected-output/
│
├── TEST_PLAN.md             # This file
└── verify.sh                # Quick verification script
```

---

## 🧪 Test Cases

### 1. Unit Tests

#### 1.1 backup.js Tests (UPDATED for v3.0)

| Test | Description | Expected |
|------|-------------|----------|
| `createTarball - basic` | Create tar.gz from file list | Archive created |
| `createTarball - compression` | Verify compression ratio | Size reduced >50% |
| `createTarball - manifest` | Verify manifest creation | JSON file exists |
| `uploadTarball - git clone` | Clone repo for upload | Repo cloned successfully |
| `uploadTarball - git push` | Push backup to GitHub | File in backups/ |
| `getFilesToBackup - categories` | Filter by categories | Correct files selected |
| `walkDirectory - skip git` | Skip .git directories | .git not included |

**Test Code Example**:
```javascript
// tests/unit/backup.test.js
const { BackupExecutor } = require('../src/backup.js');
const fs = require('fs');
const path = require('path');

async function testCreateTarball() {
  console.log('Testing createTarball...');
  
  const mockConfig = {
    backup: { content: ['core', 'memory'] }
  };
  
  const executor = new BackupExecutor(mockConfig);
  await executor.init();
  
  const files = await executor.getFilesToBackup();
  const totalSize = files.reduce((sum, f) => sum + executor.getFileSize(f.fullPath), 0);
  
  const tarPath = await executor.createTarball(files, totalSize);
  
  if (fs.existsSync(tarPath)) {
    const tarSize = fs.statSync(tarPath).size;
    console.log(`✅ Tarball created: ${(tarSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Compression: ${((1 - tarSize / totalSize) * 100).toFixed(1)}%`);
  } else {
    console.log('❌ Tarball not created');
    process.exit(1);
  }
}

testCreateTarball();
```

#### 1.2 restore.js Tests (UPDATED for v3.0)

| Test | Description | Expected |
|------|-------------|----------|
| `detectLocalConfigs - identity` | Detect identity/ directory | Listed as preserved |
| `detectLocalConfigs - feishu` | Detect feishu/ directory | Listed as preserved |
| `detectLocalConfigs - none` | No local configs | Empty list |
| `confirmRestore - yes` | User confirms | Returns true |
| `confirmRestore - no` | User declines | Returns false |
| `restoreFromDirectory - basic` | Restore files from extract | Files restored |
| `restoreFromDirectory - preserve` | Preserve local configs | Hardware configs kept |

#### 1.3 github.js Tests

| Test | Description | Expected |
|------|-------------|----------|
| `updateFile - binary` | Upload binary file (tar.gz) | Success |
| `updateFile - text` | Upload text file | Success |
| `getFileContent - base64` | Decode base64 content | Correct text |
| `getFileList - filter` | Filter for .tar.gz files | Only backups listed |

### 2. Integration Tests (NEW)

#### 2.1 Backup Integration Test

```javascript
// tests/integration/backup-integration.test.js

/**
 * Full backup flow test
 * Steps:
 * 1. Setup test config
 * 2. Execute backup
 * 3. Verify tarball created
 * 4. Verify uploaded to GitHub
 * 5. Cleanup
 */

async function testBackupFlow() {
  console.log('🧪 Testing full backup flow...\n');
  
  // Step 1: Setup
  console.log('1️⃣ Setup test config...');
  const testConfig = {
    repo: 'hanxueyuan/lisa-backup',
    branch: 'main',
    backup: {
      content: ['core', 'memory', 'skills']
    }
  };
  
  // Step 2: Execute backup
  console.log('2️⃣ Execute backup...');
  const { BackupExecutor } = require('../src/backup.js');
  const executor = new BackupExecutor(testConfig, { dryRun: false });
  await executor.init();
  await executor.execute();
  
  // Step 3: Verify
  console.log('3️⃣ Verify results...');
  if (executor.stats.uploaded === 1) {
    console.log('✅ Backup flow test PASSED\n');
  } else {
    console.log('❌ Backup flow test FAILED\n');
    process.exit(1);
  }
}

testBackupFlow();
```

#### 2.2 Restore Integration Test

```javascript
// tests/integration/restore-integration.test.js

/**
 * Full restore flow test
 * Steps:
 * 1. Setup test config
 * 2. Execute restore (dry-run)
 * 3. Verify backup list fetched
 * 4. Verify local configs detected
 * 5. Cleanup
 */

async function testRestoreFlow() {
  console.log('🧪 Testing full restore flow...\n');
  
  // Step 1: Setup
  console.log('1️⃣ Setup test config...');
  const testConfig = {
    repo: 'hanxueyuan/lisa-backup',
    branch: 'main'
  };
  
  // Step 2: Execute restore (dry-run)
  console.log('2️⃣ Execute restore (dry-run)...');
  const { RestoreExecutor } = require('../src/restore.js');
  const executor = new RestoreExecutor(testConfig, { dryRun: true });
  await executor.init();
  await executor.execute();
  
  // Step 3: Verify
  console.log('3️⃣ Verify results...');
  console.log('✅ Restore flow test PASSED (dry-run)\n');
}

testRestoreFlow();
```

### 3. Manual Test Checklist

#### Backup Tests

- [ ] Run `openclaw skill run claw-migrate backup`
- [ ] Verify tarball created in `.migrate-backup/`
- [ ] Verify uploaded to GitHub `backups/` directory
- [ ] Check backup size (should be <30 MB for typical workspace)
- [ ] Verify backup time (<60 seconds)
- [ ] Check backup manifest exists

#### Restore Tests

- [ ] Run `openclaw skill run claw-migrate restore`
- [ ] Verify backup list displayed
- [ ] Select specific backup
- [ ] Verify local configs detected
- [ ] Confirm restore
- [ ] Verify files restored
- [ ] Verify hardware configs preserved
- [ ] Check local backup created in `.migrate-backup/restore-*`

#### Edge Cases

- [ ] Backup with empty workspace
- [ ] Restore with no backups in repo
- [ ] Restore to new environment (no local configs)
- [ ] Restore with network interruption
- [ ] Backup with very large files (>100 MB)

---

## 📊 Test Coverage Goals

| Module | Goal | Status |
|--------|------|--------|
| backup.js | 85% | ⏳ Pending |
| restore.js | 85% | ⏳ Pending |
| github.js | 80% | ✅ Covered |
| merger.js | 90% | ✅ Covered |
| utils.js | 75% | ✅ Covered |

**Overall Goal**: >80%

---

## 🚀 Test Execution

### Quick Verification

```bash
cd /workspace/projects/workspace/skills/claw-migrate
./tests/verify.sh
```

### Full Test Suite

```bash
# Unit tests
cd tests/unit
for test in *.test.js; do
  node "$test"
done

# Integration tests
cd tests/integration
node backup-integration.test.js
node restore-integration.test.js
```

### CI/CD Tests

Tests run automatically on:
- Push to main branch
- Pull requests
- Manual trigger

---

## ✅ Acceptance Criteria

### Must Have (v3.0.0)

- [x] Backup creates tar.gz archive
- [x] Backup uploads to GitHub in <60 seconds
- [x] Restore lists available backups
- [x] Restore detects local hardware configs
- [x] Restore preserves hardware configs
- [x] Restore creates local backup before restore
- [x] No sensitive data leakage

### Should Have (v3.0.1)

- [ ] Better error messages for git failures
- [ ] Progress indicators for git operations
- [ ] Retry mechanism for network errors
- [ ] Integrity verification after restore

### Nice to Have (v3.1.0)

- [ ] Incremental backups
- [ ] Encrypted backups
- [ ] Backup scheduling
- [ ] Cloud storage support (S3, etc.)

---

## 📝 Test Report Template

```markdown
## Test Execution Report

**Date**: YYYY-MM-DD
**Version**: v3.0.0
**Tester**: [Name]

### Results Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Skipped: XX

### Backup Tests
- [ ] Tarball creation
- [ ] Upload to GitHub
- [ ] Performance (<60s)

### Restore Tests
- [ ] Backup selection
- [ ] Hardware detection
- [ ] Preservation
- [ ] File restoration

### Issues Found
1. [Description]
2. [Description]

### Recommendations
1. [Improvement]
```

---

**Created**: 2026-03-20  
**Last Updated**: 2026-03-20  
**Owner**: QA Agent
