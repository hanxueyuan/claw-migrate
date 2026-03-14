# claw-migrate 使用示例

## 场景 1：新安装的 OpenClaw

### 情况
你刚在一台新服务器上安装了 OpenClaw，想从 GitHub 私有仓库拉取配置。

### 步骤

```bash
# 1. 设置 GitHub Token
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 2. 执行迁移
openclaw skill run claw-migrate --repo your-username/your-repo --path workspace/projects/workspace

# 3. 验证配置
cat AGENTS.md
cat SOUL.md
ls skills/
```

### 预期输出
```
============================================================
  OpenClaw GitHub 配置迁移工具
============================================================

📡 正在连接 GitHub...
✅ 已连接到仓库：your-username/your-repo
   类型：私有仓库

📋 正在分析文件...
   发现 25 个文件待迁移

💾 正在创建备份...
✅ 备份已创建：.migrate-backup/2024-01-15T10-30-00-000Z

🚀 开始迁移...

   ✓ AGENTS.md
   ✓ SOUL.md
   ✓ IDENTITY.md
   ✓ USER.md
   ✓ skills/claw-migrate/SKILL.md
   ✓ skills/weather/SKILL.md
   ...

==================================================
✅ 迁移完成!
   成功：25 个文件
   跳过：0 个文件

📌 后续步骤:
   • 检查配置是否正确，如有问题可从备份恢复
   • 验证 AGENTS.md, SOUL.md 等配置文件
   • 检查新技能是否正常工作
```

---

## 场景 2：配置恢复

### 情况
本地配置文件损坏或误删，需要从 GitHub 仓库恢复。

### 步骤

```bash
# 1. 预览会恢复哪些文件
openclaw skill run claw-migrate --repo your-username/your-repo --dry-run

# 2. 执行恢复
openclaw skill run claw-migrate --repo your-username/your-repo

# 3. 如果出现问题，从备份恢复
cp .migrate-backup/<timestamp>/AGENTS.md ./AGENTS.md
```

---

## 场景 3：仅更新技能

### 情况
你想从仓库获取最新的技能，但不想覆盖本地配置。

### 步骤

```bash
# 仅拉取技能文件
openclaw skill run claw-migrate --repo your-username/your-repo --type skills

# 输出示例：
#    ⏭️  AGENTS.md (本地已有，跳过)
#    ✓ skills/new-skill/SKILL.md
#    ⏭️  skills/weather/SKILL.md (本地已有，跳过)
```

---

## 场景 4：多设备同步

### 情况
你在公司和家里各有一台 OpenClaw，希望保持配置同步。

### 步骤

```bash
# 在家里的服务器上（中央仓库）
# 1. 确保配置已提交到 GitHub
cd /workspace/projects/workspace
git add .
git commit -m "Update configuration"
git push

# 在公司的服务器上
# 2. 拉取最新配置
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
openclaw skill run claw-migrate --repo your-username/your-repo --type config --type skills
```

---

## 场景 5：预览模式

### 情况
在执行实际迁移前，想先看会变更哪些文件。

### 步骤

```bash
openclaw skill run claw-migrate --repo your-username/your-repo --dry-run
```

### 预期输出
```
📝 预览将迁移的文件:

   + AGENTS.md
   + SOUL.md
   + IDENTITY.md
   + USER.md
   + skills/claw-migrate/SKILL.md
   + skills/weather/SKILL.md
   + memory/2024-01-15-daily-review.md
   + .learnings/LEARNINGS.md

💡 使用 --dry-run 以外的参数执行实际迁移
```

---

## 场景 6：使用 gh CLI 认证

### 情况
你已经安装了 GitHub CLI 并登录，想直接使用它进行认证。

### 步骤

```bash
# 确保已登录
gh auth status

# 执行迁移（自动从 gh CLI 获取 Token）
openclaw skill run claw-migrate --repo your-username/your-repo
```

---

## 场景 7：交互式输入 Token

### 情况
没有设置环境变量，也没有 gh CLI，想临时输入 Token。

### 步骤

```bash
# 直接运行，会提示输入 Token
openclaw skill run claw-migrate --repo your-username/your-repo

# 输出：
# ⚠️  未检测到 GITHUB_TOKEN 环境变量
#    请输入您的 GitHub Personal Access Token:
#    （Token 仅用于本次会话，不会被保存）
# 
# GitHub Token: [输入 Token]
```

---

## 常见问题

### Q: 如何知道迁移是否成功？

A: 查看输出中的统计信息：
```
✅ 迁移完成!
   成功：25 个文件
   跳过：0 个文件
```

### Q: 迁移后如何恢复备份？

A: 
```bash
# 列出备份
ls .migrate-backup/

# 恢复特定文件
cp .migrate-backup/2024-01-15T10-30-00-000Z/AGENTS.md ./AGENTS.md
```

### Q: 如何跳过备份？

A: 
```bash
openclaw skill run claw-migrate --repo your-username/your-repo --no-backup
```

### Q: 如何查看详细日志？

A: 
```bash
openclaw skill run claw-migrate --repo your-username/your-repo --verbose
```

---

## 最佳实践

1. **首次迁移前先用 --dry-run 预览**
2. **保留备份**（默认启用，不要用 --no-backup）
3. **定期更新 GitHub 仓库**，保持配置最新
4. **使用私有仓库**，避免敏感信息泄露
5. **定期轮换 Token**，建议每 90 天更新一次
