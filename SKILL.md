---
name: claw-migrate
description: OpenClaw workspace backup, restore, share, and discover instructions
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":[],"env":[]},"primaryEnv":""}}
---

# claw-migrate - OpenClaw Migration & Sharing Guide

> **Four paths**: Backup · Restore · Share to ClawTalent · Discover from ClawTalent

---

## 🎯 Choose Your Path

| Path | When to Use | What You Need |
|------|-------------|---------------|
| **📁 Backup** | Save your config locally or to GitHub | GitHub account (optional) |
| **🔄 Restore** | Recover config on new machine | Backup files or GitHub repo |
| **📤 Share** | Upload to ClawTalent platform | ClawTalent account + token |
| **🔍 Discover** | Find and deploy others' configs | ClawTalent account |

---

## Path 1: 📁 Backup

### What to Backup

| Priority | Files/Folders | Why |
|----------|---------------|-----|
| 🔴 **Critical** | `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `HEARTBEAT.md` | Team & AI config |
| 🔴 **Critical** | `memory/` | Memory database |
| 🟡 **Important** | `.learnings/`, `skills/` | Learnings & custom skills |
| ⚪ **Optional** | `docs/`, `scripts/`, `templates/` | Project files |

### What NOT to Backup

| Files | Why |
|-------|-----|
| `.env` | Contains API secrets |
| `credentials/` | Auth tokens |
| `identity/` | Device tokens |
| `feishu/*.json` | Session info |
| `logs/`, `browser/` | Too large |

### How to Backup

#### Option A: Local Backup

```bash
# 1. Create backup folder
mkdir -p ~/openclaw-backup-$(date +%Y-%m-%d)

# 2. Copy critical files
cp /workspace/projects/workspace/AGENTS.md ~/openclaw-backup/
cp /workspace/projects/workspace/SOUL.md ~/openclaw-backup/
cp -r /workspace/projects/workspace/memory/ ~/openclaw-backup/
cp -r /workspace/projects/workspace/.learnings/ ~/openclaw-backup/
cp -r /workspace/projects/workspace/skills/ ~/openclaw-backup/

# 3. Compress (optional)
tar -czf openclaw-backup.tar.gz -C ~/openclaw-backup/ .
```

#### Option B: GitHub Backup

```bash
# 1. Create private repo on GitHub
# Go to github.com/new
# Name: openclaw-backup
# Set to: Private ✓

# 2. Clone and copy
git clone https://github.com/YOUR_USERNAME/openclaw-backup.git /tmp/backup
cp /workspace/projects/workspace/*.md /tmp/backup/
cp -r /workspace/projects/workspace/memory/ /tmp/backup/
cp -r /workspace/projects/workspace/.learnings/ /tmp/backup/
cp -r /workspace/projects/workspace/skills/ /tmp/backup/

# 3. Review before commit (remove sensitive info)
cd /tmp/backup
# Edit USER.md - remove phone/email
# Edit IDENTITY.md - remove real name
# Edit openclaw.json - remove API keys

# 4. Commit and push
git add -A
git commit -m "Backup $(date +%Y-%m-%d)"
git push origin main
```

---

## Path 2: 🔄 Restore

### Where to Restore From

| Source | When to Use |
|--------|-------------|
| **Local backup** | Quick restore on same machine |
| **GitHub repo** | Restore on new machine |
| **ClawTalent** | Deploy shared configurations |

### Where to Restore To

```
Target: /workspace/projects/workspace/
```

### How to Restore

#### From Local Backup

```bash
# 1. Extract backup
tar -xzf openclaw-backup.tar.gz -C /workspace/projects/workspace/

# Or copy manually
cp ~/openclaw-backup/*.md /workspace/projects/workspace/
cp -r ~/openclaw-backup/memory/ /workspace/projects/workspace/
cp -r ~/openclaw-backup/.learnings/ /workspace/projects/workspace/
cp -r ~/openclaw-backup/skills/ /workspace/projects/workspace/

# 2. Update machine-specific configs
# Edit openclaw.json with new paths if needed

# 3. Restart OpenClaw
openclaw gateway restart
```

#### From GitHub

```bash
# 1. Clone backup repo
git clone https://github.com/YOUR_USERNAME/openclaw-backup.git /tmp/restore

# 2. Copy to workspace
cp /tmp/restore/*.md /workspace/projects/workspace/
cp -r /tmp/restore/memory/ /workspace/projects/workspace/
cp -r /tmp/restore/.learnings/ /workspace/projects/workspace/
cp -r /tmp/restore/skills/ /workspace/projects/workspace/

# 3. Re-pair channels
openclaw channels login --channel feishu

# 4. Restart
openclaw gateway restart
```

#### Verify Restoration

```bash
# Check status
openclaw gateway status

# Check skills
openclaw skills list

# Check memory
openclaw memory search "test"
```

---

## Path 3: 📤 Share to ClawTalent

### What You Need

| Requirement | How to Get |
|-------------|------------|
| **ClawTalent Account** | Sign up at https://clawtalent.shop |
| **API Token** | Dashboard → Settings → Generate Token |
| **Clean Config** | Remove sensitive info first |

### What to Share

| ✅ Share | ❌ Don't Share |
|----------|---------------|
| `AGENTS.md` | `.env` |
| `SOUL.md` | `credentials/` |
| `TOOLS.md` | `identity/` |
| `skills/` (your custom skills) | `feishu/*.json` |
| `HEARTBEAT.md` | `logs/` |

### What to Sanitize First

| File | Remove/Replace |
|------|---------------|
| `USER.md` | Phone → `${YOUR_PHONE}`<br>Email → `${YOUR_EMAIL}` |
| `IDENTITY.md` | Name → `${YOUR_NAME}` |
| `openclaw.json` | API keys → `${API_KEY}` |

### How to Share

#### Option A: Via ClawTalent Website (Manual)

```bash
# 1. Prepare share package
mkdir /tmp/share-package
cp AGENTS.md SOUL.md TOOLS.md HEARTBEAT.md /tmp/share-package/
cp -r skills/ /tmp/share-package/
cp -r memory/ /tmp/share-package/

# 2. Sanitize
# Edit files to remove sensitive info

# 3. Compress
cd /tmp/share-package
tar -czf share-package.tar.gz .

# 4. Upload via website
# Go to https://clawtalent.shop/share
# Upload share-package.tar.gz
# Fill in: name, description, tags
# Submit
```

#### Option B: Via API (Automated)

```bash
# 1. Get your ClawTalent token
# Dashboard → Settings → Generate Token
CLAWTALENT_TOKEN="your-token-here"

# 2. Prepare package (same as above)
mkdir /tmp/share-package
# ... copy and sanitize files ...
tar -czf share-package.tar.gz -C /tmp/share-package .

# 3. Upload via API
curl -X POST https://clawtalent.shop/api/configurations \
  -H "Authorization: Bearer $CLAWTALENT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@share-package.tar.gz" \
  -F "name=My OpenClaw Config" \
  -F "description=My custom OpenClaw configuration" \
  -F "tags=multi-agent,backup"

# 4. Get back configuration ID
# Response: {"id": "CT-0001", "url": "https://clawtalent.shop/c/CT-0001"}
```

### After Sharing

- You'll receive a **Configuration ID** (e.g., `CT-0001`)
- Share this ID with others
- They can deploy using: `openclaw skill run claw-migrate deploy CT-0001`

---

## Path 4: 🔍 Discover on ClawTalent

### What You Can Find

| Type | Examples |
|------|----------|
| **Agent Configs** | Multi-agent teams, specialized agents |
| **Skills** | Custom skills for specific tasks |
| **Templates** | Pre-configured setups |

### How to Search

#### Via Website

```
1. Go to https://clawtalent.shop
2. Use search bar or browse categories
3. Filter by tags: multi-agent, finance, tech, etc.
4. Click on configuration to view details
5. Click "Deploy" to get Configuration ID
```

#### Via API

```bash
# Search by keyword
curl "https://clawtalent.shop/api/search?q=multi-agent"

# Search by tags
curl "https://clawtalent.shop/api/search?tags=finance,stock"

# Get configuration details
curl "https://clawtalent.shop/api/configurations/CT-0001"
```

### How to Deploy

#### Get Configuration

```bash
# Method 1: Download from website
# Go to configuration page → Click "Download"
# Extract to /tmp/deploy/

# Method 2: Via API
curl -o config.tar.gz "https://clawtalent.shop/api/configurations/CT-0001/download"
tar -xzf config.tar.gz -C /tmp/deploy/
```

#### Deploy to Workspace

```bash
# 1. Review contents first
ls -la /tmp/deploy/
cat /tmp/deploy/README.md  # If available

# 2. Copy to workspace
cp /tmp/deploy/*.md /workspace/projects/workspace/
cp -r /tmp/deploy/memory/ /workspace/projects/workspace/
cp -r /tmp/deploy/skills/ /workspace/projects/workspace/

# 3. Update your settings
# Edit openclaw.json with your API keys
# Re-pair your channels

# 4. Restart
openclaw gateway restart
```

---

## 🔐 Security Best Practices

### Before Sharing

- ✅ Remove all phone numbers and emails
- ✅ Remove API keys and tokens
- ✅ Remove device/session info
- ✅ Use private repos for personal backups

### Token Handling

| Token Type | How to Store |
|------------|--------------|
| **GitHub Token** | Environment variable: `export GITHUB_TOKEN=xxx` |
| **ClawTalent Token** | Use only for upload, don't share |
| **API Keys** | Never include in shared configs |

### Sensitive Files Checklist

Before any backup/share, verify these are **NOT** included:

```
❌ .env
❌ credentials/
❌ identity/
❌ feishu/*.json (except app ID)
❌ telegram/*.json
❌ Any file with "token", "secret", "key" in content
```

---

## 🆘 Quick Reference

### Backup One-liner

```bash
tar -czf backup.tar.gz -C /workspace/projects/workspace AGENTS.md SOUL.md memory/ .learnings/ skills/
```

### Restore One-liner

```bash
tar -xzf backup.tar.gz -C /workspace/projects/workspace/
```

### Share Package

```bash
# Prepare, sanitize, then:
tar -czf share.tar.gz -C /tmp/share-package .
curl -X POST https://clawtalent.shop/api/configurations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@share.tar.gz" -F "name=My Config"
```

### Discover & Deploy

```bash
# Search
curl "https://clawtalent.shop/api/search?q=multi-agent"

# Deploy
curl -o config.tar.gz "https://clawtalent.shop/api/configurations/CT-0001/download"
tar -xzf config.tar.gz -C /workspace/projects/workspace/
```

---

## 🌐 Resources

- **[ClawTalent](https://clawtalent.shop)** - Share and discover configs
- **[GitHub Repo](https://github.com/hanxueyuan/claw-migrate)** - Examples and scripts
- **[OpenClaw Docs](https://github.com/openclaw/openclaw)** - Official documentation

---

## 📄 License

MIT License
