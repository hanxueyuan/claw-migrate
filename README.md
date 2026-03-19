# claw-migrate - OpenClaw Migration Instructions

> 🔄 **No code needed** - Just clear instructions for backup and restore

[![Version](https://img.shields.io/github/package-json/v/hanxueyuan/claw-migrate)](https://github.com/hanxueyuan/claw-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 What Is This?

claw-migrate is **not a software tool**. It's a **set of clear instructions** for backing up and restoring your OpenClaw configuration.

**Think of it as:**
- 📋 A checklist of what to backup
- 🗺️ A map of where files go
- 📝 A guide of what to modify

**No installation needed. No commands to run. Just follow the instructions.**

---

## 🎯 Quick Guide

### What to Backup

```
✅ AGENTS.md, SOUL.md, TOOLS.md, HEARTBEAT.md
✅ memory/, .learnings/, skills/
⚠️ USER.md (remove phone/email first)
⚠️ openclaw.json (remove API keys first)
❌ .env, credentials/, identity/ (never backup)
```

### How to Backup

```bash
# Simple copy
mkdir ~/openclaw-backup
cp /workspace/projects/workspace/*.md ~/openclaw-backup/
cp -r /workspace/projects/workspace/memory/ ~/openclaw-backup/
```

### How to Restore

```bash
# Copy back
cp ~/openclaw-backup/*.md /workspace/projects/workspace/
cp -r ~/openclaw-backup/memory/ /workspace/projects/workspace/

# Restart
openclaw gateway restart
```

---

## 📋 Full Instructions

See **[SKILL.md](SKILL.md)** for complete instructions including:
- Detailed backup checklist
- Step-by-step migration guide
- What to sanitize before sharing
- Common mistakes to avoid
- Troubleshooting tips

---

## 🔐 Security Tips

1. **Use private repos** - Never backup to public GitHub repos
2. **Remove sensitive info** - Phone numbers, emails, API keys
3. **Review before commit** - Always check what you're uploading
4. **Re-pair after restore** - Channels need re-authentication

---

## 🌐 Links

- **[Full Instructions](SKILL.md)** - Complete guide
- **[GitHub](https://github.com/hanxueyuan/claw-migrate)** - Source
- **[ClawTalent](https://clawtalent.shop)** - Share configs

---

## 📄 License

MIT License
