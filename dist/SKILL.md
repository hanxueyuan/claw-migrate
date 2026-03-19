---
name: claw-migrate
description: OpenClaw workspace backup & restore tool · One-click backup to GitHub · You stay in control
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["node","git"],"env":["GITHUB_TOKEN"]},"primaryEnv":"GITHUB_TOKEN"}}
---

# claw-migrate - OpenClaw 配置备份与恢复

> **你的数据，你做主** - 简单、安全、可控的备份恢复工具

---

## 🎯 这个工具能做什么？

**使用场景**：
- 🔄 OpenClaw 经常挂掉，需要迁移配置
- 💾 定期备份，防止数据丢失
- 🚀 快速恢复，减少停机时间
- 📤 分享你的配置给其他人
- 📥 发现和使用别人分享的配置

**核心功能**：
| 功能 | 说明 | 命令 |
|------|------|------|
| **🔵 备份** | 备份配置到 GitHub 私人仓库 | `openclaw skill run claw-migrate backup` |
| **🟢 恢复** | 从 GitHub 恢复到本地 | `openclaw skill run claw-migrate restore` |
| **🟣 分享** | 分享到 ClawTalent 平台 | `openclaw skill run claw-migrate share` |
| **🟠 部署** | 从 ClawTalent 部署配置 | `openclaw skill run claw-migrate deploy CT-1001` |
| **🔍 搜索** | 搜索 ClawTalent 上的配置 | `openclaw skill run claw-migrate search "multi-agent"` |
| **📋 配置** | 管理备份设置 | `openclaw skill run claw-migrate config` |

---

## 🚀 快速开始

### 1. 安装技能

```bash
openclaw skill install claw-migrate
```

### 2. 配置向导

```bash
openclaw skill run claw-migrate setup
```

向导会引导你完成：
1. 输入 GitHub 仓库（格式：`owner/repo`）
2. 选择认证方式（环境变量或手动输入 Token）
3. **选择要备份的内容**（20+ 分类，完全由你决定）
4. 确认配置

### 3. 备份

```bash
openclaw skill run claw-migrate backup
```

### 4. 恢复（新机器）

```bash
# 在新机器上安装技能后
openclaw skill run claw-migrate setup
# 选择"恢复配置"，输入仓库信息
openclaw skill run claw-migrate restore
```

---

## 📦 备份内容分类

### 🔵🟢🟣🟡 核心配置（推荐备份）

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| 🔵 **核心配置** | `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md` | AI 人格和团队定义 |
| 🟢 **技能文件** | `skills/` | 所有自定义技能 |
| 🟣 **记忆数据** | `MEMORY.md`, `memory/` | 长期记忆和记忆索引 |
| 🟡 **学习记录** | `.learnings/` | 错误记录和学习心得 |

### ⚪ 可选配置

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| ⚪ **定时任务** | `cron/` | 定时任务配置 |
| ⚪ **项目文档** | `docs/` | 项目文档和说明 |
| ⚪ **脚本工具** | `scripts/` | 脚本工具 |
| ⚪ **模板文件** | `templates/` | 模板文件 |
| ⚪ **测试文件** | `tests/` | 测试用例和脚本 |
| ⚪ **GitHub 配置** | `.github/` | GitHub 相关配置 |

### ⚠️ 机器特定配置（按需选择）

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| ⚠️ **OpenClaw 配置** | `openclaw.json` | 包含机器特定路径，多设备同步时可能需要修改 |
| ⚠️ **飞书配置** | `feishu/` | 包含配对信息，多设备同步时可能需要重新配对 |
| ⚠️ **Telegram 配置** | `telegram/` | 包含会话信息 |
| ⚠️ **其他 Channel** | `discord/`, `whatsapp/`, `signal/` | 其他 Channel 配置 |
| ⚠️ **浏览器数据** | `browser/` | 浏览器用户数据，体积较大 |
| ⚠️ **会话历史** | `agents/*/sessions/` | 会话记录，体积较大 |
| ⚠️ **日志文件** | `logs/` | 日志文件，体积较大 |

### 🔴 敏感信息（谨慎选择）

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| 🔴 **环境配置** | `.env`, `.env.*` | API Key、Token 等，**仅建议备份到私人仓库** |
| 🔴 **认证信息** | `credentials/` | 认证凭证，**仅建议备份到私人仓库** |
| 🔴 **设备认证** | `identity/` | 设备 token，**仅建议备份到私人仓库** |

---

## 🎯 快速选择方式

配置向导提供多种快捷选择：

| 命令 | 说明 |
|------|------|
| `a` | **全选**（包括敏感信息） |
| `r` | **仅推荐**（核心配置） |
| `s` | **标准**（推荐 + 可选，不含敏感） |
| `1 2 3 5` | **手动选择**（输入编号） |
| 回车 | **跳过**（不备份） |

