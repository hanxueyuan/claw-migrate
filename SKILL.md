---
name: claw-migrate
description: OpenClaw workspace backup & restore - automated with user guidance
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["git","tar"],"env":["GITHUB_TOKEN"]},"primaryEnv":"GITHUB_TOKEN"}}
---

# claw-migrate - OpenClaw Backup & Restore

> **Automated backup and restore** with clear guidance at each step

---

## 🎯 What This Skill Does

**Automatically backs up**:
- ✅ `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `HEARTBEAT.md`
- ✅ `memory/` directory
- ✅ `.learnings/` directory
- ✅ `skills/` directory (your custom skills)

**Never backs up** (automatically excluded):
- ❌ `.env` files
- ❌ `credentials/`
- ❌ `identity/`
- ❌ `logs/`, `browser/`

**Guides you through**:
- 📁 What will be backed up (shows file list)
- ⚠️ What sensitive files found (asks for confirmation)
- 🔄 Where to restore (validates target path)
- ✏️ What to sanitize before sharing

---

## 🚀 Commands

### Backup to GitHub

```bash
openclaw skill run claw-migrate backup
```

**What happens**:
1. Scans workspace for files to backup
2. Shows you the file list
3. Warns about sensitive files
4. Creates backup archive
5. Pushes to your GitHub repo

### Restore from GitHub

```bash
openclaw skill run claw-migrate restore
```

**What happens**:
1. Asks which backup to restore (latest or specific)
2. Downloads backup
3. Shows what will be restored
4. Asks for confirmation
5. Restores files
6. Restarts OpenClaw if needed

### Share to ClawTalent

```bash
openclaw skill run claw-migrate share
```

**What happens**:
1. Prepares share package
2. **Scans for sensitive info** (phone, email, API keys)
3. Shows what needs to be sanitized
4. Helps you sanitize
5. Uploads to ClawTalent
6. Returns Configuration ID

### Deploy from ClawTalent

```bash
openclaw skill run claw-migrate deploy CT-0001
```

**What happens**:
1. Fetches config from ClawTalent
2. Shows what will be deployed
3. Asks for confirmation
4. Deploys to workspace
5. Guides re-pairing if needed

### Search ClawTalent

```bash
openclaw skill run claw-migrate search "multi-agent"
```

**What happens**:
1. Searches ClawTalent
2. Shows results with descriptions
3. Lets you pick one to deploy

---

## 📋 Backup Categories (Customizable)

### Default (Safe)
- Core configs (AGENTS.md, SOUL.md, etc.)
- memory/
- .learnings/
- skills/

### Extended (Optional)
- docs/
- scripts/
- templates/

### Sensitive (Requires Confirmation)
- openclaw.json (without API keys)
- feishu/ (without session tokens)

---

## 🔐 Security Features

### Automatic Exclusions
These are **never** backed up without explicit override:
- `.env*`
- `credentials/*`
- `identity/*`
- `*.log`

### Sensitive Data Detection
Before share/upload, scans for:
- 📱 Phone numbers (China: 1[3-9][0-9]{9})
- 📧 Email addresses
- 🔑 API keys (sk-*, ghp_*, etc.)
- 🏠 File paths

### User Confirmation Required
- First-time backup to new repo
- Sharing to ClawTalent
- Restoring to different path
- Any sensitive file inclusion

---

## ⚙️ Configuration

### Setup (First Time)

```bash
openclaw skill run claw-migrate setup
```

**Configures**:
- GitHub repo (format: `owner/repo`)
- Backup preferences (which categories)
- ClawTalent token (for share/deploy)

### View Config

```bash
openclaw skill run claw-migrate config
```

### Edit Config

```bash
openclaw skill run claw-migrate config --edit
```

---

## 📝 Usage Examples

### Quick Backup

```bash
# Backup with defaults
openclaw skill run claw-migrate backup

# Backup with extended files
openclaw skill run claw-migrate backup --extended

# Preview only (dry-run)
openclaw skill run claw-migrate backup --dry-run
```

### Restore Options

```bash
# Restore latest backup
openclaw skill run claw-migrate restore

# Restore specific backup
openclaw skill run claw-migrate restore --from backup-2026-03-19

# Restore to different path
openclaw skill run claw-migrate restore --to /new/workspace/
```

### Share Workflow

```bash
# Share (will scan and prompt for sanitization)
openclaw skill run claw-migrate share

# Share with custom name
openclaw skill run claw-migrate share --name "My Multi-Agent Setup"

# Dry-run (see what would be shared)
openclaw skill run claw-migrate share --dry-run
```

### Discover & Deploy

```bash
# Search
openclaw skill run claw-migrate search "finance"

# Deploy by ID
openclaw skill run claw-migrate deploy CT-0001

# Deploy with review first
openclaw skill run claw-migrate deploy CT-0001 --review
```

---

## 🛠️ Troubleshooting

### "Backup failed"
```bash
# Check GitHub token
echo $GITHUB_TOKEN

# Verify repo access
gh repo view YOUR_USERNAME/openclaw-backup
```

### "Restore failed"
```bash
# List available backups
openclaw skill run claw-migrate config --list-backups

# Check workspace path
openclaw skill run claw-migrate config
```

### "Share rejected"
```bash
# See what sensitive files found
openclaw skill run claw-migrate share --dry-run

# Manually sanitize then retry
# Edit files to remove sensitive info
openclaw skill run claw-migrate share
```

---

## 🌐 Resources

- **[GitHub Repo](https://github.com/hanxueyuan/claw-migrate)** - Source code
- **[ClawTalent](https://clawtalent.shop)** - Share & discover configs
- **[OpenClaw Docs](https://github.com/openclaw/openclaw)** - Framework docs

---

## 📄 License

MIT License
