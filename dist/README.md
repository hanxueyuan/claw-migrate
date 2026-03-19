# claw-migrate - OpenClaw 配置备份与恢复

> 🔄 OpenClaw workspace backup & restore tool  
> **你的数据，你做主** - 简单、安全、可控

[![Version](https://img.shields.io/github/package-json/v/hanxueyuan/claw-migrate)](https://github.com/hanxueyuan/claw-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/hanxueyuan/claw-migrate/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/hanxueyuan/claw-migrate/actions)

---

## 📖 简介

claw-migrate 是 OpenClaw 工作空间的备份与恢复工具，支持将配置备份到 GitHub 私人仓库，并从仓库恢复到本地。

**设计初衷**：
- 🔄 OpenClaw 经常挂掉，需要迁移配置
- 💾 定期备份，防止数据丢失
- 🚀 快速恢复，减少停机时间
- 📤 分享配置，方便协作

**核心特点**：
- ✅ **完全自主** - 20+ 备份分类，你自己决定备份什么
- ✅ **智能恢复** - 支持合并、追加、增量同步等多种策略
- ✅ **安全可靠** - 敏感信息二次确认，私人仓库保护
- ✅ **简单易用** - 交互式向导，一键备份/恢复
- ✅ **进度显示** - 实时进度条，耗时统计
- ✅ **分享发现** - 支持分享到 ClawTalent 平台，发现他人配置

---

## 🚀 快速开始

### 1. 安装

```bash
openclaw skill install claw-migrate
```

### 2. 配置

```bash
openclaw skill run claw-migrate setup
```

### 3. 备份

```bash
openclaw skill run claw-migrate backup
```

### 4. 恢复

```bash
openclaw skill run claw-migrate restore
```

### 5. 分享（可选）

```bash
openclaw skill run claw-migrate share
```

### 6. 部署（可选）

```bash
openclaw skill run claw-migrate deploy CT-0001
```

---

## 📦 备份内容

### 核心配置（推荐）
- 🔵 AGENTS.md, SOUL.md, IDENTITY.md 等
- 🟢 skills/ 目录
- 🟣 MEMORY.md
- 🟡 .learnings/

### 可选配置
- ⚪ cron/, docs/, scripts/, templates/, tests/
- ⚪ .github/

### 机器特定（按需）
- ⚠️ openclaw.json, feishu/, telegram/
- ⚠️ discord/, whatsapp/, browser/, agents/*/sessions/

### 敏感信息（谨慎）
- 🔴 .env, credentials/, identity/

---

## 🔐 安全最佳实践

1. **使用私人仓库** - 始终备份到 GitHub 私人仓库
2. **备份前检查** - 技能会显示所有文件，仔细检查
3. **敏感文件** - .env、credentials 等仅备份到可信仓库
4. **Token 存储** - 可使用环境变量或配置文件
5. **谨慎分享** - 只分享你想让他人看到的配置

---

## 🎯 常用命令

| 命令 | 说明 |
|------|------|
| `openclaw skill run claw-migrate backup` | 备份 |
| `openclaw skill run claw-migrate restore` | 恢复 |
| `openclaw skill run claw-migrate share` | 分享 |
| `openclaw skill run claw-migrate deploy CT-XXXX` | 部署 |
| `openclaw skill run claw-migrate search "关键词"` | 搜索 |
| `openclaw skill run claw-migrate config` | 配置管理 |

---

## 📝 使用示例

### 新机器迁移

```bash
# 1. 安装技能
openclaw skill install claw-migrate

# 2. 配置向导
openclaw skill run claw-migrate setup

# 3. 恢复配置
openclaw skill run claw-migrate restore
```

### 仅备份核心配置

```bash
openclaw skill run claw-migrate setup
# 选择备份内容时输入：r（仅推荐）
openclaw skill run claw-migrate backup
```

### 预览备份

```bash
openclaw skill run claw-migrate backup --dry-run
```

---

## 🛠️ 故障排除

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `404 Not Found` | 仓库不存在或无权限 | 检查仓库名称和 Token 权限 |
| `401 Unauthorized` | Token 无效 | 重新生成 Token |
| `Rate limit exceeded` | API 超限 | 等待后重试或使用认证 Token |
| `未找到配置文件` | 未运行 setup | 先运行 `openclaw skill run claw-migrate setup` |

---

## 🌐 相关链接

- **[GitHub 仓库](https://github.com/hanxueyuan/claw-migrate)** - 源代码和 Issues
- **[ClawTalent](https://clawtalent.shop)** - 配置分享平台
- **[ClawHub](https://clawhub.ai/hanxueyuan/claw-migrate)** - ClawHub 页面
- **[OpenClaw 文档](https://github.com/openclaw/openclaw)** - 框架文档

---

## 📄 License

MIT License
