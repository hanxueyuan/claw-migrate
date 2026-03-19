/**
 * utils.js 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

import {
  getOpenClawEnv,
  printHeader,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  ensureDirExists,
  safeReadFile,
  safeWriteFile,
  createBackup,
  getFileSize,
  formatFileSize,
  normalizeLineEndings,
  truncate,
  formatDuration,
  formatTimestamp,
  ClawMigrateError,
  throwConfigError
} from '../../src/utils.js';

const TEST_DIR = '/tmp/test-claw-migrate-utils';

describe('utils.js', () => {
  // 清理测试目录
  beforeEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
    // 确保测试目录存在
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('getOpenClawEnv', () => {
    it('应该返回环境配置对象', () => {
      const env = getOpenClawEnv();
      expect(env).toHaveProperty('openclawRoot');
      expect(env).toHaveProperty('workspaceRoot');
      expect(env).toHaveProperty('getWorkspaceFile');
      expect(typeof env.getWorkspaceFile).toBe('function');
    });

    it('getWorkspaceFile 应该返回正确路径', () => {
      const env = getOpenClawEnv();
      const workspaceFile = env.getWorkspaceFile('test.md');
      expect(workspaceFile).toContain('test.md');
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化 0 字节', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('应该格式化字节', () => {
      expect(formatFileSize(100)).toBe('100 B');
    });

    it('应该格式化 KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('应该格式化 MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('应该格式化 GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('normalizeLineEndings', () => {
    it('应该将 CRLF 转换为 LF', () => {
      const input = 'line1\r\nline2\r\nline3';
      const output = normalizeLineEndings(input);
      expect(output).toBe('line1\nline2\nline3');
    });

    it('LF 保持不变', () => {
      const input = 'line1\nline2\nline3';
      const output = normalizeLineEndings(input);
      expect(output).toBe('line1\nline2\nline3');
    });
  });

  describe('truncate', () => {
    it('短字符串不截断', () => {
      expect(truncate('short', 10)).toBe('short');
    });

    it('长字符串截断并添加省略号', () => {
      expect(truncate('this is a long string', 10)).toBe('this is...');
    });

    it('空字符串返回空', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('formatDuration', () => {
    it('应该格式化秒', () => {
      expect(formatDuration(5000)).toBe('5s');
    });

    it('应该格式化分钟', () => {
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    it('应该格式化小时', () => {
      expect(formatDuration(3725000)).toBe('1h 2m 5s');
    });
  });

  describe('formatTimestamp', () => {
    it('应该返回 ISO 格式时间戳', () => {
      const timestamp = formatTimestamp(new Date('2026-03-18T10:30:00.000Z'));
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });
  });

  describe('ensureDirExists', () => {
    it('应该创建不存在的目录', () => {
      const testPath = path.join(TEST_DIR, 'new-dir');
      expect(fs.existsSync(testPath)).toBe(false);
      ensureDirExists(testPath);
      expect(fs.existsSync(testPath)).toBe(true);
    });

    it('已存在的目录不报错', () => {
      const testPath = path.join(TEST_DIR, 'existing-dir');
      fs.mkdirSync(testPath, { recursive: true });
      expect(() => ensureDirExists(testPath)).not.toThrow();
    });
  });

  describe('safeReadFile', () => {
    it('读取存在的文件', () => {
      const testFile = path.join(TEST_DIR, 'test.txt');
      fs.writeFileSync(testFile, 'test content');
      
      const content = safeReadFile(testFile);
      expect(content).toBe('test content');
    });

    it('读取不存在的文件返回 null', () => {
      const content = safeReadFile('/nonexistent/file.txt');
      expect(content).toBeNull();
    });
  });

  describe('safeWriteFile', () => {
    it('应该写入文件', () => {
      const testFile = path.join(TEST_DIR, 'write-test.txt');
      const result = safeWriteFile(testFile, 'test content');
      
      expect(result).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf8')).toBe('test content');
    });

    it('应该自动创建目录', () => {
      const testFile = path.join(TEST_DIR, 'nested/dir/file.txt');
      const result = safeWriteFile(testFile, 'test');
      
      expect(result).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
    });
  });

  describe('createBackup', () => {
    it('应该创建备份文件', () => {
      const originalFile = path.join(TEST_DIR, 'original.txt');
      fs.writeFileSync(originalFile, 'original content');
      
      const backupPath = createBackup(originalFile);
      
      expect(backupPath).toBeDefined();
      expect(fs.existsSync(backupPath)).toBe(true);
      expect(fs.readFileSync(backupPath, 'utf8')).toBe('original content');
    });

    it('文件不存在返回 null', () => {
      const result = createBackup('/nonexistent/file.txt');
      expect(result).toBeNull();
    });
  });

  describe('getFileSize', () => {
    it('应该返回文件大小', () => {
      const testFile = path.join(TEST_DIR, 'size-test.txt');
      fs.writeFileSync(testFile, '12345');
      
      const size = getFileSize(testFile);
      expect(size).toBe(5);
    });

    it('文件不存在返回 0', () => {
      const size = getFileSize('/nonexistent/file.txt');
      expect(size).toBe(0);
    });
  });

  describe('ClawMigrateError', () => {
    it('应该创建自定义错误', () => {
      const error = new ClawMigrateError('TEST_ERROR', 'Test message');
      
      expect(error.name).toBe('ClawMigrateError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
    });

    it('toString 应该返回格式化字符串', () => {
      const error = new ClawMigrateError('TEST_ERROR', 'Test message');
      expect(error.toString()).toBe('[TEST_ERROR] Test message');
    });

    it('应该支持 cause', () => {
      const cause = new Error('Original error');
      const error = new ClawMigrateError('TEST_ERROR', 'Test message', cause);
      
      expect(error.cause).toBe(cause);
    });
  });

  describe('throwConfigError', () => {
    it('应该抛出配置错误', () => {
      expect(() => {
        throwConfigError('Config error message');
      }).toThrow(ClawMigrateError);
      
      try {
        throwConfigError('Test');
      } catch (error) {
        expect(error.code).toBe('CONFIG_ERROR');
      }
    });
  });
});
