# claw-migrate - OpenClaw Workspace Backup & Restore

> 🔄 OpenClaw workspace backup & restore tool  
> **Your data, your rules**

[![CI/CD](https://github.com/hanxueyuan/claw-migrate/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/hanxueyuan/claw-migrate/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/github/package-json/v/hanxueyuan/claw-migrate)](https://github.com/hanxueyuan/claw-migrate)
[![ClawHub](https://clawhub.ai/api/badge/claw-migrate)](https://clawhub.ai/hanxueyuan/claw-migrate)

---

## 📖 Introduction

ClawMigrate is a backup and restore tool for OpenClaw workspaces. It supports backing up configurations to a GitHub private repository and restoring them to local.

**Core Features**:
- ✅ **Fully Controlled** - 20+ backup categories, you decide what to back up
- ✅ **Smart Restore** - Merge, append, incremental sync strategies
- ✅ **Secure** - Sensitive info confirmation, private repo protection
- ✅ **Easy to Use** - Interactive wizard, one-click backup/restore
- ✅ **Progress Tracking** - Real-time progress bar, duration stats
- ✅ **ClawTalent Integration** - Share and deploy configurations from community

---

## 🚀 Quick Start

### 1. Install

```bash
# Install from ClawHub
clawhub install claw-migrate

# Or install via OpenClaw
openclaw skill install claw-migrate
```

### 2. Setup

```bash
openclaw skill run claw-migrate setup
```

The wizard will guide you through:
1. Enter GitHub repository (format: `owner/repo`)
2. Choose authentication method
3. Select backup categories (20+ options)
4. Confirm configuration

### 3. Backup

```bash
openclaw skill run claw-migrate backup
```

### 4. Restore

```bash
openclaw skill run claw-migrate restore
```

### 5. Share to Community (New!)

```bash
openclaw skill run claw-migrate share
```

### 6. Deploy from Community (New!)

```bash
openclaw skill run claw-migrate deploy CT-0001
```

### 7. Search Community (New!)

```bash
openclaw skill run claw-migrate search "multi-agent"
```

---

## 🔒 Security Best Practices

1. **Use Private Repositories** - Always backup to GitHub private repos
2. **Review Before Upload** - The skill shows all files before uploading
3. **Fine-grained Tokens** - Use tokens with minimal permissions (`repo` scope only)
4. **Token Storage** - Token may be stored in `~/.openclaw/claw-migrate/config.json`
5. **Share Carefully** - Only share configurations you want others to see

---

## 📦 备份内容分类

### 🔵🟢🟣🟡 核心配置（推荐）

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| 🔵 **核心配置** | `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md` | AI 人格和团队定义 |
| 🟢 **技能文件** | `skills/` | 所有自定义技能 |
| 🟣 **记忆数据** | `MEMORY.md`, `memory/` | 长期记忆和记忆索引 |
| 🟡 **学习记录** | `.learnings/` | 错误记录和学习心得 |

### ⚪ 可选配置

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| ⚪ **定时任务** | `cron/` | 定时任务配置 |
| ⚪ **项目文档** | `docs/` | 项目文档 |
| ⚪ **脚本工具** | `scripts/` | 脚本工具 |
| ⚪ **模板文件** | `templates/` | 模板文件 |

### ⚠️ 机器特定配置（按需选择）

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| ⚠️ **OpenClaw 配置** | `openclaw.json` | 机器特定路径，多设备注意 |
| ⚠️ **飞书配置** | `feishu/` | 配对信息，多设备需重新配对 |
| ⚠️ **Telegram 配置** | `telegram/` | 会话信息 |
| ⚠️ **浏览器数据** | `browser/` | 体积较大 |

### 🔴 敏感信息（谨慎选择）

| 分类 | 包含文件 | 说明 |
|------|---------|------|
| 🔴 **环境配置** | `.env` | API Key 等，**仅建议私人仓库** |
| 🔴 **认证信息** | `credentials/` | 认证凭证，**仅建议私人仓库** |
| 🔴 **设备认证** | `identity/` | 设备 token，**仅建议私人仓库** |

---

## 🎯 快捷选择

配置向导提供多种快捷选择：

| 命令 | 说明 | 适用场景 |
|------|------|---------|
| `a` | 全选（包括敏感信息） | 完整备份到私人仓库 |
| `r` | 仅推荐项 | 最小化备份 |
| `s` | 标准配置 | 日常使用 ⭐ |
| `1 2 3` | 手动选择编号 | 自定义需求 |
| 回车 | 跳过 | 暂不配置 |

---

## 📋 详细文档

| 文档 | 说明 |
|------|------|
| [**使用指南**](USAGE.md) | 完整的使用说明，包含所有命令和场景 |
| [技能说明](SKILL.md) | 技能功能和特性说明 |
| [备份清单](docs/BACKUP_CHECKLIST.md) | 详细的备份内容清单和策略 |
| [测试计划](tests/TEST_PLAN.md) | 测试策略和用例设计 |
| [重构计划](REFACTOR_PLAN.md) | 重构进度和计划 |

---

## 🔧 命令参考

### 配置命令

```bash
# 启动配置向导
openclaw skill run claw-migrate setup

# 查看配置
openclaw skill run claw-migrate config

# 修改配置
openclaw skill run claw-migrate config --edit

# 重置配置
openclaw skill run claw-migrate config --reset

# 查看状态
openclaw skill run claw-migrate status
```

### 备份命令

```bash
# 执行备份
openclaw skill run claw-migrate backup

# 预览模式
openclaw skill run claw-migrate backup --dry-run

# 详细输出
openclaw skill run claw-migrate backup --verbose
```

### 恢复命令

```bash
# 执行恢复
openclaw skill run claw-migrate restore

# 预览模式
openclaw skill run claw-migrate restore --dry-run
```

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

### Token 安全

- 推荐使用 `GITHUB_TOKEN` 环境变量
- Token 仅用于 GitHub API 调用，不会被保存
- 建议使用细粒度 Token（repo 权限即可）

### 敏感信息

- 🔴 选择备份敏感信息时会二次确认
- 🔴 仅建议备份到可信私人仓库
- 🔴 定期检查和更新 Token 权限

---

## 🧪 测试

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
# 所有测试
npm test

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 覆盖率测试
npm run test:coverage

# 监听模式
npm run test:watch
```

### 本地验证

```bash
# 运行验证脚本
bash tests/verify.sh
```

---

## 📊 项目状态

| 指标 | 状态 |
|------|------|
| 源文件 | 9 个核心文件 |
| 代码行数 | ~1,800 行 |
| 测试覆盖 | 80+ 单元测试 |
| CI/CD | ✅ GitHub Actions |
| 文档完整度 | ✅ 完整 |

---

## 🚀 开发路线图

- **v2.3.0** - 轻量级重构完成 ✅
- **v2.4.0** - 测试覆盖完善 🟡
- **v3.0.0** - OpenClaw 深度集成（方案二）🔵

---

## 🤝 贡献

欢迎贡献代码、文档或建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🌐 相关资源

- **[ClawTalent.shop](https://clawtalent.shop)** - OpenClaw Agent 市场
- **[ClawHub](https://clawhub.com)** - 技能商店
- **[OpenClaw 文档](https://docs.openclaw.ai)** - 框架文档

---

## 📞 支持

- 📧 问题反馈：https://github.com/hanxueyuan/claw-migrate/issues
- 💬 社区讨论：https://discord.gg/clawtalent

---

**Made with ❤️ for OpenClaw Community**
