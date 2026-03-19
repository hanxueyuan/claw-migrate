#!/usr/bin/env node

/**
 * Restore execution module
 * Restores configuration from a GitHub repo to the local workspace
 */

const fs = require('fs');
const path = require('path');
const { getOpenClawEnv, printHeader, printSuccess, printError, printWarning, printDivider, printFileStatus, ensureDirExists, ProgressBar, formatDuration } = require('./utils');
const { GitHubReader, getToken } = require('./github');
const { Merger } = require('./merger');

/**
 * Validate that a file path is safe (no path traversal)
 * @param {string} filePath - Relative file path to validate
 * @returns {boolean} true if the path is safe
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

  // Initialize
  async init() {
    this.ocEnv = await getOpenClawEnv();
    return this;
  }

  // Execute restore
  async execute() {
    printHeader('Restore Configuration');

    const token = await getToken(this.config);
    if (!token) {
      printError('Error: Unable to obtain GitHub Token');
      printError('   Please set the GITHUB_TOKEN environment variable or run the setup wizard');
      process.exit(1);
    }

    const reader = new GitHubReader(token, this.config.repo, this.config.branch);

    try {
      // Test connection
      console.log('\n📡 Connecting to GitHub...');
      const repoInfo = await reader.testConnection();
      printSuccess(`Connected to repository: ${repoInfo.full_name}`);

      // Get file list
      console.log('\n📦 Fetching repository file list...');
      const files = await reader.getFileList('all');
      
      if (files.length === 0) {
        printWarning('No backup files found in repository');
        return;
      }

      this.stats.total = files.length;
      console.log(`   Found ${files.length} files\n`);

      // Get local file list
      const localFiles = new Set();
      
      // Preview mode
      if (this.dryRun) {
        const preview = this.merger.generatePreview(files, localFiles);
        this.merger.printPreview(preview);
        console.log('\n💡 Remove --dry-run to perform the actual restore');
        return;
      }

      // Create local backup
      await this.createLocalBackup();

      // Execute restore
      console.log('🚀 Starting restore...\n');

      for (const file of files) {
        await this.restoreFile(reader, file, localFiles);
      }

      // Output statistics
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

  // Restore a single file
  async restoreFile(reader, file, localFiles) {
    // Path safety check - skip unsafe paths
    if (!isPathSafe(file.path)) {
      printFileStatus(file.path, 'skipped', 'unsafe path (traversal detected)');
      this.stats.skipped++;
      return;
    }

    const strategy = this.merger.getStrategy(file.path);
    const fullPath = this.ocEnv.getWorkspaceFile(file.path);
    const existsLocally = fs.existsSync(fullPath);
    
    localFiles.add(file.path);

    // Incremental sync: skip if local copy exists
    if (strategy === 'incremental' && existsLocally) {
      printFileStatus(file.path, 'skipped', 'already exists locally');
      this.stats.skipped++;
      return;
    }

    // Skip
    if (strategy === 'skip') {
      printFileStatus(file.path, 'skipped', 'sensitive/machine-specific');
      this.stats.skipped++;
      return;
    }

    try {
      const content = await reader.getFileContent(file.path);
      ensureDirExists(path.dirname(fullPath));

      if (strategy === 'merge' && existsLocally) {
        const localContent = fs.readFileSync(fullPath, 'utf8');
        const mergedContent = this.merger.merge(file.path, localContent, content);
        fs.writeFileSync(fullPath, mergedContent, 'utf8');
        printFileStatus(file.path, 'success', 'merged');
        this.stats.merged++;
      } else if (strategy === 'append' && existsLocally) {
        const localContent = fs.readFileSync(fullPath, 'utf8');
        const appendedContent = this.merger.merge(file.path, localContent, content);
        fs.writeFileSync(fullPath, appendedContent, 'utf8');
        printFileStatus(file.path, 'success', 'appended');
        this.stats.appended++;
      } else {
        fs.writeFileSync(fullPath, content, 'utf8');
        printFileStatus(file.path, 'success', existsLocally ? 'overwritten' : 'new');
        this.stats.restored++;
      }
    } catch (err) {
      printFileStatus(file.path, 'error', err.message);
      this.stats.errors++;
    }
  }

  // Create local backup
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

  // Print summary
  printSummary() {
    printDivider();
    printSuccess('Restore complete!');
    console.log(`   Overwritten: ${this.stats.restored} files`);
    console.log(`   Merged: ${this.stats.merged} files`);
    console.log(`   Appended: ${this.stats.appended} files`);
    console.log(`   Skipped: ${this.stats.skipped} files`);
    if (this.stats.errors > 0) {
      printWarning(`   Failed: ${this.stats.errors} files`);
    }
  }

  // Print next steps
  printNextSteps() {
    console.log('\n📌 Next steps:');
    console.log('   • Review config files for correctness');
    console.log('   • Re-pair channels if needed');
    console.log('   • Run `openclaw memory rebuild` to rebuild the memory index');
    console.log('   • If issues arise, restore from backup: .migrate-backup/');
  }
}

module.exports = { RestoreExecutor };
