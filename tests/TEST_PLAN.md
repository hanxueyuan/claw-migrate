# ClawMigrate 测试计划

## 📋 概述

本文档定义了 ClawMigrate 技能的完整测试策略，包括单元测试、集成测试和 E2E 测试。

**测试目标**:
- 确保所有核心功能正常工作
- 验证边界条件和错误处理
- 保证代码质量 > 70% 覆盖率
- 支持 CI/CD 自动化

---

## 🏗️ 测试架构

```
tests/
├── unit/                    # 单元测试
│   ├── config.test.js       # 配置管理测试
│   ├── github.test.js       # GitHub API 测试
│   ├── merger.test.js       # 合并引擎测试
│   └── utils.test.js        # 工具函数测试
│
├── integration/             # 集成测试
│   ├── backup-flow.test.js  # 备份流程测试
│   ├── restore-flow.test.js # 恢复流程测试
│   └── setup-wizard.test.js # 配置向导测试
│
├── e2e/                     # E2E 测试
│   └── github-sync.test.js  # GitHub 同步测试
│
├── fixtures/                # 测试数据
│   ├── sample-config.json
│   ├── mock-files/
│   └── expected-output/
│
└── TEST_PLAN.md             # 本文件
```

---

## 🧪 测试用例设计

### 1. 单元测试 (Unit Tests)

#### 1.1 config.js 测试

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| `loadConfig - 正常加载` | 加载已存在的配置文件 | 返回配置对象 |
| `loadConfig - 文件不存在` | 加载不存在的配置文件 | 返回 null |
| `loadConfig - JSON 解析错误` | 加载损坏的 JSON 文件 | 返回 null，打印错误 |
| `saveConfig - 正常保存` | 保存配置到新文件 | 返回 true，文件存在 |
| `saveConfig - 更新配置` | 更新已有配置 | 返回 true，updatedAt 更新 |
| `deleteConfig - 正常删除` | 删除配置文件 | 返回 true，文件不存在 |
| `validateConfig - 有效配置` | 验证完整配置 | valid: true |
| `validateConfig - 空配置` | 验证空配置 | valid: false, 包含错误 |
| `validateConfig - 缺少 repo` | 验证缺少 repo 的配置 | valid: false, 包含 repo 错误 |
| `validateConfig - 缺少 content` | 验证缺少备份内容的配置 | valid: false, 包含 content 错误 |

#### 1.2 github.js 测试

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| `GitHubClient - 构造` | 创建客户端实例 | 正确解析 owner/repo |
| `GitHubClient - request` | 发送 API 请求 | 返回响应数据 |
| `GitHubClient - 错误处理` | API 返回错误状态码 | 抛出错误 |
| `GitHubReader - getFileList` | 获取文件列表 | 返回文件数组 |
| `GitHubReader - shouldSkip` | 跳过禁止文件 | 正确识别跳过模式 |
| `GitHubReader - getFileContent` | 读取文件内容 | 返回解码后的内容 |
| `GitHubWriter - updateFile` | 更新/创建文件 | 返回提交信息 |
| `GitHubWriter - deleteFile` | 删除文件 | 返回删除信息 |
| `getToken - 环境变量` | 从环境变量获取 | 返回 GITHUB_TOKEN |
| `getToken - gh CLI` | 从 gh CLI 获取 | 返回 token |

#### 1.3 merger.js 测试

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| `getStrategy - 敏感文件` | .env 文件策略 | 返回 'skip' |
| `getStrategy - 记忆文件` | MEMORY.md 策略 | 返回 'merge' |
| `getStrategy - 学习记录` | .learnings/ 策略 | 返回 'append' |
| `getStrategy - 技能文件` | skills/ 策略 | 返回 'incremental' |
| `getStrategy - 默认文件` | 普通文件策略 | 返回 'overwrite' |
| `merge - 覆盖` | 普通文件合并 | 返回远端内容 |
| `merge - 追加去重` | 学习记录合并 | 追加新行，去重 |
| `generatePreview` | 生成恢复预览 | 正确分类文件 |
| `printPreview` | 打印预览 | 正确格式化输出 |

#### 1.4 utils.js 测试

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| `getOpenClawEnv` | 获取环境配置 | 返回正确路径 |
| `printHeader` | 打印头部 | 正确格式化 |
| `printSuccess` | 打印成功 | 带 ✅ 图标 |
| `printError` | 打印错误 | 带 ❌ 图标 |
| `ensureDirExists` | 创建目录 | 目录存在 |
| `safeReadFile - 存在` | 读取存在文件 | 返回内容 |
| `safeReadFile - 不存在` | 读取不存在文件 | 返回 null |
| `safeWriteFile` | 写入文件 | 返回 true |
| `createBackup` | 创建备份 | 返回备份路径 |
| `ClawMigrateError` | 自定义错误 | 包含 code 和 cause |
| `normalizeLineEndings` | 标准化换行 | 统一为 \n |
| `truncate` | 截断字符串 | 正确截断带省略号 |

