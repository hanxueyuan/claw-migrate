---
name: claw-migrate
description: OpenClaw 配置迁移工具。当用户提到从 GitHub 拉取配置、迁移 OpenClaw 配置、同步配置、恢复配置、克隆配置到新机器时使用。支持从 GitHub 私有仓库拉取团队配置、技能、记忆等，智能合并不覆盖本地配置。
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["node"],"env":["GITHUB_TOKEN"]},"primaryEnv":"GITHUB_TOKEN"}}
---

# claw-migrate - OpenClaw 配置迁移工具

## 功能

从 GitHub 私有仓库拉取 OpenClaw 配置到本地，支持智能合并，保留本地已有配置。

## 使用方式

通过 `feishu_doc` 工具读取和写入配置文件，通过 GitHub API 获取远端配置。

### 基本流程

1. **获取用户输入**：
   - GitHub 仓库名（格式：owner/repo）
   - 分支名（可选，默认 main）
   - 仓库内路径（可选，默认根目录）
   - 迁移类型（可选：all/config/skills/memory/learnings）

2. **认证**：
   - 优先使用 `GITHUB_TOKEN` 环境变量
   - 或使用 gh CLI：`gh auth token`
   - 或提示用户输入

3. **拉取配置**：
   - 使用 GitHub API 获取文件列表
   - 智能合并（本地没有则添加，有则保留本地）
   - 自动备份现有配置

4. **输出结果**：
   - 显示迁移的文件列表
   - 提示重建记忆索引（如需要）

## 文件迁移策略

### 配置分类

| 配置类型 | 文件示例 | 迁移策略 |
|---------|---------|---------|
| **通用配置** | AGENTS.md, SOUL.md, USER.md | 智能合并 |
| **技能** | skills/**/SKILL.md | 增量同步（仅添加缺失） |
| **记忆/学习** | MEMORY.md, .learnings/*.md | 合并/追加 |
| **Channel 配置** | feishu/*.json | 保留本地（机器特定） |
| **Pairing 信息** | feishu/pairing/*.json | ❌ 不迁移（机器特定） |
| **敏感信息** | .env, sessions/*.jsonl | ❌ 不迁移 |

### 详细说明

| 文件类型 | 策略 | 说明 |
|---------|------|------|
| AGENTS.md, SOUL.md, IDENTITY.md, USER.md | 智能合并 | 保留本地定制 |
| TOOLS.md, HEARTBEAT.md | 智能合并 | 保留本地定制 |
| skills/ | 增量同步 | 仅添加远端有而本地没有的技能 |
| MEMORY.md, memory/ | 合并 | 保留本地，追加远端新增 |
| .learnings/ | 追加去重 | 追加远端新增 |
| .env | ❌ 不迁移 | 保留本地（API keys 等） |
| **feishu/dedup/*.json** | ❌ 不迁移 | 消息去重 ID（机器特定） |
| **feishu/pairing/*.json** | ❌ 不迁移 | Pairing 信息（机器特定） |
| openclaw.json | 字段级合并 | 保留 browser.executablePath 等机器特定字段 |

## 命令参数

```bash
openclaw skill run claw-migrate --repo <owner>/<repo> [选项]
```

### 选项

| 参数 | 简写 | 必填 | 说明 |
|------|------|------|------|
| `--repo` | `-r` | ✅ | GitHub 仓库（格式：owner/repo） |
| `--branch` | `-b` | ❌ | 分支名（默认：main） |
| `--path` | `-p` | ❌ | 仓库内的路径（默认：根目录） |
| `--type` | `-t` | ❌ | 迁移类型：`all`（默认）`config` `memory` `learnings` `skills` |
| `--dry-run` | | ❌ | 预览模式，不实际写入文件 |
| `--no-backup` | | ❌ | 不创建备份（默认创建） |
| `--verbose` | `-v` | ❌ | 详细输出 |

## 使用示例

### 从 GitHub 仓库拉取配置

```bash
# 基本用法
openclaw skill run claw-migrate --repo hanxueyuan/lisa

# 指定分支和路径
openclaw skill run claw-migrate \
  --repo hanxueyuan/lisa \
  --branch main \
  --path workspace/projects/workspace

# 仅拉取技能
openclaw skill run claw-migrate \
  --repo hanxueyuan/lisa \
  --type skills

# 预览模式
openclaw skill run claw-migrate \
  --repo hanxueyuan/lisa \
  --dry-run
```

## 注意事项

1. **GitHub Token**：访问私有仓库需要 Token
2. **备份**：迁移前自动创建备份到 `.migrate-backup/<timestamp>/`
3. **记忆索引**：迁移后可能需要运行 `openclaw memory rebuild`
4. **敏感信息**：.env 文件本地已有则保留

## 故障排除

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 404 Not Found | 仓库名错误或无权限 | 检查仓库名，确认 Token 权限 |
| 401 Unauthorized | Token 无效 | 重新生成 Token |
| Rate limit exceeded | API 请求超限 | 等待后重试或使用认证的 Token |

## 相关文件

- `src/index.js` - 主入口
- `src/github.js` - GitHub API 访问
- `src/merger.js` - 合并引擎
- `src/writer.js` - 文件写入和备份

## 许可证

MIT License
