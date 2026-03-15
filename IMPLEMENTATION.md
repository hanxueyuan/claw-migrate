# claw-migrate 实现方案总结

## 架构设计

### v2.0.0 新架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户命令                                │
│   openclaw skill run claw-migrate --repo <owner>/<repo>      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│   index.js - 主入口                                          │
│   • 命令行参数解析                                            │
│   • GitHub Token 获取（环境变量 → gh CLI → 交互式）            │
│   • 协调各模块执行                                            │
└─────────────────────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ github.js │  │ merger.js │  │ writer.js │
    │           │  │           │  │           │
    │ GitHub    │  │ 合并引擎  │  │ 文件写入  │
    │ API 访问   │  │ 智能合并  │  │ 备份管理  │
    └───────────┘  └───────────┘  └───────────┘
```

## 核心模块

### 1. github.js - GitHub API 访问

**职责**：
- 通过 GitHub REST API 读取私有仓库文件
- 递归遍历目录获取文件列表
- 文件内容解码（base64 → UTF-8）

**关键方法**：
```javascript
class GitHubReader {
  testConnection()      // 测试连接，获取仓库信息
  getFileList(type)     // 获取文件列表
  getFileContent(path)  // 获取文件内容
}
```

**认证流程**：
1. 优先使用 `GITHUB_TOKEN` 环境变量
2. 其次尝试 `gh auth token`（gh CLI）
3. 最后交互式提示用户输入

### 2. config.js - 配置管理

**文件分类**：
```javascript
FILE_CATEGORIES = {
  CORE_CONFIG: ['AGENTS.md', 'SOUL.md', ...],
  SKILLS: ['skills/**/SKILL.md', ...],
  MEMORY: ['MEMORY.md', 'memory/*.md'],
  LEARNINGS: ['.learnings/*.md'],
  ENV: ['.env'],
  ...
}
```

**合并策略**：
```javascript
MERGE_STRATEGIES = {
  OVERWRITE: ['CORE_CONFIG', ...],  // 直接覆盖
  MERGE: ['MEMORY', 'LEARNINGS'],   // 智能合并
  SKIP: ['SKILLS', 'ENV']           // 本地已有则跳过
}
```

### 3. merger.js - 合并引擎

**核心逻辑**：
```javascript
class Merger {
  shouldMerge(category)   // 判断是否应该合并
  merge(category, local, remote)  // 执行合并
  mergeMemory(local, remote)      // 记忆合并
  mergeLearnings(local, remote)   // 学习记录合并
}
```

**合并策略详解**：

| 文件类型 | 策略 | 说明 |
|---------|------|------|
| 核心配置 | 跳过 | 本地已有则保留，避免覆盖用户定制 |
| 技能 | 跳过 | 仅添加远端有而本地没有的 |
| 记忆 | 合并 | 保留本地，追加远端新增 section |
| 学习记录 | 追加 | 基于日期 + 内容去重后追加 |
| .env | 跳过 | 保留本地配置 |

### 4. writer.js - 文件写入

**职责**：
- 创建备份（迁移前）
- 原子写入（临时文件 + 重命名）
- 备份恢复
- 清理旧备份

**备份策略**：
- 位置：`.migrate-backup/<timestamp>/`
- 保留数量：最近 10 个
- 内容：现有配置文件、memory、.learnings、skills

## 执行流程

```
1. 解析命令行参数
   │
   ▼
2. 获取 GitHub Token
   ├─ GITHUB_TOKEN 环境变量
   ├─ gh CLI
   └─ 交互式输入
   │
   ▼
3. 测试 GitHub 连接
   │
   ▼
4. 获取文件列表
   │
   ▼
5. 预览模式？
   ├─ 是 → 显示将迁移的文件，退出
   └─ 否 → 继续
   │
   ▼
6. 创建备份
   │
   ▼
7. 逐个处理文件
   ├─ 本地没有 → 直接复制
   ├─ 本地有 + 可合并 → 合并
   └─ 本地有 + 不可合并 → 跳过
   │
   ▼
8. 输出统计和后续步骤
```

## 关键设计决策

### 1. 为什么改为 GitHub 为基础？

**v1.0.0（SSH 同步）的问题**：
- 需要配置 SSH 免密登录，门槛高
- 源机器必须在线且可访问
- 不适合灾难恢复场景

**v2.0.0（GitHub 拉取）的优势**：
- 用户已有 GitHub 仓库
- 源机器不需要在线
- 适合新安装、配置恢复、多设备同步

### 2. 为什么采用增量合并策略？

**场景分析**：
- 新安装：本地无配置 → 完全复制
- 配置恢复：本地配置损坏 → 覆盖恢复
- 多设备同步：本地有配置 → 合并更新

**决策**：
- 默认采用保守策略：不覆盖本地已有配置
- 提供 `--force` 选项（未来）用于强制覆盖
- 自动备份，支持回滚

### 3. 敏感信息处理

**原则**：
- `.env` 文件：本地没有则复制，有则保留本地
- 不强制覆盖用户的 API keys
- 迁移后提示用户检查敏感配置

## 测试策略

### 单元测试

```javascript
// tests/merger.test.js
describe('Merger', () => {
  test('mergeMemory - 本地有内容则保留', () => {...});
  test('mergeLearnings - 追加去重', () => {...});
  test('shouldMerge - 正确判断合并策略', () => {...});
});
```

### 集成测试

```bash
# 1. 创建测试仓库
# 2. 执行迁移
# 3. 验证文件是否正确
# 4. 验证备份是否创建
```

## 未来改进

### 短期
- [ ] 添加 `--force` 选项（强制覆盖）
- [ ] 添加 `--exclude` 选项（排除特定文件）
- [ ] 改进记忆文件的 section 级合并

### 中期
- [ ] 支持从 Git 分支拉取
- [ ] 支持配置文件差异对比
- [ ] 添加迁移后验证步骤

### 长期
- [ ] 支持双向同步
- [ ] 支持冲突解决 UI
- [ ] 支持定时自动同步

## 参考资料

- [GitHub REST API](https://docs.github.com/en/rest)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [OpenClaw 架构文档](/usr/lib/node_modules/openclaw/docs)
