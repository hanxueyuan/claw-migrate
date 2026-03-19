# claw-migrate - OpenClaw Migration & Sharing Guide

> 🔄 **Four paths**: Backup · Restore · Share · Discover

[![Version](https://img.shields.io/github/package-json/v/hanxueyuan/claw-migrate)](https://github.com/hanxueyuan/claw-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What Is This?

claw-migrate provides **clear instructions** for four migration paths:

| Path | What It Does |
|------|-------------|
| **📁 Backup** | Save your config locally or to GitHub |
| **🔄 Restore** | Recover config on new machine |
| **📤 Share** | Upload to ClawTalent platform |
| **🔍 Discover** | Find and deploy others' configs |

**No installation needed. Just follow the instructions.**

---

## 🚀 Quick Start

### I Want to Backup

```bash
# See: SKILL.md → Path 1: Backup
# Quick command:
tar -czf backup.tar.gz -C /workspace/projects/workspace AGENTS.md SOUL.md memory/ .learnings/ skills/
```

### I Want to Restore

```bash
# See: SKILL.md → Path 2: Restore
# Quick command:
tar -xzf backup.tar.gz -C /workspace/projects/workspace/
```

### I Want to Share to ClawTalent

```bash
# See: SKILL.md → Path 3: Share
# You need: ClawTalent account + API token
# Steps: Prepare → Sanitize → Upload → Get ID
```

### I Want to Discover Configs

```bash
# See: SKILL.md → Path 4: Discover
# Browse: https://clawtalent.shop
# Or use API: curl "https://clawtalent.shop/api/search?q=multi-agent"
```

---

## 📋 Full Instructions

See **[SKILL.md](SKILL.md)** for complete guides including:
- Detailed backup/restore checklists
- ClawTalent upload instructions (manual + API)
- Discovery and deployment steps
- Security best practices
- Quick reference commands

---

## 🔐 Security Tips

1. **Never share** `.env`, `credentials/`, `identity/`
2. **Always sanitize** phone numbers, emails, API keys
3. **Use private repos** for personal backups
4. **Re-pair channels** after restore

---

## 🌐 Links

- **[Full Instructions](SKILL.md)** - All four paths detailed
- **[ClawTalent](https://clawtalent.shop)** - Share & discover configs
- **[GitHub](https://github.com/hanxueyuan/claw-migrate)** - Source & examples

---

## 📄 License

MIT License
