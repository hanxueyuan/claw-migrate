---
name: claw-migrate
description: OpenClaw workspace backup & restore - automated with user guidance
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["git","tar"],"env":["GITHUB_TOKEN"]},"primaryEnv":"GITHUB_TOKEN"}}
---

# claw-migrate - OpenClaw Backup & Restore

> **Two modes**: Personal Migration (full backup) · Community Sharing (sanitized)

---

## 🎯 Two Use Cases

### Mode 1: Personal Migration (Your Use Case)

**Purpose**: Migrate your OpenClaw to a new machine

**What's backed up**:
- ✅ `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `HEARTBEAT.md` - Team config
- ✅ `memory/` - Memory database
- ✅ `.learnings/` - Learning records
- ✅ `skills/` - Custom skills
- ✅ `openclaw.json` - **With API keys** (for immediate use)
- ✅ `feishu/` - **With pairing info** (no re-pair needed)
- ✅ `.env`, `credentials/`, `identity/` - **If you choose**

**Storage**: Private GitHub repo (only you can access)

**Restore**: Full restore, everything works immediately

---

### Mode 2: Community Sharing (Share to ClawTalent)

**Purpose**: Share your config with others

**What's backed up**:
- ✅ `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `HEARTBEAT.md`
- ✅ `skills/` - Custom skills
- ⚠️ `memory/` - **Optional** (may contain personal info)
- ⚠️ `.learnings/` - **Optional** (may contain personal info)

**Automatically sanitized**:
- 🔑 API keys → `${API_KEY}`
- 📱 Phone numbers → `${PHONE}`
- 📧 Emails → `${EMAIL}`
- 🔐 Tokens → `${TOKEN}`

**Storage**: ClawTalent platform (public or private)

**Deploy**: Others get template, need to fill in their own values

---

## 🚀 Choose Your Command

| Command | Use Case | Sensitive Info |
|---------|----------|----------------|
| `backup` | Personal migration | ✅ Included |
| `backup --personal` | Personal migration | ✅ Included |
| `share` | Share to ClawTalent | ❌ Auto-removed |
| `share --sanitize` | Share to ClawTalent | ❌ Auto-removed |

---

## 🚀 Commands

### Personal Backup (Full, including sensitive info)

```bash
# Full backup (for personal migration)
openclaw skill run claw-migrate backup

# With verbose output
openclaw skill run claw-migrate backup --verbose

# Preview first
openclaw skill run claw-migrate backup --dry-run
```

**What happens**:
1. Scans workspace for **all** files
2. Shows you the complete file list (including sensitive)
3. Asks for confirmation
4. Pushes to your **private** GitHub repo
5. **Includes**: API keys, tokens, pairing info

**⚠️ Important**: Only use with **private** GitHub repos!

```bash
# Create private repo first
gh repo create openclaw-backup --private
```

### Restore from GitHub

```bash
# Restore everything
openclaw skill run claw-migrate restore

# Restore specific categories only
openclaw skill run claw-migrate restore --categories core,memory
openclaw skill run claw-migrate restore --categories skills

# Preview first
openclaw skill run claw-migrate restore --dry-run
openclaw skill run claw-migrate restore --categories core --dry-run
```

**What happens**:
1. Fetches backup from GitHub
2. Shows what will be restored (or filters by --categories)
3. Asks for confirmation
4. Restores files (smart merge for .md files)
5. Restarts OpenClaw if needed

**Available categories**: `core`, `memory`, `learnings`, `skills`, `docs`, `scripts`

### Share to ClawTalent (Sanitized, for others)

```bash
# Share (auto-sanitizes sensitive info)
openclaw skill run claw-migrate share

# With custom name
openclaw skill run claw-migrate share --name "My Multi-Agent Setup"

# Preview first (see what will be sanitized)
openclaw skill run claw-migrate share --dry-run
```

**What happens**:
1. Prepares share package
2. **Auto-scans for sensitive info**:
   - 📱 Phone numbers → `${YOUR_PHONE}`
   - 📧 Emails → `${YOUR_EMAIL}`
   - 🔑 API keys → `${API_KEY}`
   - 🔐 Tokens → `${TOKEN}`
3. Shows you what was sanitized
4. Asks for confirmation
5. Uploads to ClawTalent
6. Returns Configuration ID (e.g., `CT-0001`)

**✅ Safe to share** - All sensitive info removed

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

## 🔐 Security Comparison

| Feature | `backup` (Personal) | `share` (Community) |
|---------|--------------------|--------------------|
| **API Keys** | ✅ Included | ❌ Replaced with `${API_KEY}` |
| **Tokens** | ✅ Included | ❌ Replaced with `${TOKEN}` |
| **Phone Numbers** | ✅ Included | ❌ Replaced with `${PHONE}` |
| **Emails** | ✅ Included | ❌ Replaced with `${EMAIL}` |
| **Feishu Pairing** | ✅ Included | ❌ Removed |
| **Memory Data** | ✅ Included | ⚠️ Optional |
| **Learning Records** | ✅ Included | ⚠️ Optional |
| **Storage** | Private GitHub | ClawTalent Platform |
| **Audience** | Only you | Public/Community |

### When to Use Which

**Use `backup` when**:
- ✅ Migrating to a new machine
- ✅ Full disaster recovery
- ✅ You control the GitHub repo (private)

**Use `share` when**:
- ✅ Sharing your config with others
- ✅ Publishing to ClawTalent
- ✅ Creating a template for the community

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
