# claw-migrate - OpenClaw GitHub 配置迁移工具

从 GitHub 私有仓库拉取 OpenClaw 配置到本地，支持智能合并，保留本地已有配置。

## ⚡ 快速开始

### 1. 安装技能

```bash
openclaw skill install claw-migrate
```

### 2. 使用

```bash
# 设置 GitHub Token（可选，也可以交互式输入）
export GITHUB_TOKEN=ghp_xxx

# 迁移配置
openclaw skill run claw-migrate --repo your-username/your-repo
```

### 3. 完成！

配置已迁移到本地，可以开始使用了。

---

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

---

## 功能特性

- ✅ **零外部依赖** - 仅使用 Node.js 内置模块
- ✅ **智能合并** - 不覆盖本地已有配置
- ✅ **自动备份** - 迁移前自动备份
- ✅ **预览模式** - 先查看会变更什么
- ✅ **交互式输入** - Token 缺失时提示输入
- ✅ **按类型迁移** - 支持 config/skills/memory/learnings

---

## 命令参数

```bash
openclaw skill run claw-migrate --repo <owner>/<repo> [选项]
```

| 参数 | 简写 | 必填 | 说明 |
|------|------|------|------|
| `--repo` | `-r` | ✅ | GitHub 仓库（格式：owner/repo） |
| `--branch` | `-b` | ❌ | 分支名（默认：main） |
| `--path` | `-p` | ❌ | 仓库内的路径（默认：根目录） |
| `--type` | `-t` | ❌ | 迁移类型：`all`（默认）`config` `memory` `learnings` `skills` |
| `--dry-run` | | ❌ | 预览模式，不实际写入文件 |
| `--no-backup` | | ❌ | 不创建备份（默认创建） |
| `--verbose` | `-v` | ❌ | 详细输出 |

---

## 使用示例

### 基本用法

```bash
# 从 GitHub 仓库拉取配置
openclaw skill run claw-migrate --repo your-username/your-repo

# 指定分支和路径
openclaw skill run claw-migrate \
  --repo your-username/your-repo \
  --branch main \
  --path workspace/projects/workspace

# 预览模式（先看会变更什么）
openclaw skill run claw-migrate \
  --repo your-username/your-repo \
  --dry-run
```

### 仅拉取特定类型

```bash
# 仅配置文件
openclaw skill run claw-migrate --repo your-username/your-repo --type config

# 仅记忆文件
openclaw skill run claw-migrate --repo your-username/your-repo --type memory

# 仅技能
openclaw skill run claw-migrate --repo your-username/your-repo --type skills

# 仅学习记录
openclaw skill run claw-migrate --repo your-username/your-repo --type learnings
```

---

## 文件迁移策略

| 文件类型 | 策略 |
|---------|------|
| AGENTS.md, SOUL.md, IDENTITY.md, USER.md | 本地没有则复制，有则跳过 |
| TOOLS.md, HEARTBEAT.md | 本地没有则复制，有则跳过 |
| skills/ | 复制远端有而本地没有的技能 |
| MEMORY.md, memory/ | 合并（远端新增的添加） |
| .learnings/ | 追加去重 |
| .env | 本地没有则复制，有则保留本地 |

---

## 认证方式

### 1. 环境变量（推荐）

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
openclaw skill run claw-migrate --repo your-username/your-repo
```

### 2. gh CLI（如果已安装）

```bash
gh auth token | openclaw skill run claw-migrate --repo your-username/your-repo
```

### 3. 交互式输入

如果没有检测到 Token，工具会提示用户输入。

---

## 备份与恢复

### 备份位置

迁移前自动创建备份：
```
.migrate-backup/
└── 2024-01-15T10-30-00-000Z/
    ├── AGENTS.md
    ├── SOUL.md
    ├── MEMORY.md
    ├── memory/
    └── .learnings/
```

### 恢复备份

```bash
# 列出可用备份
ls .migrate-backup/

# 恢复特定文件
cp .migrate-backup/2024-01-15T10-30-00-000Z/AGENTS.md ./AGENTS.md
```

---

## 故障排除

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 404 Not Found | 仓库名错误或无权限 | 检查仓库名，确认 Token 权限 |
| 401 Unauthorized | Token 无效 | 重新生成 Token |
| Rate limit exceeded | API 请求超限 | 等待后重试或使用认证的 Token |

---

## 技术规格

- **安装大小**: ~50KB
- **依赖**: 无（纯 Node.js 内置模块）
- **Node.js 版本**: >= 14.0.0
- **许可证**: MIT

---

## 相关链接

- **GitHub 仓库**: https://github.com/hanxueyuan/claw-migrate
- **问题反馈**: https://github.com/hanxueyuan/claw-migrate/issues
- **OpenClaw 文档**: https://docs.openclaw.ai

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
