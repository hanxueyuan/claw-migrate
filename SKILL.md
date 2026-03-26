---
name: claw-migrate
description: OpenClaw backup, restore & sharing - complete guide with sanitization
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["tar"]}}}
---

# claw-migrate - OpenClaw Backup, Restore & Sharing Guide

> **Simple & Safe**: No code, no automation, just clear instructions  
> **Updated**: 2026-03-21 - Added sharing flow with sanitization

---

## 🎯 What Is This?

claw-migrate is a **pure guidance skill** - no installation needed, no code to run.

Just follow the instructions below to:
- 🗄️ **Backup** your OpenClaw workspace (complete backup with all data)
- 🔄 **Restore** from backup (disaster recovery)
- 📤 **Share** to ClawTalent platform (sanitized, privacy-protected)

---

## 📊 Quick Decision Guide

| Goal | Use | Contains |
|------|-----|----------|
| **Disaster Recovery** | 🗄️ Backup | Everything (including secrets, encrypted) |
| **New Machine Setup** | 🔄 Restore | Full environment from backup |
| **Share to Community** | 📤 Share | Sanitized config (no secrets, privacy-protected) |

**Important**: Backup and Sharing are **completely different** flows!
- 🗄️ **Backup** = Private, complete, encrypted
- 📤 **Share** = Public, sanitized, platform-reviewed

---

## 🗄️ Path 1: Backup (Private, Complete)

**Purpose**: Disaster recovery, cross-device migration, personal archive

### Quick Backup (Recommended)

```bash
# Complete backup (includes ALL files)
tar -czf backup-$(date +%Y%m%d_%H%M%S).ctpkg \
  -C /workspace/projects/workspace \
  .
```

### What's Included ✅

| Category | Files | Included |
|----------|-------|----------|
| **Everything** | All files | ✅ Yes (complete backup) |
| Secrets | `.env`, `openclaw.json` | ✅ Yes (encrypt before storing!) |
| Memory | `memory/` | ✅ Yes |
| Learnings | `.learnings/` | ✅ Yes |
| Skills | `skills/` | ✅ Yes |
| Agents | `agents/` | ✅ Yes |

### Storage Options

```bash
# Option 1: Local storage
cp backup-20260321_073000.ctpkg ~/backups/

# Option 2: Private GitHub repo
git add -A && git commit -m "Backup $(date)" && git push origin main

# Option 3: Encrypted cloud storage
# Encrypt first, then upload to Google Drive / Dropbox
```

### ⚠️ Security Warning

Backup contains **ALL sensitive data**:
- 🔐 API Keys (`.env`)
- 🔐 Device tokens (`identity/`)
- 🔐 Channel config (`feishu/`)
- 🔐 Personal memory (`memory/`)

**Must encrypt before storing in cloud!**

---

## 🔄 Path 2: Restore (From Backup)

### Restore Steps

1. **Stop OpenClaw** (if running)
   ```bash
   openclaw gateway stop
   ```

2. **Extract Backup**
   ```bash
   tar -xzf backup-20260321_073000.ctpkg \
     -C /workspace/projects/workspace/
   ```

3. **Verify Files**
   ```bash
   ls -la /workspace/projects/workspace/
   ```

4. **Restore `.env`** (if backed up separately)
   ```bash
   # Copy from secure location
   cp ~/secure-backup/.env /workspace/projects/workspace/
   ```

5. **Re-pair Channels** (required)
   ```bash
   openclaw pairing
   ```

6. **Restart OpenClaw**
   ```bash
   openclaw gateway restart
   ```

### Restore Notes ⚠️

| Item | Action |
|------|--------|
| API Keys | Restore from encrypted backup or re-add to `.env` |
| Channel Pairing | Re-pair all channels (required) |
| Device Auth | Re-authenticate devices |
| Memory Files | Restored automatically |
| Skills | Preserved (no re-install needed) |

---

## 📤 Path 3: Share to ClawTalent (Public, Sanitized)

**Purpose**: Share Agent team/skills to community, publish to ClawTalent market

**⚠️ Important**: Sharing is **completely different** from Backup!
- 📤 **Share** = Public, sanitized, platform-reviewed
- 🗄️ **Backup** = Private, complete, encrypted

