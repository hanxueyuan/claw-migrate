---
name: claw-migrate
description: OpenClaw workspace backup & restore instructions - no code, just clear guidance
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":[],"env":[]},"primaryEnv":""}}
---

# claw-migrate - OpenClaw Migration Instructions

> **No code needed** - Just follow these clear instructions for backup and restore

---

## 🎯 What This Skill Does

This skill **guides you** through backing up and restoring your OpenClaw configuration.

**It helps you:**
- 📁 Identify what to backup
- 📂 Know where to restore
- ✏️ Understand what to modify
- 🚫 Avoid breaking machine-specific settings

---

## 📋 What to Backup

### ✅ Always Backup These

| File/Folder | Why | Priority |
|-------------|-----|----------|
| `workspace/AGENTS.md` | Team configuration | 🔴 Critical |
| `workspace/SOUL.md` | AI personality | 🔴 Critical |
| `workspace/TOOLS.md` | Tool notes | 🔴 Critical |
| `workspace/HEARTBEAT.md` | Scheduled tasks | 🔴 Critical |
| `workspace/memory/` | Memory database | 🔴 Critical |
| `workspace/.learnings/` | Learning records | 🟡 Important |
| `workspace/skills/` | Custom skills | 🟡 Important |

### ⚠️ Review Before Backup

| File/Folder | What to Do |
|-------------|------------|
| `workspace/USER.md` | Remove phone numbers and emails |
| `workspace/IDENTITY.md` | Remove real name and contact info |
| `workspace/openclaw.json` | Remove API keys, keep structure |
| `workspace/feishu/` | Remove pairing info, keep app ID |

### ❌ Do NOT Backup

| File/Folder | Why |
|-------------|-----|
| `workspace/.env` | Contains secrets |
| `workspace/credentials/` | Auth tokens |
| `workspace/identity/` | Device tokens |
| `workspace/logs/` | Log files, too large |
| `workspace/browser/` | Browser data, too large |
| `workspace/agents/*/sessions/` | Session history, too large |

---

## 🚀 How to Backup

### Method 1: Simple Copy

```bash
# 1. Create backup folder
mkdir -p ~/openclaw-backup

# 2. Copy critical files
cp /workspace/projects/workspace/AGENTS.md ~/openclaw-backup/
cp /workspace/projects/workspace/SOUL.md ~/openclaw-backup/
cp /workspace/projects/workspace/TOOLS.md ~/openclaw-backup/
cp /workspace/projects/workspace/HEARTBEAT.md ~/openclaw-backup/
cp -r /workspace/projects/workspace/memory/ ~/openclaw-backup/
cp -r /workspace/projects/workspace/.learnings/ ~/openclaw-backup/
cp -r /workspace/projects/workspace/skills/ ~/openclaw-backup/

# 3. Review and sanitize
# Edit USER.md to remove phone/email
# Edit IDENTITY.md to remove real name
# Edit openclaw.json to remove API keys

# 4. Optional: Upload to GitHub
cd ~/openclaw-backup
git init
git add -A
git commit -m "OpenClaw backup $(date +%Y-%m-%d)"
# Push to your private repo
```

### Method 2: GitHub Backup

```bash
# 1. Create private repo on GitHub
# Go to github.com/new
# Name: openclaw-backup
# Set to Private

# 2. Clone and copy
git clone https://github.com/YOUR_USERNAME/openclaw-backup.git /tmp/backup
cp /workspace/projects/workspace/*.md /tmp/backup/
cp -r /workspace/projects/workspace/memory/ /tmp/backup/
cp -r /workspace/projects/workspace/.learnings/ /tmp/backup/
cp -r /workspace/projects/workspace/skills/ /tmp/backup/

# 3. Review before commit
cd /tmp/backup
# Check for sensitive info
grep -r "1[3-9][0-9]{9}" .  # Find phone numbers
grep -r "@" . | grep -v ".md"  # Find emails

# 4. Commit and push
git add -A
git commit -m "Backup $(date +%Y-%m-%d)"
git push origin main
```

---

## 🔄 How to Restore

### On New Machine

