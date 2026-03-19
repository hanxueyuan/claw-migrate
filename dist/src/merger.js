#!/usr/bin/env node

/**
 * Smart merge engine
 * Simplified merge logic
 */

const path = require('path');

class Merger {
  constructor(verbose = false) {
    this.verbose = verbose;
  }

  /**
   * Get restore strategy
   * @param {string} filePath File path
   * @returns {string} Strategy: merge/append/overwrite/skip
   */
  getStrategy(filePath) {
    const fileName = path.basename(filePath);

    // Sensitive files: skip
    if (['.env', '.env.local', '.env.example'].includes(fileName)) {
      return 'skip';
    }

    // Machine-specific config: skip
    const machineSpecific = [
      'feishu/pairing',
      'feishu/dedup',
      'sessions'
    ];
    
    if (machineSpecific.some(p => filePath.includes(p))) {
      return 'skip';
    }

    // Memory files: merge
    if (fileName === 'MEMORY.md' || filePath.includes('memory/')) {
      return 'merge';
    }

    // Learning records: append
    if (filePath.includes('.learnings/')) {
      return 'append';
    }

    // Skill files: incremental sync (handled externally)
    if (filePath.startsWith('skills/')) {
      return 'incremental';
    }

    // Default: overwrite
    return 'overwrite';
  }

  /**
   * Merge two file contents
   * @param {string} filePath File path
   * @param {string} local Local content
   * @param {string} remote Remote content
   * @returns {string} Merged content
   */
  merge(filePath, local, remote) {
    const strategy = this.getStrategy(filePath);

    switch (strategy) {
      case 'merge':
        return this.mergeMemory(local, remote);
      
      case 'append':
        return this.appendDedup(local, remote);
      
      case 'overwrite':
        return remote;
      
      default:
        return local;
    }
  }

  /**
   * Merge memory files (simple version: remote priority + preserve local-only content)
   */
  mergeMemory(local, remote) {
    // Simple strategy: use remote content
    // TODO: Implement smarter paragraph-level merging
    return remote;
  }

  /**
   * Append with deduplication (for learning records)
   */
  appendDedup(local, remote) {
    const localLines = new Set(local.split('\n').map(l => l.trim()));
    const remoteLines = remote.split('\n');
    
    // Find new lines from remote
    const newLines = remoteLines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !localLines.has(trimmed);
    });
    
    if (newLines.length === 0) {
      return local; // No new content
    }
    
    // Append new lines
    return local.trimEnd() + '\n\n' + newLines.join('\n');
  }

  /**
   * Generate restore preview
   */
  generatePreview(files, localFiles) {
    const preview = {
      overwrite: [],
      merge: [],
      append: [],
      skip: [],
      new: []
    };

    for (const file of files) {
      const strategy = this.getStrategy(file.path);
      const existsLocally = localFiles.has(file.path);

      if (strategy === 'skip') {
        preview.skip.push(file.path);
      } else if (!existsLocally) {
        preview.new.push(file.path);
      } else if (strategy === 'merge') {
        preview.merge.push(file.path);
      } else if (strategy === 'append') {
        preview.append.push(file.path);
      } else {
        preview.overwrite.push(file.path);
      }
    }

    return preview;
  }

  /**
   * Print preview
   */
  printPreview(preview) {
    console.log('📋 Restore Preview:\n');
    
    if (preview.new.length > 0) {
      console.log(`   New (${preview.new.length}):`);
      preview.new.slice(0, 10).forEach(f => console.log(`     + ${f}`));
      if (preview.new.length > 10) console.log(`     ... and ${preview.new.length - 10} more`);
      console.log();
    }

    if (preview.merge.length > 0) {
      console.log(`   Merge (${preview.merge.length}):`);
      preview.merge.slice(0, 10).forEach(f => console.log(`     🔄 ${f}`));
      console.log();
    }

    if (preview.append.length > 0) {
      console.log(`   Append (${preview.append.length}):`);
      preview.append.slice(0, 10).forEach(f => console.log(`     ➕ ${f}`));
      console.log();
    }

    if (preview.overwrite.length > 0) {
      console.log(`   Overwrite (${preview.overwrite.length}):`);
      preview.overwrite.slice(0, 10).forEach(f => console.log(`     ⚠️  ${f}`));
      console.log();
    }

    if (preview.skip.length > 0) {
      console.log(`   Skip (${preview.skip.length}):`);
      preview.skip.slice(0, 10).forEach(f => console.log(`     ⏭️  ${f}`));
      console.log();
    }
  }
}

module.exports = { Merger };
