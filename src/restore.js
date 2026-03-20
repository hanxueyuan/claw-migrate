#!/usr/bin/env node

/**
 * Restore execution module - Optimized version
 * Supports tar.gz backup files and local hardware preservation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { getOpenClawEnv, printHeader, printSuccess, printError, printWarning, printDivider, printFileStatus, ensureDirExists, ProgressBar, formatDuration } = require('./utils');
const { GitHubReader, getToken } = require('./github');
const { Merger } = require('./merger');
const { BACKUP_CATEGORIES } = require('./setup');

/**
 * Validate that a file path is safe (no path traversal)
 */
function isPathSafe(filePath) {
  const normalized = path.normalize(filePath);
  return !normalized.startsWith('..') && !path.isAbsolute(normalized);
}

class RestoreExecutor {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.ocEnv = null;
    this.merger = new Merger(this.verbose);
    this.stats = {
      total: 0,
      restored: 0,
      merged: 0,
      appended: 0,
      skipped: 0,
      errors: 0
    };
  }

  async init() {
    this.ocEnv = await getOpenClawEnv();
    return this;
  }

  async execute() {
    printHeader('Restore Configuration (Optimized)');

    const token = await getToken(this.config);
    if (!token) {
      printError('Error: Unable to obtain GitHub Token');
      printError('   Please set the GITHUB_TOKEN environment variable or run the setup wizard');
      process.exit(1);
    }

    try {
      // Connect to GitHub
      console.log('\n📡 Connecting to GitHub...');
      const reader = new GitHubReader(token, this.config.repo, this.config.branch);
      const repoInfo = await reader.testConnection();
      printSuccess(`Connected to repository: ${repoInfo.full_name}`);

      // Get backup list
      console.log('\n📦 Fetching backup list...');
      const allFiles = await reader.getFileList('all');
      const backupFiles = allFiles.filter(f => f.path.endsWith('.tar.gz') && f.path.startsWith('backups/'));
      
      if (backupFiles.length === 0) {
        printWarning('No backup files found in repository');
        return;
      }

      // Show available backups
      console.log(`\n📋 Available backups (${backupFiles.length}):\n`);
      backupFiles.forEach((f, i) => {
        const size = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`;
        const date = f.path.match(/openclaw-backup-(.+)\.tar\.gz/)?.[1] || 'unknown';
        console.log(`   ${i + 1}) ${f.path} (${size}) - ${date}`);
      });

      // Let user choose backup
      console.log('\n💡 Enter backup number to restore, or press Enter for latest');
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const choice = await new Promise(resolve => {
        rl.question('   Choice: ', answer => {
          resolve(answer.trim());
          rl.close();
        });
      });

      let selectedBackup;
      if (!choice) {
        // Default to latest (last in list)
        selectedBackup = backupFiles[backupFiles.length - 1];
        console.log(`   Selected: ${selectedBackup.path} (latest)\n`);
      } else {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < backupFiles.length) {
          selectedBackup = backupFiles[index];
          console.log(`   Selected: ${selectedBackup.path}\n`);
        } else {
          printError('Invalid choice');
          return;
        }
      }

      // Download backup
      console.log('📥 Downloading backup...\n');
      const backupContent = await reader.getFileContent(selectedBackup.path);
      
      // Extract to temp directory
      const tempDir = path.join(this.ocEnv.workspaceRoot, '.migrate-restore-temp');
      ensureDirExists(tempDir);
      
      const tarPath = path.join(tempDir, 'backup.tar.gz');
      fs.writeFileSync(tarPath, Buffer.from(backupContent, 'base64'));

      // Detect local hardware configs BEFORE extraction
      console.log('\n🔍 Detecting local hardware configurations...\n');
      const preservedConfigs = await this.detectLocalConfigs();
      
      if (preservedConfigs.length > 0) {
        printSuccess('Found local hardware configurations (will be preserved):');
        preservedConfigs.forEach(cfg => console.log(`   - ${cfg}`));
        console.log();
      } else {
        printWarning('No local hardware configurations found (new environment)');
        console.log();
      }

      // Show restore preview
      console.log('📋 Restore Preview:\n');
      console.log(`   Source: ${selectedBackup.path}`);
      console.log(`   Target: ${this.ocEnv.workspaceRoot}`);
      console.log(`   Preserved: ${preservedConfigs.length > 0 ? preservedConfigs.join(', ') : 'none'}`);
      console.log();

      if (this.dryRun) {
        console.log('💡 Remove --dry-run to perform the actual restore');
        // Cleanup
        fs.unlinkSync(tarPath);
        fs.rmdirSync(tempDir);
        return;
      }

      // Confirm restore
      const confirmed = await this.confirmRestore();
      if (!confirmed) {
        console.log('\n⚠️  Restore cancelled\n');
        // Cleanup
        fs.unlinkSync(tarPath);
        fs.rmdirSync(tempDir);
        return;
      }

      // Create local backup before restore
      await this.createLocalBackup();

      // Extract backup
      console.log('\n🔄 Extracting backup...\n');
      const extractDir = path.join(tempDir, 'extracted');
      ensureDirExists(extractDir);
      
      try {
        execSync(`tar -xzf "${tarPath}" -C "${extractDir}"`, { stdio: 'pipe' });
        printSuccess('Backup extracted');
      } catch (err) {
        printError('Failed to extract backup');
        throw err;
      }

      // Restore files (preserving hardware configs)
      console.log('\n🔄 Restoring files...\n');
      await this.restoreFromDirectory(extractDir, preservedConfigs);

      // Cleanup
      fs.unlinkSync(tarPath);
      fs.rmSync(tempDir, { recursive: true, force: true });

      // Show summary
      this.printSummary();
      this.printNextSteps();

    } catch (err) {
      printError(`Restore failed: ${err.message}`);
      if (this.verbose) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Detect local hardware configurations
   */
  async detectLocalConfigs() {
    const preserved = [];
    const rootDir = path.dirname(this.ocEnv.workspaceRoot);

    // Check identity/
    if (fs.existsSync(path.join(rootDir, 'identity')) && 
        fs.readdirSync(path.join(rootDir, 'identity')).length > 0) {
      preserved.push('identity/ (device auth)');
    }

    // Check feishu/
    if (fs.existsSync(path.join(rootDir, 'feishu')) && 
        fs.readdirSync(path.join(rootDir, 'feishu')).length > 0) {
      preserved.push('feishu/ (Feishu pairing)');
    }

    // Check browser/
    if (fs.existsSync(path.join(rootDir, 'browser')) && 
        fs.readdirSync(path.join(rootDir, 'browser')).length > 0) {
      preserved.push('browser/ (browser data)');
    }

    // Check credentials/
    if (fs.existsSync(path.join(rootDir, 'credentials')) && 
        fs.readdirSync(path.join(rootDir, 'credentials')).length > 0) {
      preserved.push('credentials/ (auth credentials)');
    }

    // Check .env
    if (fs.existsSync(path.join(rootDir, '.env'))) {
      preserved.push('.env (environment variables)');
    }

    return preserved;
  }

  /**
   * Confirm restore with user
   */
  async confirmRestore() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question('Confirm restore? [y/N]: ', answer => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });
  }

  /**
   * Create local backup before restore
   */
  async createLocalBackup() {
    const backupDir = path.join(this.ocEnv.workspaceRoot, '.migrate-backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `restore-${timestamp}`);
    
    ensureDirExists(backupPath);
    
    const filesToBackup = [
      'AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 
      'TOOLS.md', 'HEARTBEAT.md', 'MEMORY.md', 'cron/jobs.json'
    ];
    
    for (const file of filesToBackup) {
      const fullPath = this.ocEnv.getWorkspaceFile(file);
      if (fs.existsSync(fullPath)) {
        const backupFile = path.join(backupPath, file.replace(/\//g, '_'));
        fs.copyFileSync(fullPath, backupFile);
      }
    }
    
    console.log(`💾 Local backup created: ${backupPath}\n`);
  }

  /**
   * Restore from extracted directory
   */
  async restoreFromDirectory(extractDir, preservedConfigs) {
    const rootDir = path.dirname(this.ocEnv.workspaceRoot);
    
    // Read manifest if exists
    let manifest = null;
    const manifestPath = path.join(extractDir, 'backup-manifest.json');
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      this.stats.total = manifest.totalFiles || 0;
    }

    // Restore core files
    const coreFiles = ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'TOOLS.md', 'HEARTBEAT.md', 'BOOTSTRAP.md'];
    for (const file of coreFiles) {
      const src = path.join(extractDir, file);
      const dst = this.ocEnv.getWorkspaceFile(file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        printFileStatus(file, 'success', 'restored');
        this.stats.restored++;
      }
    }

    // Restore directories
    const directories = [
      { src: 'memory', dst: 'memory', name: 'memory/' },
      { src: '.learnings', dst: '.learnings', name: '.learnings/' },
      { src: 'skills', dst: 'skills', name: 'skills/' },
      { src: 'cron', dst: 'cron', name: 'cron/' },
      { src: 'docs', dst: 'docs', name: 'docs/' },
      { src: 'scripts', dst: 'scripts', name: 'scripts/' },
      { src: 'templates', dst: 'templates', name: 'templates/' },
      { src: 'agents', dst: '../agents', name: 'agents/' },
      { src: 'subagents', dst: '../subagents', name: 'subagents/' },
      { src: 'delivery-queue', dst: '../delivery-queue', name: 'delivery-queue/' },
      { src: 'devices', dst: '../devices', name: 'devices/' }
    ];

    for (const dir of directories) {
      const srcPath = path.join(extractDir, dir.src);
      const dstPath = path.join(rootDir, dir.dst);
      
      if (fs.existsSync(srcPath)) {
        // Check if this directory should be preserved
        const shouldPreserve = preservedConfigs.some(cfg => cfg.includes(dir.name));
        
        if (shouldPreserve) {
          printFileStatus(dir.name, 'skipped', 'preserved (local config exists)');
          this.stats.skipped++;
        } else {
          // Copy directory
          if (fs.existsSync(dstPath)) {
            fs.rmSync(dstPath, { recursive: true, force: true });
          }
          fs.cpSync(srcPath, dstPath, { recursive: true });
          printFileStatus(dir.name, 'success', 'restored');
          this.stats.restored++;
        }
      }
    }

    // Restore config files
    const configFiles = [
      { src: 'openclaw.json', dst: '../openclaw.json', name: 'openclaw.json' }
    ];

    for (const cfg of configFiles) {
      const src = path.join(extractDir, cfg.src);
      const dst = path.join(rootDir, cfg.dst);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        printFileStatus(cfg.name, 'success', 'restored');
        this.stats.restored++;
      }
    }
  }

  printSummary() {
    printDivider();
    printSuccess('Restore complete!');
    console.log(`   Restored: ${this.stats.restored} files/directories`);
    console.log(`   Skipped: ${this.stats.skipped} files (preserved)`);
    if (this.stats.errors > 0) {
      printWarning(`   Failed: ${this.stats.errors} files`);
    }
  }

  printNextSteps() {
    console.log('\n📌 Next steps:');
    console.log('   1. Review restored config files for correctness');
    console.log('   2. Verify Feishu connection (if preserved, should work immediately)');
    console.log('   3. Run: openclaw memory rebuild (if memory was restored)');
    console.log('   4. Restart OpenClaw: openclaw gateway restart');
    console.log('   5. If issues arise, restore from backup: .migrate-backup/');
    console.log();
  }
}

module.exports = { RestoreExecutor };
