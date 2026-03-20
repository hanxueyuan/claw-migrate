#!/usr/bin/env node

/**
 * Backup execution module - Optimized version
 * Uses tar.gz packaging for fast backup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
    printHeader('Execute Backup (Optimized)');

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
      const totalSize = files.reduce((sum, f) => sum + this.getFileSize(f.fullPath), 0);
      console.log(`   Found ${files.length} files, total size ${formatFileSize(totalSize)}\n`);

      if (this.dryRun) {
        console.log('📋 Preview of files to be backed up:\n');
        files.forEach(f => {
          const size = formatFileSize(this.getFileSize(f.fullPath));
          console.log(`   + ${f.path} (${size})`);
        });
        console.log('\n💡 Remove --dry-run to perform the actual backup');
        return;
      }

      // Create tar.gz backup
      console.log('📦 Creating backup archive...\n');
      const tarPath = await this.createTarball(files, totalSize);
      
      // Upload single file
      console.log('📤 Uploading backup archive...\n');
      await this.uploadTarball(writer, tarPath);

      const duration = Date.now() - startTime;
      this.printSummary(duration, tarPath);

    } catch (err) {
      printError(`Backup failed: ${err.message}`);
      if (this.verbose) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  }

  // Get file size
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (e) {
      return 0;
    }
  }

  // Create tar.gz archive
  async createTarball(files, totalSize) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '');
    const tarName = `openclaw-backup-${timestamp}.tar.gz`;
    const tarPath = path.join(this.ocEnv.workspaceRoot, '.migrate-backup', tarName);
    
    // Ensure backup directory exists
    const backupDir = path.dirname(tarPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create file list
    const fileListPath = path.join(backupDir, 'file-list.txt');
    const fileListContent = files.map(f => f.fullPath).join('\n');
    fs.writeFileSync(fileListPath, fileListContent, 'utf8');

    // Use tar command for fast compression
    try {
      // Create tar with progress
      const workspaceRoot = this.ocEnv.workspaceRoot;
      const relativePaths = files.map(f => {
        return path.relative(workspaceRoot, f.fullPath);
      });

      // Write file list for restore
      const manifest = {
        timestamp,
        totalFiles: files.length,
        totalSize,
        files: files.map(f => ({ path: f.path, fullPath: f.fullPath, category: f.category }))
      };
      fs.writeFileSync(path.join(backupDir, 'backup-manifest.json'), JSON.stringify(manifest, null, 2));

      // Create tar using tar command (faster than node-tar)
      const tarCommand = `cd "${workspaceRoot}" && tar -czf "${tarPath}" -T "${fileListPath}" 2>/dev/null || tar -czf "${tarPath}" ${relativePaths.slice(0, 100).join(' ')}`;
      execSync(tarCommand, { stdio: 'pipe' });

      const tarSize = fs.statSync(tarPath).size;
      printSuccess(`Backup archive created: ${formatFileSize(tarSize)}`);
      console.log(`   Location: ${tarPath}\n`);

      // Clean up file list
      fs.unlinkSync(fileListPath);

      return tarPath;
    } catch (err) {
      // Fallback: create simple tar
      printWarning('tar command failed, using fallback method');
      const tarCommand = `cd "${workspaceRoot}" && tar -czf "${tarPath}" . 2>/dev/null`;
      execSync(tarCommand, { stdio: 'pipe' });
      return tarPath;
    }
  }

  // Upload tar.gz to GitHub using git command
  async uploadTarball(writer, tarPath) {
    const tarName = path.basename(tarPath);
    const backupDir = path.join(this.ocEnv.workspaceRoot, '.migrate-backup', 'git-upload');
    const repoUrl = `https://${this.config.token || process.env.GITHUB_TOKEN}@github.com/${this.config.repo}.git`;
    
    // Ensure backup directory exists
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    fs.mkdirSync(backupDir, { recursive: true });

    try {
      // Clone repo
      console.log('   Cloning repository...');
      execSync(`git clone --depth 1 --branch ${this.config.branch} ${repoUrl} "${backupDir}" 2>/dev/null`, { stdio: 'pipe' });

      // Create backups directory if not exists
      const backupsDir = path.join(backupDir, 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      // Copy tar.gz
      const destPath = path.join(backupsDir, tarName);
      fs.copyFileSync(tarPath, destPath);

      // Copy manifest
      const manifestPath = path.join(path.dirname(tarPath), 'backup-manifest.json');
      if (fs.existsSync(manifestPath)) {
        fs.copyFileSync(manifestPath, path.join(backupsDir, 'backup-manifest.json'));
      }

      // Git add and commit
      execSync(`cd "${backupDir}" && git add backups/ && git commit -m "backup: ${tarName}"`, { stdio: 'pipe' });

      // Git push
      console.log('   Pushing to GitHub...');
      execSync(`cd "${backupDir}" && git push origin ${this.config.branch}`, { stdio: 'pipe' });

      printSuccess(`Backup uploaded: backups/${tarName}`);
      this.stats.uploaded = 1;

      // Cleanup
      fs.rmSync(backupDir, { recursive: true, force: true });

    } catch (err) {
      // Cleanup on error
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
      }
      throw new Error(`Git upload failed: ${err.message}`);
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
        // Skip .git directories
        if (entry.name === '.git') {
          continue;
        }
        
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

  printSummary(duration = 0, tarPath) {
    printDivider();
    printSuccess('Backup complete!');
    console.log(`   Succeeded: ${this.stats.uploaded} archive`);
    if (this.stats.errors > 0) {
      printWarning(`   Failed: ${this.stats.errors} files`);
    }
    
    if (duration > 0) {
      console.log(`   Duration: ${formatDuration(duration)}`);
      const tarSize = fs.statSync(tarPath).size;
      const speedMBs = (tarSize / 1024 / 1024) / (duration / 1000);
      console.log(`   Archive size: ${formatFileSize(tarSize)}`);
      console.log(`   Speed: ${speedMBs.toFixed(2)} MB/s`);
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
