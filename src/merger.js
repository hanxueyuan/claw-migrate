#!/usr/bin/env node

/**
 * 合并引擎模块
 * 处理不同类型文件的合并逻辑
 */

const { MERGE_STRATEGIES } = require('./config');

class Merger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  // 判断某类别的文件是否应该合并
  shouldMerge(category) {
    const mergeCategories = MERGE_STRATEGIES.MERGE;
    return mergeCategories.includes(category);
  }

  // 判断某类别的文件是否应该跳过
  shouldSkip(category) {
    const skipCategories = MERGE_STRATEGIES.SKIP;
    return skipCategories.includes(category);
  }

  // 执行合并
  merge(category, localContent, remoteContent) {
    if (this.verbose) {
      console.log(`   合并策略：${category} → ${this.getStrategyName(category)}`);
    }

    switch (category) {
      case 'MEMORY':
        return this.mergeMemory(localContent, remoteContent);
      
      case 'LEARNINGS':
        return this.mergeLearnings(localContent, remoteContent);
      
      default:
        // 默认返回远端内容
        return remoteContent;
    }
  }

  // 获取策略名称
  getStrategyName(category) {
    if (MERGE_STRATEGIES.OVERWRITE.includes(category)) return 'OVERWRITE';
    if (MERGE_STRATEGIES.MERGE.includes(category)) return 'MERGE';
    if (MERGE_STRATEGIES.SKIP.includes(category)) return 'SKIP';
    return 'DEFAULT';
  }

  /**
   * 合并记忆文件
   * 策略：保留本地内容，追加远端新增的 section
   */
  mergeMemory(localContent, remoteContent) {
    // 简单策略：如果本地有内容，保留本地
    // 未来可以实现更智能的 section 级合并
    if (localContent.trim()) {
      return localContent;
    }
    return remoteContent;
  }

  /**
   * 合并学习记录
   * 策略：追加远端新增的条目，基于日期 + 内容去重
   */
  mergeLearnings(localContent, remoteContent) {
    const localEntries = this.parseLearnings(localContent);
    const remoteEntries = this.parseLearnings(remoteContent);
    
    // 找出远端新增的条目
    const newEntries = remoteEntries.filter(remote => {
      return !localEntries.some(local => 
        local.date === remote.date && local.content === remote.content
      );
    });
    
    if (newEntries.length === 0) {
      // 没有新增条目，返回本地内容
      return localContent;
    }
    
    // 追加新条目
    const merged = localContent.trimEnd();
    const newContent = newEntries.map(e => e.raw).join('\n');
    
    return merged + '\n\n' + newContent + '\n';
  }

  /**
   * 解析学习记录文件
   * 返回条目数组
   */
  parseLearnings(content) {
    const entries = [];
    const lines = content.split('\n');
    
    let currentDate = null;
    let currentEntry = null;
    
    for (const line of lines) {
      // 匹配日期标题：## 2024-01-15
      const dateMatch = line.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        if (currentEntry) {
          entries.push(currentEntry);
        }
        currentDate = dateMatch[1];
        currentEntry = null;
        continue;
      }
      
      // 匹配条目：- [LEARNINGS] 标题
      const entryMatch = line.match(/^-\s+\[(\w+)\]\s+(.+)/);
      if (entryMatch && currentDate) {
        if (currentEntry) {
          entries.push(currentEntry);
        }
        currentEntry = {
          date: currentDate,
          type: entryMatch[1],
          content: entryMatch[2],
          raw: line
        };
      } else if (currentEntry && line.trim() && !line.startsWith('#')) {
        //  continuation of previous entry
        currentEntry.raw += '\n' + line;
        currentEntry.content += ' ' + line.trim();
      }
    }
    
    if (currentEntry) {
      entries.push(currentEntry);
    }
    
    return entries;
  }
}

module.exports = { Merger };
