#!/usr/bin/env node

/**
 * 合并引擎测试
 */

const { Merger } = require('../src/merger');

// 测试结果统计
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected "${expected}", got "${actual}"`);
  }
}

// 测试用例
console.log('Running merger tests...\n');

const merger = new Merger();

// 测试 1: shouldMerge - 记忆文件应该合并
test('shouldMerge - MEMORY 类别', () => {
  assertEqual(merger.shouldMerge('MEMORY'), true, 'MEMORY 应该合并');
});

// 测试 2: shouldMerge - 学习记录应该合并
test('shouldMerge - LEARNINGS 类别', () => {
  assertEqual(merger.shouldMerge('LEARNINGS'), true, 'LEARNINGS 应该合并');
});

// 测试 3: shouldMerge - 技能文件不应该合并
test('shouldMerge - SKILLS 类别', () => {
  assertEqual(merger.shouldMerge('SKILLS'), false, 'SKILLS 不应该合并');
});

// 测试 4: mergeMemory - 本地有内容则保留本地
test('mergeMemory - 本地有内容则保留', () => {
  const local = '# Local Memory\nContent A';
  const remote = '# Remote Memory\nContent B';
  const result = merger.mergeMemory(local, remote);
  assertEqual(result, local, '应该保留本地内容');
});

// 测试 5: mergeMemory - 本地无内容则使用远端
test('mergeMemory - 本地无内容则使用远端', () => {
  const local = '';
  const remote = '# Remote Memory\nContent B';
  const result = merger.mergeMemory(local, remote);
  assertEqual(result, remote, '应该使用远端内容');
});

// 测试 6: mergeLearnings - 追加新条目
test('mergeLearnings - 追加新条目', () => {
  const local = `## 2024-01-14
- [LEARNINGS] Local entry`;

  const remote = `## 2024-01-15
- [LEARNINGS] Remote entry`;

  const result = merger.mergeLearnings(local, remote);
  
  if (!result.includes('Local entry') || !result.includes('Remote entry')) {
    throw new Error('应该包含本地和远端条目');
  }
});

// 测试 7: mergeLearnings - 去重
test('mergeLearnings - 去重', () => {
  const local = `## 2024-01-15
- [LEARNINGS] Same entry`;

  const remote = `## 2024-01-15
- [LEARNINGS] Same entry`;

  const result = merger.mergeLearnings(local, remote);
  
  // 应该只出现一次
  const count = (result.match(/Same entry/g) || []).length;
  if (count !== 1) {
    throw new Error(`应该去重，实际出现 ${count} 次`);
  }
});

// 测试 8: getStrategyName
test('getStrategyName - 返回正确的策略名称', () => {
  assertEqual(merger.getStrategyName('MEMORY'), 'MERGE', 'MEMORY 策略');
  assertEqual(merger.getStrategyName('SKILLS'), 'SKIP', 'SKILLS 策略');
  assertEqual(merger.getStrategyName('CORE_CONFIG'), 'OVERWRITE', 'CORE_CONFIG 策略');
});

// 输出结果
console.log('\n' + '='.repeat(50));
console.log(`Tests: ${passed + failed} total, ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
