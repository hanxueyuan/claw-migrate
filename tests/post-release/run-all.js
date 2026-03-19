#!/usr/bin/env node
/**
 * claw-migrate v2.2.0 发布后验证测试 - 运行所有测试
 * 
 * 汇总执行所有发布后验证测试
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEST_DIR = __dirname;
const SKILL_DIR = path.join(__dirname, '../..');

const TESTS = [
    { name: '安装测试', file: 'install.test.js' },
    { name: '配置向导测试', file: 'setup-wizard.test.js' },
    { name: '命令测试', file: 'commands.test.js' }
];

const RESULTS = [];

function log(message, type = 'info') {
    const timestamp = new Date().toISOString().slice(0, 19);
    const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'run' ? '▶️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function runTest(test) {
    const testPath = path.join(TEST_DIR, test.file);
    
    if (!fs.existsSync(testPath)) {
        log(`测试文件不存在：${test.file}`, 'fail');
        RESULTS.push({ ...test, status: 'fail', error: '文件不存在' });
        return false;
    }
    
    log(`运行 ${test.name}...`, 'run');
    
    try {
        const output = execSync(`node ${test.file}`, {
            cwd: TEST_DIR,
            encoding: 'utf-8',
            stdio: 'inherit'
        });
        
        RESULTS.push({ ...test, status: 'pass' });
        return true;
    } catch (error) {
        RESULTS.push({ ...test, status: 'fail', error: error.message });
        return false;
    }
}

function printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 claw-migrate v2.2.0 发布后验证测试 - 总结果');
    console.log('='.repeat(70));
    
    const passed = RESULTS.filter(r => r.status === 'pass').length;
    const failed = RESULTS.filter(r => r.status === 'fail').length;
    const total = RESULTS.length;
    
    console.log(`\n测试套件汇总:`);
    console.log(`  总测试数：${total}`);
    console.log(`  通过：${passed}`);
    console.log(`  失败：${failed}`);
    console.log(`  通过率：${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
        console.log(`\n失败的测试套件:`);
        RESULTS.filter(r => r.status === 'fail').forEach(r => {
            console.log(`  ❌ ${r.name}: ${r.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(70));
    
    // 生成测试报告
    generateReport();
    
    return failed === 0;
}

function generateReport() {
    const timestamp = new Date().toISOString().slice(0, 19);
    const passed = RESULTS.filter(r => r.status === 'pass').length;
    const total = RESULTS.length;
    const success = passed === total;
    
    const report = `# 发布后验证测试报告

**版本**: v2.2.0  
**测试时间**: ${timestamp}  
**测试状态**: ${success ? '✅ 通过' : '❌ 失败'}

## 测试结果汇总

| 测试套件 | 状态 |
|---------|------|
${RESULTS.map(r => `| ${r.name} | ${r.status === 'pass' ? '✅ 通过' : '❌ 失败'} |`).join('\n')}

## 详细统计

- 总测试套件：${total}
- 通过：${passed}
- 失败：${total - passed}
- 通过率：${((passed / total) * 100).toFixed(1)}%

## 后续步骤

${success ? `
✅ 所有测试通过，可以继续进行发布验证清单检查。
` : `
❌ 部分测试失败，请先修复问题后重新运行测试。

### 失败的测试
${RESULTS.filter(r => r.status === 'fail').map(r => `- ${r.name}: ${r.error}`).join('\n')}
`}

---
*此报告由 tests/post-release/run-all.js 自动生成*
`;
    
    const reportPath = path.join(SKILL_DIR, 'POST_RELEASE_TEST_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    log(`测试报告已保存至：POST_RELEASE_TEST_REPORT.md`, 'info');
}

// 主执行
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  claw-migrate v2.2.0 发布后验证测试                                ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log('测试目录:', TEST_DIR);
console.log('技能目录:', SKILL_DIR);
console.log('');

// 运行所有测试
for (const test of TESTS) {
    runTest(test);
    console.log('');
}

// 输出汇总
const success = printSummary();
process.exit(success ? 0 : 1);