---

### 2. 集成测试 (Integration Tests)

#### 2.1 backup-flow.test.js

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| 完整备份流程 | 从配置加载到上传完成 | 所有文件成功上传 |
| 空配置备份 | 未选择备份内容 | 提示配置，不执行 |
| 部分文件不存在 | 部分选择文件不存在 | 跳过不存在文件 |
| dry-run 模式 | 预览模式 | 不实际上传，显示预览 |
| 敏感信息警告 | 选择敏感分类 | 显示二次确认警告 |

#### 2.2 restore-flow.test.js

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| 完整恢复流程 | 从 GitHub 恢复到本地 | 所有文件正确恢复 |
| 智能合并 | MEMORY.md 恢复 | 保留本地 + 远端内容 |
| 追加去重 | .learnings/ 恢复 | 追加新记录，去重 |
| 增量同步 | skills/ 恢复 | 跳过本地已有技能 |
| 跳过敏感文件 | .env 恢复 | 跳过不恢复 |
| 本地备份创建 | 恢复前备份 | .migrate-backup/ 创建 |

#### 2.3 setup-wizard.test.js

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| 仓库输入验证 | 输入 owner/repo 格式 | 验证通过 |
| 仓库格式错误 | 输入无效格式 | 提示重新输入 |
| 快捷选择 - 全选 | 输入 'a' | 选择所有分类 |
| 快捷选择 - 推荐 | 输入 'r' | 选择推荐分类 |
| 快捷选择 - 标准 | 输入 's' | 选择标准分类 |
| 手动选择 | 输入编号 '1 2 3' | 选择对应分类 |
| 敏感信息确认 | 选择敏感分类 | 二次确认提示 |

---

### 3. E2E 测试 (End-to-End Tests)

#### 3.1 github-sync.test.js

| 测试项 | 描述 | 预期结果 |
|--------|------|----------|
| 真实仓库备份 | 备份到真实 GitHub 仓库 | 文件可见于仓库 |
| 真实仓库恢复 | 从真实仓库恢复 | 文件正确恢复到本地 |
| 多设备同步场景 | 设备 A 备份，设备 B 恢复 | 配置同步成功 |
| 冲突处理 | 两地修改同一文件 | 按策略正确合并 |

---

## 🔧 测试工具配置

### 测试框架
- **Vitest** - 快速单元测试框架
- **Mock 策略** - 模拟 GitHub API 和文件系统

### 依赖安装
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### 测试脚本
```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest"
  }
}
```

---

## 📊 覆盖率要求

| 模块 | 目标覆盖率 | 优先级 |
|------|-----------|--------|
| config.js | 90% | 高 |
| github.js | 85% | 高 |
| merger.js | 95% | 高 |
| utils.js | 80% | 中 |
| backup.js | 75% | 中 |
| restore.js | 75% | 中 |
| setup.js | 70% | 低 |

**总体目标**: > 70%

---

## 🚀 CI/CD 集成

### GitHub Actions 工作流

#### ci.yml
- 触发：push/PR 到 main 分支
- 步骤：
  1. 安装依赖
  2. ESLint 代码检查
  3. 运行单元测试
  4. 生成覆盖率报告
  5. 上传覆盖率到 PR

#### release.yml
- 触发：创建新 tag
- 步骤：
  1. 运行完整测试
  2. 构建发布包
  3. 创建 GitHub Release
  4. 发布到 ClawHub

---

## ✅ 质量检查清单

### 功能完整性
- [ ] 所有核心功能有测试覆盖
- [ ] 边界条件已测试
- [ ] 错误处理已验证

### 代码质量
- [ ] ESLint 无错误
- [ ] 代码格式统一
- [ ] 注释清晰完整

### 安全性
- [ ] 敏感信息处理正确
- [ ] Token 不泄露
- [ ] 文件权限正确

### 性能
- [ ] 无内存泄漏
- [ ] 大文件处理正常
- [ ] 并发处理正确

---

## 📝 测试执行报告模板

```markdown
## 测试执行报告

**日期**: YYYY-MM-DD
**版本**: v2.3.0
**执行者**: QA Agent

### 测试结果
- 总测试数：XX
- 通过：XX
- 失败：XX
- 跳过：XX

### 覆盖率
- 语句覆盖率：XX%
- 分支覆盖率：XX%
- 函数覆盖率：XX%

### 问题发现
1. [问题描述]
2. [问题描述]

### 建议
1. [改进建议]
```

---

**创建时间**: 2026-03-18  
**最后更新**: 2026-03-18  
**负责人**: QA Agent
