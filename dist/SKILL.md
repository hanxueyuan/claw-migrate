---
name: claw-migrate
description: OpenClaw workspace backup & restore tool · One-click backup to GitHub · You stay in control
homepage: https://github.com/hanxueyuan/claw-migrate
metadata:
  {"openclaw":{"emoji":"🔄","requires":{"bins":["node","git"],"env":["GITHUB_TOKEN"]},"primaryEnv":"GITHUB_TOKEN"}}
---

# claw-migrate - OpenClaw Workspace Backup & Restore

> **Your data, your rules** - Simple, safe, and controlled backup tool

---

## 🎯 What Does This Tool Do?

**Use Cases**:
- 🔄 OpenClaw crashes frequently, need to migrate configurations
- 💾 Regular backups to prevent data loss
- 🚀 Quick recovery to minimize downtime
- 📤 Share your configurations with others
- 📥 Discover and use configurations shared by others

**Core Features**:
| Feature | Description | Command |
|---------|-------------|---------|
| **🔵 Backup** | Backup configs to a private GitHub repo | `openclaw skill run claw-migrate backup` |
| **🟢 Restore** | Restore configs from GitHub to local | `openclaw skill run claw-migrate restore` |
| **🟣 Share** | Share to ClawTalent platform | `openclaw skill run claw-migrate share` |
| **🟠 Deploy** | Deploy from ClawTalent | `openclaw skill run claw-migrate deploy CT-1001` |
| **🔍 Search** | Search ClawTalent configurations | `openclaw skill run claw-migrate search "multi-agent"` |
| **📋 Config** | Manage backup settings | `openclaw skill run claw-migrate config` |

---

## 🚀 Quick Start

### 1. Install the Skill

```bash
openclaw skill install claw-migrate
```

### 2. Setup Wizard

```bash
openclaw skill run claw-migrate setup
```

The wizard will guide you through:
1. Enter your GitHub repository (format: `owner/repo`)
2. Choose authentication method (environment variable or manual token)
3. **Select what to back up** (20+ categories, entirely your choice)
4. Confirm configuration

### 3. Backup

```bash
openclaw skill run claw-migrate backup
```

### 4. Restore (New Machine)

```bash
# After installing the skill on a new machine
openclaw skill run claw-migrate setup
# Choose "Restore configuration", enter repo info
openclaw skill run claw-migrate restore
```

---

## 📦 Backup Categories

### 🔵🟢🟣🟡 Core Configuration (Recommended)

| Category | Files Included | Description |
|----------|---------------|-------------|
| 🔵 **Core Config** | `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md` | AI persona and team definitions |
| 🟢 **Skills** | `skills/` | All custom skills |
| 🟣 **Memory Data** | `MEMORY.md`, `memory/` | Long-term memory and memory index |
| 🟡 **Learning Records** | `.learnings/` | Error logs and learning notes |

### ⚪ Optional Configuration

| Category | Files Included | Description |
|----------|---------------|-------------|
| ⚪ **Cron Jobs** | `cron/` | Scheduled task configs |
| ⚪ **Project Docs** | `docs/` | Project documentation |
| ⚪ **Scripts** | `scripts/` | Script tools |
| ⚪ **Templates** | `templates/` | Template files |
| ⚪ **Tests** | `tests/` | Test cases and scripts |
| ⚪ **GitHub Config** | `.github/` | GitHub-related configs |

### ⚠️ Machine-Specific Configuration (Select as Needed)

| Category | Files Included | Description |
|----------|---------------|-------------|
| ⚠️ **OpenClaw Config** | `openclaw.json` | Contains machine-specific paths; may need editing for multi-device sync |
| ⚠️ **Feishu Config** | `feishu/` | Contains pairing info; may need re-pairing for multi-device sync |
| ⚠️ **Telegram Config** | `telegram/` | Contains session info |
| ⚠️ **Other Channels** | `discord/`, `whatsapp/`, `signal/` | Other channel configs |
| ⚠️ **Browser Data** | `browser/` | Browser user data, may be large |
| ⚠️ **Session History** | `agents/*/sessions/` | Session records, may be large |
| ⚠️ **Log Files** | `logs/` | Log files, may be large |

### 🔴 Sensitive Information (Select with Caution)

| Category | Files Included | Description |
|----------|---------------|-------------|
| 🔴 **Environment Config** | `.env`, `.env.*` | API keys, tokens, etc. **Only recommended for private repos** |
| 🔴 **Credentials** | `credentials/` | Auth credentials. **Only recommended for private repos** |
| 🔴 **Device Auth** | `identity/` | Device tokens. **Only recommended for private repos** |

---

## 🎯 Quick Selection Options