---

## 🔄 恢复策略

| 文件类型 | 策略 | 说明 |
|---------|------|------|
| 核心配置 | **智能合并** | 保留本地自定义，合并远端更新 |
| 技能文件 | **增量同步** | 只添加远端有、本地没有的技能 |
| MEMORY.md | **合并** | 保留本地记忆，追加远端新记忆 |
| .learnings/ | **追加去重** | 追加远端新记录，自动去重 |
| 其他文件 | **覆盖** | 使用远端版本 |

---

## 🔐 安全说明

### 私人仓库推荐

**强烈建议使用 GitHub Private Repository**

```bash
# 创建私人仓库
gh repo create openclaw-backup --private
```

### 敏感信息保护

- 🔴 选择备份敏感信息时，系统会二次确认
- 🔴 仅建议备份到可信私人仓库
- 🔴 定期检查和更新 Token 权限

### Token 处理与存储

**Token 可以三种方式存储：**

1. **环境变量**（推荐）- 在 shell 中设置 `GITHUB_TOKEN`
   - 最安全，不持久化
   - `export GITHUB_TOKEN=ghp_xxx`

2. **配置文件**（方便）- Token 可能存储在 `~/.openclaw/claw-migrate/config.json`
   - 方便重复使用
   - 使用细粒度 Token，最小权限

3. **GitHub CLI**（备选）- 如果没有配置 Token，技能会尝试 `gh auth token`
   - 使用已有的 GitHub CLI 认证
   - 无需额外存储 Token

**最佳实践：**
- 使用细粒度个人访问 Token，只需 `repo` 权限
- 定期轮换 Token
- 不要将 Token 提交到公开仓库
- 在共享机器上，优先使用环境变量而非配置文件

---

## ⚙️ 配置管理

```bash
# 启动配置向导
openclaw skill run claw-migrate setup

# 查看当前配置
openclaw skill run claw-migrate config

# 修改配置
openclaw skill run claw-migrate config --edit

# 重置配置
openclaw skill run claw-migrate config --reset

# 查看状态
openclaw skill run claw-migrate status
```

**配置文件位置**：`~/.openclaw/claw-migrate/config.json`

---

## 📝 使用示例

### 场景 1：新机器迁移配置

```bash
# 1. 安装技能
openclaw skill install claw-migrate

# 2. 配置向导（输入原仓库信息）
openclaw skill run claw-migrate setup

# 3. 恢复配置
openclaw skill run claw-migrate restore
```

### 场景 2：仅备份核心配置

```bash
# 1. 启动配置向导
openclaw skill run claw-migrate setup

# 2. 选择备份内容时输入：r（仅推荐）
# 3. 执行备份
openclaw skill run claw-migrate backup
```

### 场景 3：完整备份（包括敏感信息）

```bash
# 1. 启动配置向导
openclaw skill run claw-migrate setup

# 2. 选择备份内容时输入：a（全选）
# 3. 确认备份敏感信息
# 4. 执行备份
openclaw skill run claw-migrate backup
```

### 场景 4：预览备份

```bash
# 预览将备份的文件（不实际上传）
openclaw skill run claw-migrate backup --dry-run
```

### 场景 5：分享到 ClawTalent

```bash
# 分享配置到 ClawTalent 平台
openclaw skill run claw-migrate share

# 预览模式
openclaw skill run claw-migrate share --dry-run
```

### 场景 6：从 ClawTalent 部署

```bash
# 通过 ID 部署配置
openclaw skill run claw-migrate deploy CT-1001

# 自动确认部署
openclaw skill run claw-migrate deploy CT-1001 --yes

# 通过 URL 部署
openclaw skill run claw-migrate deploy https://clawtalent.shop/config/CT-1001
```

### 场景 7：搜索 ClawTalent

```bash
# 按关键词搜索
openclaw skill run claw-migrate search "multi-agent"

# 按标签筛选
openclaw skill run claw-migrate search "home" --tags automation,iot

# 限制结果数量
openclaw skill run claw-migrate search "finance" --limit 10
```

---

## 🛠️ 故障排除

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `404 Not Found` | 仓库不存在或无权限 | 检查仓库名称，确认 Token 权限 |
| `401 Unauthorized` | Token 无效 | 重新生成 Token |
| `Rate limit exceeded` | API 请求超限 | 等待后重试，或使用认证 Token |
| `未找到配置文件` | 未运行 setup | 先运行 `openclaw skill run claw-migrate setup` |

---

## 🌐 生态系统

- **[ClawTalent.shop](https://clawtalent.shop)** - OpenClaw Agent 市场
- **[ClawHub](https://clawhub.com)** - 技能商店
- **[OpenClaw](https://github.com/openclaw/openclaw)** - 框架文档

---

## 📄 License

MIT License