### Step 1: Choose Share Type

| Type | Description | Example |
|------|-------------|---------|
| **Agent Team** | Complete Agent team config | "韩先生的 AI 助理团队" |
| **Skill** | Single skill definition | "网络搜索技能" |
| **Template** | Message/document templates | "日报模板" |
| **Full Config** | All config (sanitized) | "完整配置（脱敏）" |

### Step 2: Sanitize (Remove Sensitive Data)

```bash
# Run sanitization check
./scripts/sanitize-check.sh /workspace/projects/workspace

# Or manually exclude sensitive files when packing
```

**Must Exclude** ❌:
- `.env` - API Keys
- `credentials/` - Channel tokens
- `identity/` - Device auth
- `devices/` - Paired devices
- `openclaw.json` - Gateway secrets
- `feishu/` - Feishu config
- `browser/` - Browser data
- `logs/` - Logs (may contain secrets)
- `.git/` - Git history
- `memory/` - Personal memory (default exclude)
- `.learnings/` - Error logs (default exclude)

**Must Sanitize** 🧹:
- `USER.md` - Replace phone/email with `[REDACTED]`
- `TOOLS.md` - Remove SSH/camera info
- `AGENTS.md` - Check for personal project links

### Step 3: Package

```bash
# Create share package (sanitized)
tar -czf agent-team-v1.0.ctpkg \
  --exclude='.env' \
  --exclude='credentials/' \
  --exclude='identity/' \
  --exclude='devices/' \
  --exclude='openclaw.json' \
  --exclude='feishu/' \
  --exclude='browser/' \
  --exclude='logs/' \
  --exclude='.git/' \
  --exclude='memory/' \
  --exclude='.learnings/' \
  -C /workspace/projects/workspace \
  .

# Create metadata file
cat > .ctpkg-meta.json << 'EOF'
{
  "schemaVersion": "1.0",
  "packageType": "agent-team",
  "name": "agent-team",
  "version": "1.0.0",
  "description": "韩先生的 AI 助理团队配置",
  "createdAt": "$(date -Iseconds)"
}
EOF
```

### Step 4: Upload to ClawTalent

```bash
# CLI upload (if available)
clawtalent upload agent-team-v1.0.ctpkg \
  --name "韩先生的 AI 助理团队" \
  --description "完整的 AI 助理团队配置，包含 6 个 Agent" \
  --tags "assistant,team,productivity"

# Or visit web: https://clawtalent.shop
```

### Step 5: Platform Review

After upload, ClawTalent will automatically review:

| Detection Level | Action | Example |
|----------------|--------|---------|
| 🔴 **High Risk** | **Direct Reject** | API Key, password, token |
| 🟡 **Medium Risk** | **Warning + Confirm** | Phone, email, address |
| 🟢 **Low Risk** | **Pass** | Company name, school name |

**Review Results**:
- 🔴 High Risk → ❌ Rejected (not visible)
- 🟡 Medium Risk → ⚠️ Warning → User confirms → ✅ Published
- 🟢 Low Risk → ✅ Published immediately

### Share Package Structure

```
agent-team-v1.0.ctpkg
├── .ctpkg-meta.json         # ✅ Package metadata
├── SOUL.md                  # ✅ Personality
├── IDENTITY.md              # ✅ Agent identity
├── AGENTS.md                # ✅ Team structure
├── USER.md                  # ✅ User info (sanitized)
├── TOOLS.md                 # ✅ Preferences (sanitized)
├── HEARTBEAT.md             # ✅ Scheduled tasks
├── agents/                  # ✅ Agent configs
├── skills/                  # ✅ Custom skills
├── templates/               # ✅ Templates
├── scripts/                 # ✅ Scripts (no secrets)
└── docs/                    # ✅ Documentation
```

---

## 🔍 Path 4: Download from ClawTalent

### Browse ClawTalent Market

Visit: https://clawtalent.shop

Search for:
- Multi-agent setups
- Specific skills
- Industry templates
- Complete configurations

### Deploy from ClawTalent