The setup wizard provides several shortcuts:

| Command | Description |
|---------|-------------|
| `a` | **Select all** (including sensitive info) |
| `r` | **Recommended only** (core config) |
| `s` | **Standard** (recommended + optional, no sensitive) |
| `1 2 3 5` | **Manual selection** (enter numbers) |
| Enter | **Skip** (don't back up) |

---

## 🔄 Restore Strategies

| File Type | Strategy | Description |
|-----------|----------|-------------|
| Core Config | **Smart Merge** | Preserves local customizations, merges remote updates |
| Skills | **Incremental Sync** | Only adds skills that exist remotely but not locally |
| MEMORY.md | **Merge** | Preserves local memories, appends new remote memories |
| .learnings/ | **Append & Dedup** | Appends new remote records, auto-deduplicates |
| Other Files | **Overwrite** | Uses remote version |

---

## 🔐 Security Notes

### Private Repository Recommended

**Strongly recommend using a GitHub Private Repository**

```bash
# Create a private repository
gh repo create openclaw-backup --private
```

### Sensitive Information Protection

- 🔴 System will ask for confirmation when backing up sensitive info
- 🔴 Only recommended for trusted private repositories
- 🔴 Regularly review and update token permissions

### Token Handling & Storage

**Token can be stored in three ways:**

1. **Environment Variable** (Recommended) - Set `GITHUB_TOKEN` in your shell
   - Most secure, no persistence
   - `export GITHUB_TOKEN=ghp_xxx`

2. **Config File** (Convenient) - Token may be stored in `~/.openclaw/claw-migrate/config.json`
   - Convenient for repeated use
   - Use fine-grained tokens with minimal permissions

3. **GitHub CLI** (Fallback) - Skill may try `gh auth token` if no token configured
   - Uses your existing GitHub CLI authentication
   - No additional token storage

**Best Practices:**
- Use fine-grained personal access tokens with `repo` scope only
- Rotate tokens periodically
- Never commit token to public repositories
- For shared machines, prefer environment variable over config storage

---

## ⚙️ Configuration Management

```bash
# Start setup wizard
openclaw skill run claw-migrate setup

# View current configuration
openclaw skill run claw-migrate config

# Edit configuration
openclaw skill run claw-migrate config --edit

# Reset configuration
openclaw skill run claw-migrate config --reset

# View status
openclaw skill run claw-migrate status
```

**Config File Location**: `~/.openclaw/claw-migrate/config.json`

---

## 📝 Usage Examples

### Scenario 1: Migrate to a New Machine

```bash
# 1. Install the skill
openclaw skill install claw-migrate

# 2. Setup wizard (enter original repo info)
openclaw skill run claw-migrate setup

# 3. Restore configuration
openclaw skill run claw-migrate restore
```

### Scenario 2: Back Up Core Config Only

```bash
# 1. Start setup wizard
openclaw skill run claw-migrate setup

# 2. When selecting backup content, enter: r (recommended only)
# 3. Run backup
openclaw skill run claw-migrate backup
```

### Scenario 3: Full Backup (Including Sensitive Info)

```bash
# 1. Start setup wizard
openclaw skill run claw-migrate setup

# 2. When selecting backup content, enter: a (select all)
# 3. Confirm backing up sensitive info
# 4. Run backup
openclaw skill run claw-migrate backup
```

### Scenario 4: Preview Backup

```bash
# Preview files to be backed up (no actual upload)
openclaw skill run claw-migrate backup --dry-run
```

### Scenario 5: Share to ClawTalent

```bash
# Share your configuration to ClawTalent platform
openclaw skill run claw-migrate share

# Dry-run mode (preview only)
openclaw skill run claw-migrate share --dry-run
```

### Scenario 6: Deploy from ClawTalent

```bash
# Deploy a configuration by ID
openclaw skill run claw-migrate deploy CT-1001

# Deploy with auto-confirm
openclaw skill run claw-migrate deploy CT-1001 --yes

# Deploy from URL
openclaw skill run claw-migrate deploy https://clawtalent.shop/config/CT-1001
```

### Scenario 7: Search ClawTalent

```bash
# Search by keyword
openclaw skill run claw-migrate search "multi-agent"

# Search with tags filter
openclaw skill run claw-migrate search "home" --tags automation,iot

# Limit results
openclaw skill run claw-migrate search "finance" --limit 10
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

## 🌐 Ecosystem

- **[ClawTalent.shop](https://clawtalent.shop)** - OpenClaw Agent Marketplace
- **[ClawHub](https://clawhub.com)** - Skill Store
- **[OpenClaw](https://github.com/openclaw/openclaw)** - Framework Docs

---

## 📄 License

MIT License