```bash
# 1. Install OpenClaw first
# Follow https://github.com/openclaw/openclaw installation guide

# 2. Download backup
git clone https://github.com/YOUR_USERNAME/openclaw-backup.git /tmp/restore

# 3. Copy to workspace
cp /tmp/restore/AGENTS.md /workspace/projects/workspace/
cp /tmp/restore/SOUL.md /workspace/projects/workspace/
cp /tmp/restore/TOOLS.md /workspace/projects/workspace/
cp /tmp/restore/HEARTBEAT.md /workspace/projects/workspace/
cp -r /tmp/restore/memory/ /workspace/projects/workspace/
cp -r /tmp/restore/.learnings/ /workspace/projects/workspace/
cp -r /tmp/restore/skills/ /workspace/projects/workspace/

# 4. Update machine-specific configs
# Edit openclaw.json with new paths if needed
# Re-pair channels (Feishu, Telegram, etc.)

# 5. Restart OpenClaw
openclaw gateway restart
```

### Verify Restoration

```bash
# Check OpenClaw status
openclaw gateway status

# Check skills are installed
openclaw skills list

# Check memory is accessible
openclaw memory search "test"

# Check team configuration
cat /workspace/projects/workspace/AGENTS.md
```

---

## 🔐 What to Modify

### Before Sharing/Backup

| File | Remove/Replace | Keep |
|------|---------------|------|
| `USER.md` | Phone: `${YOUR_PHONE}`<br>Email: `${YOUR_EMAIL}` | Name, timezone, preferences |
| `IDENTITY.md` | Name: `${YOUR_NAME}`<br>Contact: `${YOUR_CONTACT}` | Role, capabilities |
| `openclaw.json` | `"apiKey": "${API_KEY}"` | Structure, model configs |
| `feishu/*.json` | Session tokens, pairing codes | App ID (public) |

### After Restore

| File | What to Update |
|------|---------------|
| `openclaw.json` | Add your API keys back |
| `feishu/` | Re-pair your Feishu account |
| `USER.md` | Add your real phone/email back |
| `IDENTITY.md` | Add your real name back |

---

## 📝 Quick Reference

### Backup Command (One-liner)

```bash
tar -czf openclaw-backup.tar.gz -C /workspace/projects/workspace AGENTS.md SOUL.md TOOLS.md HEARTBEAT.md memory/ .learnings/ skills/
```

### Restore Command (One-liner)

```bash
tar -xzf openclaw-backup.tar.gz -C /workspace/projects/workspace/
```

### Verify Backup

```bash
# List backup contents
tar -tzf openclaw-backup.tar.gz

# Check size
du -sh openclaw-backup.tar.gz
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Backup Everything

**Wrong:**
```bash
cp -r /workspace/projects/workspace/* ~/backup/  # Includes .env, credentials, etc.
```

**Right:**
```bash
# Only copy allowed files (see checklist above)
cp AGENTS.md SOUL.md ~/backup/
```

### ❌ Mistake 2: Forget to Sanitize

**Wrong:**
```bash
# Backup with phone number in USER.md
# Backup with API key in openclaw.json
```

**Right:**
```bash
# Edit before backup
nano USER.md  # Remove phone
nano openclaw.json  # Remove API key
```

### ❌ Mistake 3: Overwrite Machine-Specific Settings

**Wrong:**
```bash
# Copy openclaw.json directly (overwrites paths, tokens)
cp /tmp/restore/openclaw.json /workspace/projects/workspace/
```

**Right:**
```bash
# Review and update paths manually
nano /workspace/projects/workspace/openclaw.json
```

---

## 🆘 Troubleshooting

### "Files missing after restore"

**Check:**
```bash
# List what was backed up
tar -tzf openclaw-backup.tar.gz

# Compare with what should be there
ls -la /workspace/projects/workspace/*.md
```

### "API keys not working"

**Solution:**
```bash
# Set environment variables
export BAILIAN_API_KEY="your-key-here"

# Or edit openclaw.json
nano /workspace/projects/workspace/openclaw.json
```

### "Feishu not connected"

**Solution:**
```bash
# Re-pair Feishu
openclaw channels login --channel feishu
```

---

## 🌐 Resources

- **[GitHub Repo](https://github.com/hanxueyuan/claw-migrate)** - Example backup scripts
- **[OpenClaw Docs](https://github.com/openclaw/openclaw)** - Official documentation
- **[ClawTalent](https://clawtalent.shop)** - Share and discover configs

---

## 📄 License

MIT License
