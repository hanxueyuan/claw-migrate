---
name: claw-migrate
description: OpenClaw workspace backup & restore - optimized with tar.gz packaging
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["git","tar"],"env":["GITHUB_TOKEN"]},"primaryEnv":"GITHUB_TOKEN"}}
---

# claw-migrate - OpenClaw Backup & Restore

> **Optimized**: Fast tar.gz packaging · Smart hardware preservation · Interactive restore

---

## 🎯 Features

### ✅ Backup Features

- **Fast Packaging**: Uses tar.gz compression (30-60 seconds vs 1-2 hours)
- **Smart Categories**: Selective backup by category (core, memory, skills, etc.)
- **Private Storage**: Backups stored in private GitHub repo
- **Manifest Included**: Each backup includes file list for verification

### ✅ Restore Features

- **Interactive Selection**: Choose which backup to restore
- **Hardware Preservation**: Automatically preserves local device configs
- **Smart Merge**: Memory files merged, learning records appended
- **Local Backup**: Creates backup before restore (safety net)

---

## 🚀 Quick Start

### First Time Setup

```bash
# Run setup wizard
openclaw skill run claw-migrate setup

# Or manually create config
mkdir -p /workspace/projects/claw-migrate
cat > /workspace/projects/claw-migrate/config.json << 'EOF'
{
  "repo": "hanxueyuan/lisa-backup",
  "branch": "main",
  "backup": {
    "content": ["core", "memory", "learnings", "skills", "cron", "docs", "scripts"]
  }
}
EOF
```

### Backup

```bash
# Execute backup (fast tar.gz packaging)
openclaw skill run claw-migrate backup

# Preview mode (dry-run)
openclaw skill run claw-migrate backup --dry-run

# Verbose output
openclaw skill run claw-migrate backup --verbose
```

**What happens**:
1. ✅ Scans workspace for selected categories
2. ✅ Creates tar.gz archive (30-60 seconds)
3. ✅ Uploads single file to GitHub (1-2 seconds)
4. ✅ Stores in `backups/` directory of your repo

**Output example**:
```
╔════════════════════════════════════════════════════╗
║  Execute Backup (Optimized)                        ║
╚════════════════════════════════════════════════════╝

📡 Connecting to GitHub...
✅ Connected to repository: hanxueyuan/lisa-backup

📦 Scanning workspace...
   Found 2924 files, total size 50.23 MB

📦 Creating backup archive...
✅ Backup archive created: 28.5 MB
   Location: /workspace/projects/.migrate-backup/openclaw-backup-2026-03-20_083000.tar.gz

📤 Uploading backup archive...
✅ Backup uploaded: backups/openclaw-backup-2026-03-20_083000.tar.gz

────────────────────────────────────────────────────────

✅ Backup complete!
   Succeeded: 1 archive
   Duration: 45.2s
   Archive size: 28.5 MB
   Speed: 0.63 MB/s
```

---

### Restore

```bash
# Restore from GitHub (interactive)
openclaw skill run claw-migrate restore

# Preview mode
openclaw skill run claw-migrate restore --dry-run

# Verbose output
openclaw skill run claw-migrate restore --verbose
```

**What happens**:
1. ✅ Lists available backups from GitHub
2. ✅ Lets you choose which backup to restore
3. ✅ Downloads and extracts tar.gz
4. ✅ Detects local hardware configs (preserves them)
5. ✅ Restores files (with smart merge)
6. ✅ Creates local backup before restore

**Restore process**:
```
╔════════════════════════════════════════════════════╗
║  Restore Configuration (Optimized)                 ║
╚════════════════════════════════════════════════════╝

📡 Connecting to GitHub...
✅ Connected to repository: hanxueyuan/lisa-backup

📦 Fetching backup list...

📋 Available backups (3):

   1) backups/openclaw-backup-2026-03-20_073840.tar.gz (36 MB) - 2026-03-20_073840
   2) backups/openclaw-backup-2026-03-20_073500.tar.gz (29 MB) - 2026-03-20_073500
   3) backups/openclaw-full-backup-2026-03-20_073641.tar.gz (64 MB) - 2026-03-20_073641

💡 Enter backup number to restore, or press Enter for latest
   Choice: [press Enter for latest]
   Selected: backups/openclaw-backup-2026-03-20_073840.tar.gz (latest)

📥 Downloading backup...

🔍 Detecting local hardware configurations...

✅ Found local hardware configurations (will be preserved):
   - identity/ (device auth)
   - feishu/ (Feishu pairing)
   - browser/ (browser data)
   - credentials/ (auth credentials)
   - .env (environment variables)

📋 Restore Preview:

   Source: backups/openclaw-backup-2026-03-20_073840.tar.gz
   Target: /workspace/projects/workspace
   Preserved: identity/, feishu/, browser/, credentials/, .env

Confirm restore? [y/N]: y

💾 Local backup created: /workspace/projects/workspace/.migrate-backup/restore-2026-03-20T08-30-00

🔄 Extracting backup...
✅ Backup extracted

🔄 Restoring files...

   ✓ AGENTS.md - restored
   ✓ SOUL.md - restored
   ✓ memory/ - restored
   ✓ skills/ - restored
   ⏭️  identity/ - preserved (local config exists)
   ⏭️  feishu/ - preserved (local config exists)

────────────────────────────────────────────────────────

✅ Restore complete!
   Restored: 15 files/directories
   Skipped: 5 files (preserved)

📌 Next steps:
   1. Review restored config files for correctness
   2. Verify Feishu connection (if preserved, should work immediately)
   3. Run: openclaw memory rebuild (if memory was restored)
   4. Restart OpenClaw: openclaw gateway restart
   5. If issues arise, restore from backup: .migrate-backup/
```

