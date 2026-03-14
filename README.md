# claw-migrate - OpenClaw GitHub 配置迁移工具

从 GitHub 私有仓库拉取 OpenClaw 配置到本地，支持智能合并，保留本地已有配置。

## 使用场景

### 场景 1：新安装的 OpenClaw
```
刚完成 openclaw install
      ↓
从 GitHub 私有仓库拉取配置
      ↓
快速获得完整的团队配置、技能、记忆
```

### 场景 2：配置恢复
```
本地配置损坏或丢失
      ↓
从 GitHub 仓库恢复配置
      ↓
恢复到之前的工作状态
```

### 场景 3：多设备同步
```
在多个设备上运行 OpenClaw
      ↓
从中央仓库拉取最新配置
      ↓
保持配置一致
```

## 快速开始

### 1. 准备 GitHub Token

```bash
# 方式 1：使用环境变量（推荐）
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 方式 2：使用 gh CLI（如果已安装）
gh auth login
```

### 2. 执行迁移

```bash
# 基本用法
openclaw skill run MigrateKit --repo your-username/your-repo

# 指定分支和路径
openclaw skill run MigrateKit \
  --repo your-username/your-repo \
  --branch main \
  --path workspace/projects/workspace

# 预览模式（先看会变更什么）
openclaw skill run MigrateKit \
  --repo your-username/your-repo \
  --dry-run
```

## 命令选项

| 参数 | 简写 | 说明 |
|------|------|------|
| `--repo` | `-r` | GitHub 仓库（必填，格式：owner/repo） |
| `--branch` | `-b` | 分支名（默认：main） |
| `--path` | `-p` | 仓库内的路径（默认：根目录） |
| `--type` | `-t` | 迁移类型：all, config, memory, learnings, skills |
| `--dry-run` | | 预览模式，不实际写入文件 |
| `--no-backup` | | 不创建备份 |
| `--verbose` | `-v` | 详细输出 |
| `--token` | | GitHub Token（可选，优先使用环境变量） |

## 迁移策略

### 智能合并原则

| 情况 | 处理方式 |
|------|---------|
| 远端有 + 本地没有 | ✅ 从远端复制 |
| 远端有 + 本地有 | ⚠️ 保留本地（不覆盖） |
| 远端没有 + 本地有 | ✅ 保留本地 |

### 文件类型处理

| 文件类型 | 策略 |
|---------|------|
| AGENTS.md, SOUL.md, IDENTITY.md, USER.md | 本地没有则复制，有则跳过 |
| TOOLS.md, HEARTBEAT.md | 本地没有则复制，有则跳过 |
| skills/ | 复制远端有而本地没有的技能 |
| MEMORY.md, memory/ | 合并（远端新增的添加） |
| .learnings/ | 追加去重 |
| .env | 本地没有则复制，有则保留本地 |

## 示例

### 完整迁移

```bash
# 从仓库拉取所有配置
openclaw skill run MigrateKit --repo your-username/your-repo
```

### 仅迁移技能

```bash
# 只拉取技能文件
openclaw skill run MigrateKit --repo your-username/your-repo --type skills
```

### 仅迁移配置

```bash
# 只拉取配置文件（AGENTS.md, SOUL.md 等）
openclaw skill run MigrateKit --repo your-username/your-repo --type config
```

### 仅迁移记忆

```bash
# 只拉取记忆文件
openclaw skill run MigrateKit --repo your-username/your-repo --type memory
```

### 预览模式

```bash
# 先看会变更什么文件
openclaw skill run MigrateKit --repo your-username/your-repo --dry-run
```

输出示例：
```
📝 预览将迁移的文件:

   + AGENTS.md
   + SOUL.md
   + IDENTITY.md
   + skills/claw-migrate/SKILL.md
   + memory/2024-01-15-daily-review.md

💡 使用 --dry-run 以外的参数执行实际迁移
```

## 备份与恢复

### 自动备份

迁移前会自动创建备份：

```
.migrate-backup/
└── 2024-01-15T10-30-00-000Z/
    ├── AGENTS.md
    ├── SOUL.md
    ├── MEMORY.md
    ├── memory/
    └── .learnings/
```

### 手动恢复

```bash
# 列出可用备份
ls .migrate-backup/

# 恢复特定文件
cp .migrate-backup/2024-01-15T10-30-00-000Z/AGENTS.md ./AGENTS.md
```

## 故障排除

### 404 Not Found

```
错误：GitHub API 错误 (404): Not Found
```

**原因**：
- 仓库名错误
- 仓库是私有的但没有正确认证
- Token 没有访问权限

**解决**：
1. 检查仓库名是否正确（格式：owner/repo）
2. 确认 Token 有访问私有仓库的权限
3. 如果是组织仓库，确认 Token 有该组织的访问权限

### 401 Unauthorized

```
错误：GitHub API 错误 (401): Bad credentials
```

**原因**：Token 无效或过期

**解决**：
1. 重新生成 GitHub Personal Access Token
2. 确保 Token 有 `repo` 权限

### Rate Limit

```
错误：GitHub API 错误 (403): rate limit exceeded
```

**原因**：API 请求过于频繁

**解决**：
1. 等待一段时间后重试
2. 使用认证的 Token（有更高的限額）

## 安全建议

1. **使用私有仓库**：配置中包含敏感信息，务必使用私有仓库
2. **保护 Token**：不要将 Token 提交到仓库
3. **定期更新 Token**：建议每 90 天更新一次
4. **最小权限原则**：Token 只授予必要的权限

## 版本历史

### v2.0.0
- 改为从 GitHub 仓库拉取配置
- 支持智能合并，不覆盖本地配置
- 支持环境变量和交互式输入 Token
- 简化命令参数

### v1.0.0
- 初始版本，基于 SSH 的同步工具

## License

MIT
