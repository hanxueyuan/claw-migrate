# claw-migrate - OpenClaw Workspace Backup & Restore

> 🔄 OpenClaw workspace backup & restore tool  
> **Your data, your rules** - Simple, safe, controlled

[![Version](https://img.shields.io/github/package-json/v/hanxueyuan/claw-migrate)](https://github.com/hanxueyuan/claw-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/hanxueyuan/claw-migrate/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/hanxueyuan/claw-migrate/actions)

---

## 📖 Introduction

claw-migrate is a backup and restore tool for OpenClaw workspaces. It supports backing up configurations to a GitHub private repository and restoring them to local.

**Design Goal**:
- 🔄 OpenClaw crashes frequently, need to migrate configurations
- 💾 Regular backups to prevent data loss
- 🚀 Quick recovery to minimize downtime
- 📤 Share configurations for collaboration

**Core Features**:
- ✅ **Fully Controlled** - 20+ backup categories, you decide what to back up
- ✅ **Smart Restore** - Merge, append, incremental sync strategies
- ✅ **Secure** - Sensitive info confirmation, private repo protection
- ✅ **Easy to Use** - Interactive wizard, one-click backup/restore
- ✅ **Progress Tracking** - Real-time progress bar, duration stats
- ✅ **Share & Discover** - Share to ClawTalent platform, discover others' configs

---

## 🚀 Quick Start

### 1. Install

```bash
openclaw skill install claw-migrate
```

### 2. Configure

```bash
openclaw skill run claw-migrate setup
```

### 3. Backup

```bash
openclaw skill run claw-migrate backup
```

### 4. Restore

```bash
openclaw skill run claw-migrate restore
```

### 5. Share (Optional)

```bash
openclaw skill run claw-migrate share
```

### 6. Deploy (Optional)

```bash
openclaw skill run claw-migrate deploy CT-0001
```

---

## 📦 Backup Content

### Core Configuration (Recommended)
- 🔵 AGENTS.md, SOUL.md, IDENTITY.md, etc.
- 🟢 skills/ directory
- 🟣 MEMORY.md
- 🟡 .learnings/

### Optional Configuration
- ⚪ cron/, docs/, scripts/, templates/, tests/
- ⚪ .github/

### Machine-Specific (As Needed)
- ⚠️ openclaw.json, feishu/, telegram/
- ⚠️ discord/, whatsapp/, browser/, agents/*/sessions/

### Sensitive Information (Use Caution)
- 🔴 .env, credentials/, identity/

---

## 🔐 Security Best Practices

1. **Use Private Repositories** - Always backup to GitHub private repos
2. **Review Before Backup** - The skill shows all files before uploading; review carefully
3. **Sensitive Files** - Categories like `.env`, `credentials/`, `identity/` contain secrets; only select if you trust the destination
4. **Token Storage** - GitHub token can be stored in `~/.openclaw/claw-migrate/config.json` for convenience
5. **Share Carefully** - Only share configurations you want others to see

---

## 🎯 Common Commands

| Command | Description |
|---------|-------------|
| `openclaw skill run claw-migrate backup` | Backup |
| `openclaw skill run claw-migrate restore` | Restore |
| `openclaw skill run claw-migrate share` | Share |
| `openclaw skill run claw-migrate deploy CT-XXXX` | Deploy |
| `openclaw skill run claw-migrate search "keyword"` | Search |
| `openclaw skill run claw-migrate config` | Config Management |

---

## 📝 Usage Examples

### New Machine Migration

```bash
# 1. Install the skill
openclaw skill install claw-migrate

# 2. Setup wizard
openclaw skill run claw-migrate setup

# 3. Restore configuration
openclaw skill run claw-migrate restore
```

### Core Config Only

```bash
openclaw skill run claw-migrate setup
# When selecting backup content, enter: r (recommended only)
openclaw skill run claw-migrate backup
```

### Preview Backup

```bash
openclaw skill run claw-migrate backup --dry-run
```

---

## 🛠️ Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `404 Not Found` | Repo doesn't exist or no access | Check repo name and token permissions |
| `401 Unauthorized` | Invalid token | Regenerate token |
| `Rate limit exceeded` | API rate limit hit | Wait and retry, or use an authenticated token |
| `Config not found` | Setup not run | Run `openclaw skill run claw-migrate setup` first |

---

## 🌐 Related Links

- **[GitHub Repository](https://github.com/hanxueyuan/claw-migrate)** - Source code and Issues
- **[ClawTalent](https://clawtalent.shop)** - Configuration sharing platform
- **[ClawHub](https://clawhub.ai/hanxueyuan/claw-migrate)** - ClawHub page
- **[OpenClaw Docs](https://github.com/openclaw/openclaw)** - Framework documentation

---

## 📄 License

MIT License
