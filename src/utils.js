#!/usr/bin/env node

/**
 * 工具函数模块
 */

// 打印头部
function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + title);
  console.log('='.repeat(60) + '\n');
}

// 打印成功消息
function printSuccess(message) {
  console.log('\n✅ ' + message);
}

// 打印错误消息
function printError(message) {
  console.log('\n❌ ' + message);
}

// 打印警告消息
function printWarning(message) {
  console.log('\n⚠️  ' + message);
}

// 打印信息消息
function printInfo(message) {
  console.log('\nℹ️  ' + message);
}

// 打印进度
function printProgress(current, total, message) {
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(percent / 5) + '░'.repeat(20 - percent / 5);
  process.stdout.write(`\r  [${bar}] ${percent}% - ${message}`);
  if (current === total) {
    console.log();
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 格式化时间
function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  return (ms / 1000).toFixed(1) + 's';
}

// 检查是否是 Git 仓库
function isGitRepo(dir) {
  const fs = require('fs');
  const path = require('path');
  return fs.existsSync(path.join(dir, '.git'));
}

// 获取 Git 远程仓库 URL
function getGitRemoteUrl(dir) {
  const { execSync } = require('child_process');
  const path = require('path');
  
  try {
    const url = execSync('git remote get-url origin', {
      cwd: dir,
      encoding: 'utf8'
    }).trim();
    return url;
  } catch (e) {
    return null;
  }
}

// 从 Git URL 提取 owner/repo
function extractRepoFromUrl(url) {
  // https://github.com/owner/repo.git
  // git@github.com:owner/repo.git
  
  const httpsMatch = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (httpsMatch) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`;
  }
  
  return null;
}

module.exports = {
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printProgress,
  formatFileSize,
  formatDuration,
  isGitRepo,
  getGitRemoteUrl,
  extractRepoFromUrl
};
