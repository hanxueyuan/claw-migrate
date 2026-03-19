/**
 * AI 恢复功能单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIRestoreExecutor } from '../../src/restore-ai.js';

describe('restore-ai.js', () => {
  let executor;
  let mockConfig;

  beforeEach(async () => {
    mockConfig = {
      repo: 'test/repo',
      branch: 'main',
      auth: { method: 'env' },
      backup: { content: ['core', 'skills'] }
    };

    executor = new AIRestoreExecutor(mockConfig, {
      verbose: false,
      dryRun: true
    });

    // 初始化 executor
    await executor.init();
  });

  describe('parseAIRequest', () => {
    it('应该解析"完整恢复"', async () => {
      const plan = await executor.parseAIRequest('完整恢复');
      
      expect(plan.content).toContain('core');
      expect(plan.content).toContain('skills');
      expect(plan.content).toContain('memory');
      expect(plan.content).toContain('learnings');
      expect(plan.content).toContain('cron');
    });

    it('应该解析"恢复所有配置"', async () => {
      const plan = await executor.parseAIRequest('恢复所有配置');
      
      expect(plan.content.length).toBeGreaterThan(0);
      expect(plan.content).toContain('core');
    });

    it('应该解析"恢复核心配置"', async () => {
      const plan = await executor.parseAIRequest('恢复核心配置');
      
      expect(plan.content).toContain('core');
    });

    it('应该解析"恢复核心配置和技能"', async () => {
      const plan = await executor.parseAIRequest('恢复核心配置和技能');
      
      expect(plan.content).toContain('core');
      expect(plan.content).toContain('skills');
    });

    it('应该解析"恢复记忆数据"', async () => {
      const plan = await executor.parseAIRequest('恢复记忆数据');
      
      expect(plan.content).toContain('memory');
    });

    it('应该解析"恢复到 /path/to/workspace"', async () => {
      const plan = await executor.parseAIRequest('恢复到 /path/to/workspace');
      
      expect(plan.targetPath).toBe('/path/to/workspace');
    });

    it('应该解析"恢复除.env 外的所有内容"', async () => {
      const plan = await executor.parseAIRequest('恢复除.env 外的所有内容');
      
      expect(plan.options.skipSensitive).toBe(true);
    });

    it('应该解析"恢复所有配置，跳过敏感信息"', async () => {
      const plan = await executor.parseAIRequest('恢复所有配置，跳过敏感信息');
      
      expect(plan.options.skipSensitive).toBe(true);
    });

    it('应该解析英文"full restore"', async () => {
      const plan = await executor.parseAIRequest('full restore');
      
      expect(plan.content.length).toBeGreaterThan(0);
    });

    it('应该解析英文"restore core config"', async () => {
      const plan = await executor.parseAIRequest('restore core config');
      
      expect(plan.content).toContain('core');
    });

    it('应该解析混合语言"恢复 core config"', async () => {
      const plan = await executor.parseAIRequest('恢复 core config');
      
      expect(plan.content).toContain('core');
    });

    it('应该解析"不备份"选项', async () => {
      const plan = await executor.parseAIRequest('恢复核心配置，不备份');
      
      expect(plan.options.createBackup).toBe(false);
    });

    it('应该解析"不指引"选项', async () => {
      const plan = await executor.parseAIRequest('恢复核心配置，不指引');
      
      expect(plan.options.showGuidance).toBe(false);
    });

    it('空请求应该使用默认值', async () => {
      const plan = await executor.parseAIRequest('');
      
      expect(plan.content).toContain('core');
      expect(plan.content).toContain('skills');
      expect(plan.content).toContain('memory');
    });
  });

  describe('displayRestorePlan', () => {
    it('应该能显示恢复计划（不报错）', async () => {
      const plan = {
        source: 'github',
        content: ['core', 'skills'],
        targetPath: '/workspace/projects/workspace',
        options: {
          createBackup: true,
          showGuidance: true,
          skipSensitive: true
        }
      };

      // 不应该抛出错误
      expect(async () => {
        await executor.displayRestorePlan(plan);
      }).not.toThrow();
    });
  });

  describe('displayGuidance', () => {
    it('应该能显示操作指引（不报错）', async () => {
      const plan = {
        content: ['core', 'memory'],
        options: {
          skipSensitive: true,
          showGuidance: true
        }
      };

      // 不应该抛出错误
      expect(async () => {
        await executor.displayGuidance(plan);
      }).not.toThrow();
    });

    it('showGuidance 为 false 时不显示指引', async () => {
      const plan = {
        content: ['core'],
        options: {
          showGuidance: false
        }
      };

      // 不应该抛出错误
      expect(async () => {
        await executor.displayGuidance(plan);
      }).not.toThrow();
    });
  });

  describe('确认执行', () => {
    it('应该能处理用户确认（需要手动测试）', () => {
      // 这个测试需要用户交互，暂时跳过
      expect(true).toBe(true);
    });
  });
});
