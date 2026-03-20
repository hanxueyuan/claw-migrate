#!/usr/bin/env node

/**
 * Utility functions module
 * Unified utility functions, logging, error handling, progress display
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ==================== OpenClaw Environment ====================

let cachedEnv = null;

function getOpenClawEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  let currentDir = __dirname;
  let openclawRoot = null;
  
  for (let i = 0; i < 5; i++) {
    const testPath = path.join(currentDir, 'openclaw.json');
    if (fs.existsSync(testPath)) {
      openclawRoot = currentDir;
      break;
    }
    currentDir = path.dirname(currentDir);
  }

  if (!openclawRoot) {
    openclawRoot = '/workspace/projects';
  }

  // Try to find workspace directory
  let workspaceRoot = path.join(openclawRoot, 'workspace');
  if (!fs.existsSync(workspaceRoot) || !fs.statSync(workspaceRoot).isDirectory()) {
    workspaceRoot = path.join(openclawRoot, 'workspace', 'workspace');
  }

  cachedEnv = {
    openclawRoot,
    workspaceRoot,
    getWorkspaceFile: (relativePath) => {
      return path.join(workspaceRoot, relativePath);
    }
  };

  return cachedEnv;
}

function printOpenClawConfig() {
  const env = getOpenClawEnv();
  console.log('OpenClaw Environment:');
  console.log(`  Root: ${env.openclawRoot}`);
  console.log(`  Workspace: ${env.workspaceRoot}`);
}

// ==================== Logging ====================

function printHeader(title) {
  console.log(`\n╔════════════════════════════════════════════════════╗`);
  console.log(`║  ${title.padEnd(48)} ║`);
  console.log(`╚════════════════════════════════════════════════════╝\n`);
}

function printSuccess(message) {
  console.log(`✅ ${message}`);
}

function printError(message) {
  console.log(`❌ ${message}`);
}

function printWarning(message) {
  console.log(`⚠️  ${message}`);
}

function printInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function printDivider() {
  console.log('\n────────────────────────────────────────────────────────\n');
}

function printFileStatus(filePath, status, message = '') {
  const icons = {
    success: '✓',
    error: '✗',
    skipped: '⏭️',
    pending: '○',
    uploading: '↑',
    downloading: '↓'
  };
  
  const icon = icons[status] || '○';
  const msg = message ? ` - ${message}` : '';
  console.log(`   ${icon} ${filePath}${msg}`);
}

// ==================== Progress Bar ====================

class ProgressBar {
  constructor(total, options = {}) {
    this.total = total;
    this.current = 0;
    this.prefix = options.prefix || 'Progress';
    this.width = options.width || 30;
    this.lastRender = 0;
    this.throttle = options.throttle || 100; // milliseconds
  }

  tick(message = '') {
    this.current++;
    const now = Date.now();
    
    // Throttle rendering
    if (now - this.lastRender < this.throttle && this.current < this.total) {
      return;
    }
    
    this.render(message);
    this.lastRender = now;
  }

  render(message = '') {
    const percent = (this.current / this.total * 100).toFixed(1);
    const filled = Math.round((this.current / this.total) * this.width);
    const empty = this.width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const status = message ? ` - ${message}` : '';
    
    // Move to start of line, clear to end
    process.stdout.write(`\r${this.prefix}: [${bar}] ${percent}% (${this.current}/${this.total})${status}   `);
    
    if (this.current >= this.total) {
      console.log(); // Newline when complete
    }
  }

  update(current, message = '') {
    this.current = current;
    this.render(message);
  }

  done(message = '') {
    this.current = this.total;
    this.render(message);
    console.log();
  }
}

// ==================== File Operations ====================

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function safeReadFile(filePath, encoding = 'utf8') {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, encoding);
  } catch (err) {
    console.error(`Failed to read file ${filePath}:`, err.message);
    return null;
  }
}

function safeWriteFile(filePath, content, encoding = 'utf8') {
  try {
    ensureDirExists(path.dirname(filePath));
    fs.writeFileSync(filePath, content, encoding);
    return true;
  } catch (err) {
    console.error(`Failed to write file ${filePath}:`, err.message);
    return false;
  }
}

function createBackup(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (err) {
    console.error('Failed to create backup:', err.message);
    return null;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (err) {
    return 0;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== Error Handling ====================

class ClawMigrateError extends Error {
  constructor(code, message, cause = null) {
    super(message);
    this.name = 'ClawMigrateError';
    this.code = code;
    this.cause = cause;
  }

  toString() {
    return `[${this.code}] ${this.message}`;
  }
}

function throwGitHubError(message, cause) {
  throw new ClawMigrateError('GITHUB_ERROR', message, cause);
}

function throwConfigError(message, cause) {
  throw new ClawMigrateError('CONFIG_ERROR', message, cause);
}

function throwFileSystemError(message, cause) {
  throw new ClawMigrateError('FILE_SYSTEM_ERROR', message, cause);
}

// ==================== String Utilities ====================

function removeEmptyLines(content) {
  return content.split('\n').filter(line => line.trim() !== '').join('\n');
}

function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, '\n');
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

function escapeMarkdown(text) {
  return text.replace(/([*_`~#])/g, '\\$1');
}

// ==================== Interactive Confirmation ====================

async function confirm(message, defaultValue = true) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  
  return new Promise((resolve) => {
    rl.question(`${message} (${defaultText}): `, (answer) => {
      rl.close();
      
      if (!answer.trim()) {
        resolve(defaultValue);
        return;
      }
      
      const lower = answer.trim().toLowerCase();
      resolve(['y', 'yes'].includes(lower));
    });
  });
}

async function select(message, options, defaultValue = 0) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\n${message}\n`);
  options.forEach((opt, idx) => {
    const defaultMark = idx === defaultValue ? ' (default)' : '';
    console.log(`   [${idx + 1}] ${opt}${defaultMark}`);
  });
  console.log();

  return new Promise((resolve) => {
    rl.question('   Choose: ', (answer) => {
      rl.close();
      const num = parseInt(answer.trim());
      if (num > 0 && num <= options.length) {
        resolve(num - 1);
      } else {
        resolve(defaultValue);
      }
    });
  });
}

// ==================== Time Utilities ====================

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

// ==================== Exports ====================

module.exports = {
  // OpenClaw environment
  getOpenClawEnv,
  printOpenClawConfig,
  
  // Logging
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printDivider,
  printFileStatus,
  
  // Progress bar
  ProgressBar,
  
  // File operations
  ensureDirExists,
  safeReadFile,
  safeWriteFile,
  createBackup,
  getFileSize,
  formatFileSize,
  
  // Error handling
  ClawMigrateError,
  throwGitHubError,
  throwConfigError,
  throwFileSystemError,
  
  // String utilities
  removeEmptyLines,
  normalizeLineEndings,
  truncate,
  escapeMarkdown,
  
  // Interactive confirmation
  confirm,
  select,
  
  // Time utilities
  formatDuration,
  formatTimestamp
};