---

## 📋 Backup Categories

### Default Categories (Safe)

| Category | Content | Sensitive |
|----------|---------|-----------|
| `core` | AGENTS.md, SOUL.md, IDENTITY.md, USER.md, TOOLS.md, HEARTBEAT.md | ❌ |
| `memory` | MEMORY.md, memory/ | ❌ |
| `learnings` | .learnings/ | ❌ |
| `skills` | skills/ (excluding .git) | ❌ |

### Optional Categories

| Category | Content | Sensitive |
|----------|---------|-----------|
| `cron` | cron/, cron/jobs.json | ❌ |
| `docs` | docs/ | ❌ |
| `scripts` | scripts/ | ❌ |
| `templates` | templates/ | ❌ |

### Machine-Specific (Use with Caution)

| Category | Content | Sensitive |
|----------|---------|-----------|
| `openclaw_json` | openclaw.json | ❌ (machine-specific paths) |
| `feishu` | feishu/ | ⚠️ (pairing info) |
| `identity` | identity/ | 🔴 (device auth) |
| `env` | .env, .env.* | 🔴 (API keys) |

---

## ⚙️ Configuration

### Config File Location

```
/workspace/projects/claw-migrate/config.json
```

### Example Config

```json
{
  "repo": "hanxueyuan/lisa-backup",
  "branch": "main",
  "backup": {
    "content": ["core", "memory", "learnings", "skills", "cron", "docs", "scripts"]
  },
  "restore": {
    "preserveHardware": true
  }
}
```

### View Config

```bash
openclaw skill run claw-migrate config
```

### Edit Config

```bash
openclaw skill run claw-migrate config --edit
```

---

## 🔐 Security

### Private Repository

**Always use private repositories for backups**:

```bash
# Create private repo
gh repo create openclaw-backup --private
```

### Sensitive Data

**Backup includes sensitive data if you select**:
- `identity/` - Device authentication
- `feishu/` - Feishu pairing info
- `.env` - API keys and tokens
- `credentials/` - Auth credentials

**Best practices**:
1. ✅ Only backup to **private** repos
2. ✅ Never share backup files publicly
3. ✅ Use selective categories (exclude sensitive if not needed)
4. ✅ Regularly rotate API keys

---

## 🛠️ Troubleshooting

### "Backup failed: Network error"

```bash
# Check GitHub token
echo $GITHUB_TOKEN

# Verify repo access
gh repo view YOUR_USERNAME/openclaw-backup

# Retry backup
openclaw skill run claw-migrate backup
```

### "Restore failed: No backup files found"

```bash
# List backups manually
gh repo view YOUR_USERNAME/openclaw-backup --json files

# Check if backups/ directory exists
gh api /repos/YOUR_USERNAME/openclaw-backup/contents/backups
```

### "Restore failed: Cannot extract backup"

```bash
# Check disk space
df -h

# Clean up temp files
rm -rf /workspace/projects/.migrate-restore-temp

# Retry restore
openclaw skill run claw-migrate restore
```

### "Local configs not preserved"

This happens when:
1. Restoring to a new environment (no local configs exist)
2. Config detection failed

**Manual preservation**:
```bash
# Before restore, backup manually
cp -r /workspace/projects/identity /tmp/identity-backup
cp -r /workspace/projects/feishu /tmp/feishu-backup

# After restore, restore manually
cp -r /tmp/identity-backup/* /workspace/projects/identity/
cp -r /tmp/feishu-backup/* /workspace/projects/feishu/
```

---

## 📊 Performance Comparison

| Version | Backup Time | Restore Time | Method |
|---------|-------------|--------------|--------|
| **Optimized (v2.0)** | 30-60s | 1-2 min | tar.gz packaging |
| Legacy (v1.0) | 1-2 hours | 30-60 min | File-by-file upload |

**Improvement**: ~100x faster! 🚀

---

## 🌐 Resources

- **[GitHub Repo](https://github.com/hanxueyuan/claw-migrate)** - Source code
- **[OpenClaw Docs](https://docs.openclaw.ai)** - Framework docs
- **[Backup Guide](scripts/BACKUP_GUIDE.md)** - Detailed usage guide

---

## 📄 License

MIT License
