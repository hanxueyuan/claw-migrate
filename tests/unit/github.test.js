/**
 * github.js 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubClient, GitHubReader, GitHubWriter, getToken } from '../../src/github.js';

// Mock https 模块
vi.mock('node:https', () => ({
  request: vi.fn()
}));

describe('github.js', () => {
  describe('GitHubClient', () => {
    let client;

    beforeEach(() => {
      client = new GitHubClient('test-token', 'owner/repo', 'main');
    });

    it('应该正确解析仓库信息', () => {
      expect(client.repoOwner).toBe('owner');
      expect(client.repoName).toBe('repo');
      expect(client.branch).toBe('main');
      expect(client.token).toBe('test-token');
    });

    it('应该正确解析带斜杠的仓库名', () => {
      const c = new GitHubClient('token', 'hanxueyuan/lisa', 'develop');
      expect(c.repoOwner).toBe('hanxueyuan');
      expect(c.repoName).toBe('lisa');
      expect(c.branch).toBe('develop');
    });
  });

  describe('GitHubReader', () => {
    let reader;

    beforeEach(() => {
      reader = new GitHubReader('test-token', 'owner/repo', 'main');
    });

    describe('shouldSkip', () => {
      it('应该跳过 .git/ 目录', () => {
        expect(reader.shouldSkip('.git/config')).toBe(true);
        expect(reader.shouldSkip('.git/HEAD')).toBe(true);
      });

      it('应该跳过 node_modules/', () => {
        expect(reader.shouldSkip('node_modules/package/index.js')).toBe(true);
      });

      it('应该跳过 .migrate-backup/', () => {
        expect(reader.shouldSkip('.migrate-backup/backup.zip')).toBe(true);
      });

      it('应该跳过 logs/', () => {
        expect(reader.shouldSkip('logs/test.log')).toBe(true);
      });

      it('应该跳过 .lock 文件', () => {
        expect(reader.shouldSkip('package-lock.json')).toBe(false);
        expect(reader.shouldSkip('test.lock')).toBe(true);
      });

      it('普通文件不应该跳过', () => {
        expect(reader.shouldSkip('AGENTS.md')).toBe(false);
        expect(reader.shouldSkip('skills/test/SKILL.md')).toBe(false);
      });
    });
  });

  describe('GitHubWriter', () => {
    let writer;

    beforeEach(() => {
      writer = new GitHubWriter('test-token', 'owner/repo', 'main');
    });

    it('应该继承自 GitHubClient', () => {
      expect(writer).toBeInstanceOf(GitHubClient);
    });
  });

  describe('getToken', () => {
    const originalEnv = process.env.GITHUB_TOKEN;

    afterEach(() => {
      // 恢复环境变量
      if (originalEnv) {
        process.env.GITHUB_TOKEN = originalEnv;
      } else {
        delete process.env.GITHUB_TOKEN;
      }
    });

    it('应该从环境变量获取 Token', async () => {
      process.env.GITHUB_TOKEN = 'test-token-from-env';
      
      const token = await getToken({});
      expect(token).toBe('test-token-from-env');
    });

    it('应该从配置获取 Token（如果环境变量不存在）', async () => {
      delete process.env.GITHUB_TOKEN;
      
      const config = { token: 'test-token-from-config' };
      const token = await getToken(config);
      expect(token).toBe('test-token-from-config');
    });

    it('环境变量优先于配置', async () => {
      process.env.GITHUB_TOKEN = 'env-token';
      const config = { token: 'config-token' };
      
      const token = await getToken(config);
      expect(token).toBe('env-token');
    });

    it('都没有时返回 null', async () => {
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;
      
      try {
        // 临时 mock execSync
        const { execSync } = require('node:child_process');
        const originalExecSync = execSync;
        require('node:child_process').execSync = () => {
          throw new Error('gh not available');
        };
        
        const token = await getToken({});
        expect(token).toBeNull();
        
        // 恢复
        require('node:child_process').execSync = originalExecSync;
      } finally {
        if (originalToken) {
          process.env.GITHUB_TOKEN = originalToken;
        }
      }
    });
  });
});
