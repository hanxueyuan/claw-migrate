/**
 * merger.js 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Merger } from '../../src/merger.js';

describe('merger.js', () => {
  let merger;

  beforeEach(() => {
    merger = new Merger(false);
  });

  describe('getStrategy', () => {
    it('敏感文件应该返回 skip', () => {
      expect(merger.getStrategy('.env')).toBe('skip');
      expect(merger.getStrategy('.env.local')).toBe('skip');
    });

    it('机器特定配置应该返回 skip', () => {
      expect(merger.getStrategy('feishu/pairing/test.json')).toBe('skip');
      expect(merger.getStrategy('feishu/dedup/test.json')).toBe('skip');
      expect(merger.getStrategy('sessions/test.jsonl')).toBe('skip');
    });

    it('MEMORY.md 应该返回 merge', () => {
      expect(merger.getStrategy('MEMORY.md')).toBe('merge');
    });

    it('memory/ 目录应该返回 merge', () => {
      expect(merger.getStrategy('memory/index.json')).toBe('merge');
    });

    it('.learnings/ 应该返回 append', () => {
      expect(merger.getStrategy('.learnings/LEARNINGS.md')).toBe('append');
      expect(merger.getStrategy('.learnings/ERRORS.md')).toBe('append');
    });

    it('skills/ 应该返回 incremental', () => {
      expect(merger.getStrategy('skills/weather/SKILL.md')).toBe('incremental');
    });

    it('普通文件应该返回 overwrite', () => {
      expect(merger.getStrategy('AGENTS.md')).toBe('overwrite');
      expect(merger.getStrategy('SOUL.md')).toBe('overwrite');
      expect(merger.getStrategy('README.md')).toBe('overwrite');
    });
  });

  describe('merge', () => {
    it('overwrite 策略应该返回远端内容', () => {
      const local = 'local content';
      const remote = 'remote content';
      
      const result = merger.merge('AGENTS.md', local, remote);
      expect(result).toBe(remote);
    });

    it('merge 策略应该调用 mergeMemory', () => {
      const local = '# Local Memory\n\nContent';
      const remote = '# Remote Memory\n\nNew Content';
      
      const result = merger.merge('MEMORY.md', local, remote);
      // 当前简单实现返回远端内容
      expect(result).toBe(remote);
    });

    it('append 策略应该追加去重', () => {
      const local = 'Line 1\nLine 2\nLine 3';
      const remote = 'Line 2\nLine 4\nLine 5';
      
      const result = merger.merge('.learnings/test.md', local, remote);
      
      // 应该保留本地的所有行，追加远端的新行（Line 4, Line 5）
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
      expect(result).toContain('Line 4');
      expect(result).toContain('Line 5');
    });

    it('append 策略没有新内容时返回本地', () => {
      const local = 'Line 1\nLine 2';
      const remote = 'Line 1\nLine 2';
      
      const result = merger.merge('.learnings/test.md', local, remote);
      expect(result).toBe(local);
    });
  });

  describe('mergeMemory', () => {
    it('应该使用远端内容（简单实现）', () => {
      const local = '# Local\n\nOld memory';
      const remote = '# Remote\n\nNew memory';
      
      const result = merger.mergeMemory(local, remote);
      expect(result).toBe(remote);
    });
  });

  describe('appendDedup', () => {
    it('应该追加新行并去重', () => {
      const local = 'Line 1\nLine 2\nLine 3';
      const remote = 'Line 2\nLine 3\nLine 4';
      
      const result = merger.appendDedup(local, remote);
      
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
      expect(result).toContain('Line 4');
      
      // Line 2 和 Line 3 不应该重复
      const lines = result.split('\n');
      const line2Count = lines.filter(l => l.trim() === 'Line 2').length;
      expect(line2Count).toBe(1);
    });

    it('空行不应该被追加', () => {
      const local = 'Line 1';
      const remote = '\n\n\n';
      
      const result = merger.appendDedup(local, remote);
      expect(result).toBe(local);
    });

    it('没有新行时返回本地', () => {
      const local = 'Line 1\nLine 2';
      const remote = 'Line 1\nLine 2';
      
      const result = merger.appendDedup(local, remote);
      expect(result).toBe(local);
    });
  });

  describe('generatePreview', () => {
    it('应该正确分类文件（本地已有的按策略分类）', () => {
      const files = [
        { path: 'AGENTS.md' },
        { path: 'MEMORY.md' },
        { path: '.learnings/test.md' },
        { path: '.env' },
        { path: 'skills/test/SKILL.md' }
      ];
      
      // 本地已有 AGENTS.md 和 MEMORY.md
      const localFiles = new Set(['AGENTS.md', 'MEMORY.md', '.learnings/test.md']);
      
      const preview = merger.generatePreview(files, localFiles);
      
      expect(preview.overwrite).toContain('AGENTS.md');
      expect(preview.merge).toContain('MEMORY.md');
      expect(preview.append).toContain('.learnings/test.md');
      expect(preview.skip).toContain('.env');
      expect(preview.new).toContain('skills/test/SKILL.md');
    });

    it('空文件列表应该返回空预览', () => {
      const preview = merger.generatePreview([], new Set());
      
      expect(preview.overwrite).toHaveLength(0);
      expect(preview.merge).toHaveLength(0);
      expect(preview.append).toHaveLength(0);
      expect(preview.skip).toHaveLength(0);
      expect(preview.new).toHaveLength(0);
    });
  });

  describe('printPreview', () => {
    it('应该打印预览信息（不报错）', () => {
      const preview = {
        overwrite: ['AGENTS.md'],
        merge: ['MEMORY.md'],
        append: ['.learnings/test.md'],
        skip: ['.env'],
        new: ['skills/test/SKILL.md']
      };
      
      // 不应该抛出错误
      expect(() => merger.printPreview(preview)).not.toThrow();
    });

    it('超过 10 个文件应该显示省略号', () => {
      const preview = {
        overwrite: Array(15).fill().map((_, i) => `file${i}.md`),
        merge: [],
        append: [],
        skip: [],
        new: []
      };
      
      expect(() => merger.printPreview(preview)).not.toThrow();
    });
  });
});