```bash
# Download package
curl -L https://clawtalent.shop/api/download/CT-XXXX -o config.ctpkg

# Extract to workspace
tar -xzf config.ctpkg -C /workspace/projects/workspace/

# Verify files
ls -la /workspace/projects/workspace/
```

### Verify Before Deploy

1. ✅ Check OpenClaw version compatibility
2. ✅ Review skills list
3. ✅ Check agent configurations
4. ✅ Verify no sensitive data included (already reviewed by platform)
5. ✅ Test in isolated environment first (recommended)

### Post-Deploy Steps

```bash
# 1. Add your API keys
cp .env.example .env
# Edit .env with your keys

# 2. Pair your channels
openclaw pairing

# 3. Restart OpenClaw
openclaw gateway restart
```

---

## 🔐 Security Best Practices

### Backup Security 🗄️

**Always** ✅:
- Encrypt backup before cloud storage (AES-256)
- Store in private locations (private GitHub, encrypted cloud)
- Test restore quarterly
- Keep last 30 days of backups

**Never** ❌:
- Store unencrypted backups in public locations
- Share backup files publicly
- Forget to update backups regularly

### Sharing Security 📤

**Always** ✅:
- Run sanitization check before packaging
- Exclude all sensitive files (see exclusion list above)
- Manually review sanitized files
- Confirm platform warnings carefully

**Never** ❌:
- Share `.env` or any secrets
- Share `memory/` without careful review
- Ignore platform warnings
- Share personal information accidentally

### Double Protection 🛡️

ClawTalent uses **double protection**:

1. **Local Sanitization** - User excludes sensitive files
2. **Platform Review** - Automatic detection + manual confirmation

| Scenario | Local | Platform | Result |
|----------|-------|----------|--------|
| Forgot to delete `.env` | ❌ Missed | ✅ **Detected & Rejected** | 🔒 Safe |
| Phone in `memory/` | ❌ Missed | ✅ **Warning + Confirm** | 🔒 Safe |
| API Key in config | ❌ Missed | ✅ **Detected & Rejected** | 🔒 Safe |
| Normal sanitized config | ✅ Clean | ✅ **Fast Pass** | ✅ Good UX |

---

## 📋 Quick Reference

### Backup Commands (Private, Complete)

```bash
# Complete backup (everything)
tar -czf backup-$(date +%Y%m%d_%H%M%S).ctpkg \
  -C /workspace/projects/workspace \
  .

# Store securely (encrypt first!)
# Then upload to private GitHub / encrypted cloud
```

### Share Commands (Public, Sanitized)

```bash
# Share package (sanitized, exclude sensitive)
tar -czf agent-team-v1.0.ctpkg \
  --exclude='.env' \
  --exclude='credentials/' \
  --exclude='identity/' \
  --exclude='memory/' \
  --exclude='.learnings/' \
  -C /workspace/projects/workspace \
  .

# Upload to ClawTalent
clawtalent upload agent-team-v1.0.ctpkg --name "My Agent Team"
```

### Restore Commands

```bash
# Extract backup/share package
tar -xzf backup-YYYYMMDD_HHMMSS.ctpkg \
  -C /workspace/projects/workspace/

# Verify
ls -la /workspace/projects/workspace/
```

### Decision Tree

```
What do you want to do?
│
├─ Disaster Recovery → 🗄️ Backup (complete, private)
│
├─ New Machine Setup → 🔄 Restore (from backup)
│
└─ Share to Community → 📤 Share (sanitized, public)
```

---

## 🆘 Troubleshooting

### "Permission denied"

```bash
# Fix permissions
chmod -R 755 /workspace/projects/workspace/
chmod 600 /workspace/projects/workspace/.env
```

### "Missing files after restore"

Check `.gitignore` - some files are excluded from backup by design.

### "Channel not working after restore"

Re-pair channels:
```bash
openclaw pairing
```

### "Skills not found"

Skills are in `skills/` directory. Verify:
```bash
ls /workspace/projects/workspace/skills/
```

---

## 📚 Resources

- **GitHub**: https://github.com/hanxueyuan/claw-migrate
- **ClawTalent**: https://clawtalent.shop
- **OpenClaw Docs**: https://docs.openclaw.ai

---

## 📄 License

MIT License - Free to use and share (but sanitize first!)
