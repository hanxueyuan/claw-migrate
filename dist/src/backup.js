#!/usr/bin/env node

/**
 * Backup execution module
 * Backs up exactly what the user selected, no forced restrictions
 */

const fs = require('fs');
const path = require('path');
const { getOpenClawEnv, printHeader, printSuccess, printError, printWarning, printDivider, printFileStatus, ProgressBar, formatFileSize, formatDuration } = require('./utils');
const { GitHubWriter, getToken } = require('./github');
const { BACKUP_CATEGORIES } = require('./setup');

class BackupExecutor {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.ocEnv = null;
    this.stats = {
      total: 0,
      uploaded: 0,
      skipped: 0,
      errors: 0
    };
  }

  async init() {
    this.ocEnv = await getOpenClawEnv();
    return this;
  }

  async execute() {
    printHeader('Execute Backup');

    const startTime = Date.now();

    const token = await getToken(this.config);
    if (!token) {
      printError('Error: Unable to obtain GitHub Token');
      printError('   Please set the GITHUB_TOKEN environment variable or run the setup wizard');
      process.exit(1);
    }

    const writer = new GitHubWriter(token, this.config.repo, this.config.branch);

    try {
      console.log('\n📡 Connecting to GitHub...');
      const repoInfo = await writer.testConnection();
      printSuccess(`Connected to repository: ${repoInfo.full_name}`);

      console.log('\n📦 Scanning workspace...');
      const files = await this.getFilesToBackup();
      
      if (files.length === 0) {
        printWarning('No files to back up');
        console.log('   Please run setup to select backup content');
        return;
      }

      this.stats.total = files.length;
      
      // Calculate total size
      const totalSize = files.reduce((sum, f) => sum + getFileSize(f.fullPath), 0);
      console.log(`   Found ${files.length} files, total size ${formatFileSize(totalSize)}\n`);

      if (this.dryRun) {
        console.log('📋 Preview of files to be backed up:\n');
        files.forEach(f => {
          const size = formatFileSize(getFileSize(f.fullPath));
          console.log(`   + ${f.path} (${size})`);
        });
        console.log('\n💡 Remove --dry-run to perform the actual backup');
        return;
      }

      // Upload files
      console.log('📤 Starting upload...\n');
      
      const progressBar = new ProgressBar(files.length, { 
        prefix: '   Upload progress',
        width: 40
      });
      
      for (const file of files) {
        await this.uploadFile(writer, file);
        progressBar.tick(file.path);
      }
      progressBar.done();

      const duration = Date.now() - startTime;
      this.printSummary(duration);

    } catch (err) {
      printError(`Backup failed: ${err.message}`);
      if (this.verbose) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  }

  async uploadFile(writer, file) {
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const commitMessage = `backup: ${file.path} - ${new Date().toISOString()}`;
      
      await writer.updateFile(file.path, content, commitMessage);
      printFileStatus(file.path, 'success');
      this.stats.uploaded++;
    } catch (err) {
      printFileStatus(file.path, 'error', err.message);
      this.stats.errors++;
    }
  }

  async getFilesToBackup() {
    const files = [];
    let selectedCategories = this.config.backup?.content || [];

    // Fallback to default categories if nothing selected
    if (selectedCategories.length === 0) {
      printWarning('No backup content selected, using defaults');
      console.log('   Backing up critical files only: AGENTS.md, SOUL.md, TOOLS.md, HEARTBEAT.md, memory/, .learnings/, skills/');
      console.log('   Tip: Run setup to customize: openclaw skill run claw-migrate setup\n');
      selectedCategories = ['core', 'memory', 'learnings', 'skills'];
    }

    // Iterate through user-selected categories
    for (const categoryId of selectedCategories) {
      const category = BACKUP_CATEGORIES.find(c => c.id === categoryId);
      if (!category) {
        if (this.verbose) {
          console.log(`   Warning: Unknown category ${categoryId}, skipping`);
        }
        continue;
      }

      for (const filePattern of category.files) {
        const fullPath = this.ocEnv.getWorkspaceFile(filePattern);
        
        if (!fs.existsSync(fullPath)) {
          if (this.verbose) {
            console.log(`   Warning: ${filePattern} does not exist, skipping`);
          }
          continue;
        }

        // Handle wildcard patterns (e.g. agents/*/sessions/)
        if (filePattern.includes('*')) {
          const matchedFiles = this.expandWildcardPattern(filePattern);
          for (const matched of matchedFiles) {
            if (fs.statSync(matched.fullPath).isDirectory()) {
              const dirFiles = this.walkDirectory(matched.fullPath, matched.pattern);
              files.push(...dirFiles);
            } else {
              files.push({
                path: matched.pattern,
                fullPath: matched.fullPath,
                category: categoryId
              });
            }
          }
        } else if (fs.statSync(fullPath).isDirectory()) {
          // Handle directories
          const dirFiles = this.walkDirectory(fullPath, filePattern);
          files.push(...dirFiles);
        } else {
          // Handle single files
          files.push({
            path: filePattern,
            fullPath: fullPath,
            category: categoryId
          });
        }
      }
    }

    return files;
  }

  // Expand wildcard patterns
  expandWildcardPattern(pattern) {
    const results = [];
    const workspacePath = this.ocEnv.workspaceRoot;
    
    // Simple implementation: handles patterns like agents/*/sessions/
    if (pattern.includes('*')) {
      const parts = pattern.split('*');
      const prefix = parts[0];
      const suffix = parts[1] || '';
      
      const prefixPath = path.join(workspacePath, prefix);
      if (fs.existsSync(prefixPath) && fs.statSync(prefixPath).isDirectory()) {
        const entries = fs.readdirSync(prefixPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const fullPath = path.join(prefixPath, entry.name, suffix);
            if (fs.existsSync(fullPath)) {
              results.push({
                pattern: path.join(prefix, entry.name, suffix),
                fullPath: fullPath
              });
            }
          }
        }
      }
    }
    
    return results;
  }

  walkDirectory(dirPath, relativeBase) {
    const files = [];
    
    const walk = (currentPath, base) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.join(base, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath, relativePath);
        } else if (entry.isFile()) {
          files.push({
            path: relativePath,
            fullPath: fullPath,
            category: relativeBase.split('/')[0]
          });
        }
      }
    };

    walk(dirPath, relativeBase);
    return files;
  }

  printSummary(duration = 0) {
    printDivider();
    printSuccess('Backup complete!');
    console.log(`   Succeeded: ${this.stats.uploaded} files`);
    if (this.stats.skipped > 0) {
      console.log(`   Skipped: ${this.stats.skipped} files`);
    }
    if (this.stats.errors > 0) {
      printWarning(`   Failed: ${this.stats.errors} files`);
    }
    
    if (duration > 0) {
      console.log(`   Duration: ${formatDuration(duration)}`);
      const avgTime = this.stats.uploaded > 0 ? (duration / this.stats.uploaded).toFixed(0) : 0;
      console.log(`   Average speed: ${avgTime}ms/file`);
    }
    
    // Show sensitive info warning
    const hasSensitive = this.config.backup?.content?.some(catId => {
      const cat = BACKUP_CATEGORIES.find(c => c.id === catId);
      return cat?.sensitive;
    });
    
    if (hasSensitive) {
      console.log('\n🔴 Note: You backed up sensitive information');
      console.log('   Please ensure your GitHub repository is private');
    }
    
    console.log();
  }
}

module.exports = { BackupExecutor };
