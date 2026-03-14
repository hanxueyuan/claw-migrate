# claw-migrate - OpenClaw GitHub 配置迁移工具

## Description
从 GitHub 私有仓库拉取 OpenClaw 配置到本地。支持智能合并，保留本地已有配置。

**核心特性**：
- 从 GitHub 私有仓库拉取配置
- 智能增量合并（不覆盖本地配置）
- 自动备份与回滚支持
- 差异预览模式
- 支持环境变量或交互式输入 GitHub Token

## Activation
当用户提到以下关键词时激活：
- "从 GitHub 迁移配置"
- "拉取仓库配置"
- "OpenClaw 迁移"
- "配置同步"
- "技能迁移"
- "claw 迁移"

## Capabilities
- 通过 GitHub API 读取私有仓库文件
- 智能合并配置（本地没有则添加，有则保留本地）
- 同步团队配置（AGENTS.md, SOUL.md, IDENTITY.md, USER.md 等）
- 同步技能文件（skills/*/SKILL.md）
- 同步记忆文件（MEMORY.md, memory/*.md）
- 同步学习记录（.learnings/*.md）
- 自动备份（迁移前备份到 .migrate-backup/<timestamp>/）
- 差异预览（--dry-run 模式）

## Usage

### 基本用法

```bash
# 从 GitHub 仓库拉取配置（自动检测本地状态）
openclaw skill run MigrateKit --repo <owner>/<repo>

# 指定分支
openclaw skill run MigrateKit --repo <owner>/<repo> --branch main

# 指定子目录路径（配置在 workspace/projects/workspace 下）
openclaw skill run MigrateKit --repo <owner>/<repo> --path workspace/projects/workspace

# 预览变更（不实际写入）
openclaw skill run MigrateKit --repo <owner>/<repo> --dry-run
```

### 参数说明

| 参数 | 简写 | 必填 | 说明 |
|------|------|------|------|
| `--repo` | `-r` | ✅ | GitHub 仓库（格式：owner/repo） |
| `--branch` | `-b` | ❌ | 分支名（默认：main） |
| `--path` | `-p` | ❌ | 仓库内的路径（默认：根目录） |
| `--type` | `-t` | ❌ | 迁移类型：`all`（默认）`config` `memory` `learnings` `skills` |
| `--dry-run` | | ❌ | 预览模式，不实际写入文件 |
| `--no-backup` | | ❌ | 不创建备份（默认创建） |
| `--verbose` | `-v` | ❌ | 详细输出 |

### 合并策略

**增量合并（默认）**：
- 本地没有的文件 → 从远端复制
- 本地已有的文件 → 保留本地（不覆盖）
- 技能文件 → 复制远端有而本地没有的
- 记忆文件 → 合并（远端新增的添加）
- 学习记录 → 追加去重

## Files

### 源代码
- `src/index.js` - 主入口，命令行参数解析
- `src/config.js` - 配置管理，文件分类定义
- `src/github.js` - GitHub API 访问（替代 reader.js）
- `src/merger.js` - 合并引擎（核心逻辑）
- `src/writer.js` - 文件写入，备份管理
- `src/utils.js` - 工具函数（差异报告等）

### 文档
- `README.md` - 完整使用文档
- `IMPLEMENTATION.md` - 实现方案总结

## Examples

### 从私有仓库拉取配置

```bash
# 基本用法
openclaw skill run MigrateKit --repo your-username/your-repo

# 指定分支和路径
openclaw skill run MigrateKit \
  --repo your-username/your-repo \
  --branch main \
  --path workspace/projects/workspace

# 仅拉取技能
openclaw skill run MigrateKit \
  --repo your-username/your-repo \
  --type skills

# 预览模式
openclaw skill run MigrateKit \
  --repo your-username/your-repo \
  --dry-run
```

### 仅拉取特定类型

```bash
# 仅配置文件
openclaw skill run MigrateKit --repo your-username/your-repo --type config

# 仅记忆文件
openclaw skill run MigrateKit --repo your-username/your-repo --type memory

# 仅技能
openclaw skill run MigrateKit --repo your-username/your-repo --type skills

# 仅学习记录
openclaw skill run MigrateKit --repo your-username/your-repo --type learnings
```

## Notes

### 认证方式

1. **环境变量**（推荐）：
   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   openclaw skill run MigrateKit --repo <owner>/<repo>
   ```

2. **gh CLI**（如果已安装并登录）：
   ```bash
   gh auth token | openclaw skill run MigrateKit --repo <owner>/<repo>
   ```

3. **交互式输入**：
   - 如果没有检测到 Token，工具会提示用户输入

### 安全特性
- ✅ 迁移前自动备份现有配置
- ✅ 不覆盖本地已有配置（增量合并）
- ✅ 敏感信息可选迁移
- ✅ 原子写入（临时文件 + 重命名）

### 文件迁移策略

| 文件类型 | 策略 |
|---------|------|
| AGENTS.md, SOUL.md, IDENTITY.md, USER.md | 本地没有则复制，有则跳过 |
| TOOLS.md, HEARTBEAT.md | 本地没有则复制，有则跳过 |
| skills/ | 复制远端有而本地没有的技能 |
| MEMORY.md, memory/ | 合并（远端新增的添加） |
| .learnings/ | 追加去重 |
| .env | 本地没有则复制，有则保留本地 |

### 备份恢复
```bash
# 列出可用备份
ls .migrate-backup/

# 手动恢复
cp .migrate-backup/2024-01-15T10-30-00/AGENTS.md ./AGENTS.md
```

### 故障排除
- **404 Not Found**：检查仓库名是否正确，确认是私有仓库且有访问权限
- **401 Unauthorized**：GitHub Token 无效或过期
- **Rate Limit**：等待一段时间后重试，或使用认证的 Token

## Version
2.0.0

## Author
OpenClaw Team

## License
MIT
