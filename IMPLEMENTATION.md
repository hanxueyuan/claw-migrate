# claw-migrate Implementation Summary

## Architecture Design

### v2.0.0 New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Command                            │
│   openclaw skill run claw-migrate --repo <owner>/<repo>      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│   index.js - Main Entry Point                                │
│   • Command line argument parsing                            │
│   • GitHub Token acquisition (env → gh CLI → interactive)    │
│   • Coordinate module execution                              │
└─────────────────────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ github.js │  │ merger.js │  │ writer.js │
    │           │  │           │  │           │
    │ GitHub    │  │ Merger    │  │ File      │
    │ API Access│  │ Engine    │  │ Writing   │
    │           │  │ Intelligent│  │ Backup    │
    │           │  │ Merge     │  │ Management│
    └───────────┘  └───────────┘  └───────────┘
```

## Core Modules

### 1. github.js - GitHub API Access

**Responsibilities**:
- Read private repository files via GitHub REST API
- Recursively traverse directories to get file list
- File content decoding (base64 → UTF-8)

**Key Methods**:
```javascript
class GitHubReader {
  testConnection()      // Test connection, get repository info
  getFileList(type)     // Get file list
  getFileContent(path)  // Get file content
}
```

**Authentication Flow**:
1. Prefer `GITHUB_TOKEN` environment variable
2. Then try `gh auth token` (gh CLI)
3. Finally interactively prompt user for input

### 2. config.js - Configuration Management

**File Categories**:
```javascript
FILE_CATEGORIES = {
  CORE_CONFIG: ['AGENTS.md', 'SOUL.md', ...],
  SKILLS: ['skills/**/SKILL.md', ...],
  MEMORY: ['MEMORY.md', 'memory/*.md'],
  LEARNINGS: ['.learnings/*.md'],
  ENV: ['.env'],
  ...
}
```

**Merge Strategies**:
```javascript
MERGE_STRATEGIES = {
  OVERWRITE: ['CORE_CONFIG', ...],  // Direct overwrite
  MERGE: ['MEMORY', 'LEARNINGS'],   // Intelligent merge
  SKIP: ['SKILLS', 'ENV']           // Skip if exists locally
}
```

### 3. merger.js - Merger Engine

**Core Logic**:
```javascript
class Merger {
  shouldMerge(category)   // Determine if should merge
  merge(category, local, remote)  // Execute merge
  mergeMemory(local, remote)      // Memory merge
  mergeLearnings(local, remote)   // Learning records merge
}
```

**Merge Strategy Details**:

| File Type | Strategy | Description |
|---------|------|------|
| Core configuration | Skip | Preserve if exists locally, avoid overwriting user customization |
| Skills | Skip | Only add what exists remotely but not locally |
| Memory | Merge | Preserve local, append remote new sections |
| Learning records | Append | Append after date + content deduplication |
| .env | Skip | Preserve local configuration |

### 4. writer.js - File Writing

**Responsibilities**:
- Create backup (before migration)
- Atomic writing (temporary file + rename)
- Backup restore
- Clean up old backups

**Backup Strategy**:
- Location: `.migrate-backup/<timestamp>/`
- Retention: Last 10 backups
- Content: Existing configuration files, memory, .learnings, skills

## Execution Flow

```
1. Parse command line arguments
   │
   ▼
2. Get GitHub Token
   ├─ GITHUB_TOKEN environment variable
   ├─ gh CLI
   └─ Interactive input
   │
   ▼
3. Test GitHub connection
   │
   ▼
4. Get file list
   │
   ▼
5. Preview mode?
   ├─ Yes → Display files to migrate, exit
   └─ No → Continue
   │
   ▼
6. Create backup
   │
   ▼
7. Process files one by one
   ├─ Not exists locally → Direct copy
   ├─ Exists locally + mergeable → Merge
   └─ Exists locally + not mergeable → Skip
   │
   ▼
8. Output statistics and next steps
```

## Key Design Decisions

### 1. Why Switch to GitHub-Based?

**v1.0.0 (SSH Sync) Issues**:
- Requires SSH passwordless login configuration, high threshold
- Source machine must be online and accessible
- Not suitable for disaster recovery scenarios

**v2.0.0 (GitHub Pull) Advantages**:
- Users already have GitHub repositories
- Source machine doesn't need to be online
- Suitable for new installation, configuration restore, multi-device sync

### 2. Why Adopt Incremental Merge Strategy?

**Scenario Analysis**:
- New installation: No local configuration → Full copy
- Configuration restore: Local configuration damaged → Overwrite restore
- Multi-device sync: Local configuration exists → Merge update

**Decision**:
- Default to conservative strategy: Do not overwrite existing local configuration
- Provide `--force` option (future) for forced overwrite
- Automatic backup, support rollback

### 3. Sensitive Information Handling

**Principles**:
- `.env` file: Copy if not exists locally, preserve if exists
- Do not force overwrite user's API keys
- Prompt user to check sensitive configuration after migration

## Testing Strategy

### Unit Tests

```javascript
// tests/merger.test.js
describe('Merger', () => {
  test('mergeMemory - preserve if local has content', () => {...});
  test('mergeLearnings - append with deduplication', () => {...});
  test('shouldMerge - correctly determine merge strategy', () => {...});
});
```

### Integration Tests

```bash
# 1. Create test repository
# 2. Execute migration
# 3. Verify files are correct
# 4. Verify backup is created
```

## Future Improvements

### Short Term
- [ ] Add `--force` option (forced overwrite)
- [ ] Add `--exclude` option (exclude specific files)
- [ ] Improve section-level merge for memory files

### Medium Term
- [ ] Support pulling from Git branches
- [ ] Support configuration file diff comparison
- [ ] Add post-migration verification step

### Long Term
- [ ] Support bidirectional sync
- [ ] Support conflict resolution UI
- [ ] Support scheduled automatic sync

## References

- [GitHub REST API](https://docs.github.com/en/rest)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [OpenClaw Architecture Documentation](/usr/lib/node_modules/openclaw/docs)
