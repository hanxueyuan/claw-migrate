/**
 * config.js 单元测试
 * 测试配置加载、保存、验证功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// 使用实际的 config 模块
const {
  ensureConfigDir,
  loadConfig,
  saveConfig,
  deleteConfig,
  configExists,
  validateConfig
} = await import('../../src/config.js');

// 使用实际路径（由 config.js 内部决定）
const CONFIG_PATH = path.join('/workspace/projects', 'claw-migrate', 'config.json');
const CONFIG_DIR_PATH = path.join('/workspace/projects', 'claw-migrate');

describe('config.js', () => {
  // 每个测试前清理
  beforeEach(() => {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  // 每个测试后清理
  afterEach(() => {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  describe('validateConfig', () => {
    it('应该验证有效配置', () => {
      const config = {
        repo: 'owner/repo',
        branch: 'main',
        backup: { content: ['core', 'skills'] }
      };
      
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝空配置', () => {
      const result = validateConfig(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('配置为空');
    });

    it('应该拒绝缺少 repo 的配置', () => {
      const config = {
        branch: 'main',
        backup: { content: ['core'] }
      };
      
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('仓库格式'))).toBe(true);
    });

    it('应该拒绝 repo 格式错误的配置', () => {
      const config = {
        repo: 'invalid-repo',
        branch: 'main',
        backup: { content: ['core'] }
      };
      
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('仓库格式'))).toBe(true);
    });

    it('应该拒绝缺少 branch 的配置', () => {
      const config = {
        repo: 'owner/repo',
        backup: { content: ['core'] }
      };
      
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('分支名称'))).toBe(true);
    });

    it('应该拒绝缺少备份内容的配置', () => {
      const config = {
        repo: 'owner/repo',
        branch: 'main',
        backup: { content: [] }
      };
      
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('备份内容'))).toBe(true);
    });
  });

  describe('saveConfig and loadConfig', () => {
    it('应该保存和加载配置', async () => {
      const testConfig = {
        repo: 'test/repo',
        branch: 'main',
        backup: { content: ['core'] }
      };
      
      // 确保目录存在
      ensureConfigDir();
      
      // 保存配置
      const saveResult = await saveConfig(testConfig);
      expect(saveResult).toBe(true);
      expect(fs.existsSync(CONFIG_PATH)).toBe(true);
      
      // 加载配置
      const loadedConfig = await loadConfig();
      expect(loadedConfig).toEqual(testConfig);
      expect(loadedConfig.updatedAt).toBeDefined();
    });
  });

  describe('configExists', () => {
    it('文件存在时返回 true', async () => {
      ensureConfigDir();
      fs.writeFileSync(CONFIG_PATH, '{}');
      
      const exists = await configExists();
      expect(exists).toBe(true);
    });

    it('文件不存在时返回 false', async () => {
      const exists = await configExists();
      expect(exists).toBe(false);
    });
  });

  describe('deleteConfig', () => {
    it('应该删除配置文件', async () => {
      ensureConfigDir();
      fs.writeFileSync(CONFIG_PATH, '{}');
      
      expect(fs.existsSync(CONFIG_PATH)).toBe(true);
      
      const result = await deleteConfig();
      
      expect(result).toBe(true);
      expect(fs.existsSync(CONFIG_PATH)).toBe(false);
    });

    it('文件不存在时返回 true', async () => {
      const result = await deleteConfig();
      expect(result).toBe(true);
    });
  });
});
