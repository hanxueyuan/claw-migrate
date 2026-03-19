# ClawMigrate 使用指南

> 🔄 OpenClaw 工作空间备份与恢复工具

---

## 📖 目录

1. [快速开始](#快速开始)
2. [配置向导](#配置向导)
3. [备份操作](#备份操作)
4. [恢复操作](#恢复操作)
5. [配置管理](#配置管理)
6. [高级用法](#高级用法)
7. [故障排除](#故障排除)
8. [最佳实践](#最佳实践)

---

## 🚀 快速开始

### 1. 安装技能

```bash
openclaw skill install claw-migrate
```

### 2. 运行配置向导

```bash
openclaw skill run claw-migrate setup
```

### 3. 执行首次备份

```bash
openclaw skill run claw-migrate backup
```

---

## ⚙️ 配置向导

### 启动向导

```bash
openclaw skill run claw-migrate setup
```

### 配置步骤

#### 第 1 步：GitHub 仓库

输入仓库名称（格式：`owner/repo`）：
```
❓ GitHub 仓库名称 (格式：owner/repo)
   示例：hanxueyuan/openclaw-backup
> hanxueyuan/openclaw-backup
```

#### 第 2 步：分支名称

```
❓ 分支名称 (默认：main):
> main
```

#### 第 3 步：认证方式

```
❓ 认证方式

   1. 使用 GITHUB_TOKEN 环境变量 (推荐)
   2. 手动输入 Token (仅本次会话)

   选择 [1-2]: 1
```

#### 第 4 步：选择备份内容

```
📋 请选择要备份的内容（可多选）

   图例说明:
   🔵🟢🟣🟡 推荐 - 建议备份的核心内容
   ⚪ 可选 - 根据需求选择
   ⚠️  注意 - 包含机器特定配置
   🔴 敏感 - 包含 API Key 等敏感信息

📁 核心配置（推荐）

   [1] 🔵 🔵 核心配置
       AI 人格和团队定义

   [2] 🟢 🟢 技能文件
       所有自定义技能

   [3] 🟣 🟣 记忆数据
       长期记忆和记忆索引

   [4] 🟡 🟡 学习记录
       错误记录和学习心得

📁 可选配置

   [5] ⚪ ⚪ 定时任务
       定时任务配置

   [6] ⚪ ⚪ 项目文档
       docs/ 目录下的文档

   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   💡 选择方式:
   • 输入数字选择（如：1 2 3 5 8）
   • 输入 a 全选（包括敏感信息）
   • 输入 r 仅选推荐项
   • 输入 s 选择推荐 + 可选（不选敏感）
   • 回车跳过（不备份任何内容）

   您的选择：s
```

**快捷选择说明**：

| 命令 | 说明 | 适用场景 |
|------|------|---------|
| `a` | 全选所有分类 | 完整备份到私人仓库 |
| `r` | 仅推荐项 | 最小化备份 |
| `s` | 标准配置（推荐 + 可选） | 日常使用 ⭐ |
| `1 2 3` | 手动选择编号 | 自定义需求 |
| 回车 | 跳过 | 暂不配置 |

#### 第 5 步：确认配置

```
📊 配置摘要

   仓库：hanxueyuan/openclaw-backup
   分支：main
   认证：GITHUB_TOKEN
   备份内容 (6 项):
      ✅ 🔵 核心配置
      ✅ 🟢 技能文件
      ✅ 🟣 记忆数据
      ✅ 🟡 学习记录
      ✅ ⚪ 定时任务
      ✅ ⚪ 项目文档

   确认配置？(y/n): y
```

---

## 📤 备份操作

### 执行备份

```bash
openclaw skill run claw-migrate backup
```

**输出示例**：
```
╔════════════════════════════════════════════════════╗
║  执行备份                                          ║
╚════════════════════════════════════════════════════╝

📡 连接 GitHub...
✅ ✓ 已连接到仓库：hanxueyuan/openclaw-backup

📦 扫描工作空间...
   发现 156 个文件，总大小 2.3 MB

📤 开始上传...

   上传进度：[████████████████████] 100% (156/156)

────────────────────────────────────────────────────────

✅ 备份完成！
   成功：156 个文件
   耗时：45s
   平均速度：289ms/文件
```

### 预览模式

不实际上传，仅查看将备份哪些文件：

```bash
openclaw skill run claw-migrate backup --dry-run
```

**输出示例**：
```
📋 预览将备份的文件:

   + AGENTS.md (3.2 KB)
   + SOUL.md (2.8 KB)
   + IDENTITY.md (7.4 KB)
   + USER.md (627 B)
   + skills/weather/SKILL.md (5.1 KB)
   + skills/weather/src/index.js (12.3 KB)
   ...

💡 使用 --dry-run 以外的参数执行实际备份
```

### 详细输出模式

```bash
openclaw skill run claw-migrate backup --verbose
```

---

## 📥 恢复操作

### 执行恢复

```bash
openclaw skill run claw-migrate restore
```

**输出示例**：
```
╔════════════════════════════════════════════════════╗
║  恢复配置                                          ║
╚════════════════════════════════════════════════════╝

📡 连接 GitHub...
✅ ✓ 已连接到仓库：hanxueyuan/openclaw-backup

📦 获取仓库文件列表...
   发现 156 个文件

💾 本地备份已创建：/workspace/projects/workspace/.migrate-backup/restore-2026-03-18T10-30-00

🚀 开始恢复...

   恢复进度：[████████████████████] 100% (156/156)

────────────────────────────────────────────────────────

✅ 恢复完成！
   覆盖：120 个文件
   合并：15 个文件
   追加：8 个文件
   跳过：13 个文件
   耗时：38s

📌 后续步骤:
   • 检查配置文件是否正确
   • 如需要，重新配置 Channel pairing
   • 运行 `openclaw memory rebuild` 重建记忆索引
   • 如有问题，可从备份恢复：.migrate-backup/
```

### 预览模式

```bash
openclaw skill run claw-migrate restore --dry-run
```

**输出示例**：
```
📋 恢复预览:

   新增 (20):
     + skills/search/SKILL.md
     + skills/image-gen/SKILL.md
     ...

   合并 (15):
     🔄 MEMORY.md
     🔄 memory/index.json
     ...

   追加 (8):
     ➕ .learnings/LEARNINGS.md
     ...

   覆盖 (100):
     ⚠️  AGENTS.md
     ⚠️  SOUL.md
     ...

   跳过 (13):
     ⏭️  .env
     ⏭️  feishu/pairing/xxx.json
     ...

💡 使用 --dry-run 以外的参数执行实际恢复
```

---

## 🔧 配置管理

### 查看配置

```bash
openclaw skill run claw-migrate config
```

**输出示例**：
```
╔════════════════════════════════════════════════════╗
║  当前配置                                          ║
╚════════════════════════════════════════════════════╝

📋 配置信息

   仓库：hanxueyuan/openclaw-backup
   分支：main
   认证：env
   备份内容:
      • 🔵 核心配置
      • 🟢 技能文件
      • 🟣 记忆数据
      • 🟡 学习记录
      • ⚪ 定时任务
      • ⚪ 项目文档
   创建时间：2026-03-18 10:00:00
   更新时间：2026-03-18 10:30:00
```

### 修改配置

```bash
openclaw skill run claw-migrate config --edit
```

**交互示例**：
```
╔════════════════════════════════════════════════════╗
║  修改配置                                          ║
╚════════════════════════════════════════════════════╝

📝 修改配置

   当前仓库：hanxueyuan/openclaw-backup
   当前分支：main

   新仓库名称 (回车保持不变): hanxueyuan/new-backup
   新分支名称 (回车保持不变): develop

   确认保存？(y/n): y

✅ 配置已更新！
```

### 重置配置

```bash
openclaw skill run claw-migrate config --reset
```

**确认提示**：
```
╔════════════════════════════════════════════════════╗
║  重置配置                                          ║
╚════════════════════════════════════════════════════╝

⚠️  警告：这将删除所有配置信息

   确认重置？(y/n): y

✅ 配置已重置！

   请运行：openclaw skill run claw-migrate setup
```

### 查看状态

```bash
openclaw skill run claw-migrate status
```

**输出示例**：
```
╔════════════════════════════════════════════════════╗
║  备份状态                                          ║
╚════════════════════════════════════════════════════╝

📊 状态信息

   仓库：hanxueyuan/openclaw-backup
   分支：main
   状态：✅ 已配置
   备份频率：manual

💡 提示:
   • 执行备份：openclaw skill run claw-migrate backup
   • 执行恢复：openclaw skill run claw-migrate restore
   • 修改配置：openclaw skill run claw-migrate config --edit
```

---

## 🎯 高级用法

### 场景 1：新机器迁移配置

```bash
# 1. 在新机器上安装 OpenClaw
# 2. 安装 ClawMigrate 技能
openclaw skill install claw-migrate

# 3. 配置向导（输入原有仓库信息）
openclaw skill run claw-migrate setup
# 选择"恢复配置"，输入仓库信息

# 4. 执行恢复
openclaw skill run claw-migrate restore

# 5. 重建记忆索引
openclaw memory rebuild

# 6. 重新配置 Channel pairing（如需要）
```

### 场景 2：多设备同步

**设备 A（主设备）**：
```bash
# 配置完整备份（包括敏感信息）
openclaw skill run claw-migrate setup
# 选择：a（全选）

# 执行备份
openclaw skill run claw-migrate backup
```

**设备 B（新设备）**：
```bash
# 配置恢复（选择标准配置）
openclaw skill run claw-migrate setup
# 选择：s（标准）

# 执行恢复
openclaw skill run claw-migrate restore
```

### 场景 3：仅备份核心配置

```bash
# 配置时选择仅推荐项
openclaw skill run claw-migrate setup
# 选择：r（仅推荐）

# 执行备份
openclaw skill run claw-migrate backup
```

### 场景 4：定期手动备份

```bash
# 每次修改配置后执行
openclaw skill run claw-migrate backup

# 查看备份状态
openclaw skill run claw-migrate status
```

### 场景 5：验证备份内容

```bash
# 预览将备份的文件
openclaw skill run claw-migrate backup --dry-run

# 检查文件大小和数量
```

---

## 🐛 故障排除

### 问题 1：未找到配置文件

**错误信息**：
```
❌ 错误：未找到配置文件
   请先运行：openclaw skill run claw-migrate setup
```

**解决方案**：
```bash
openclaw skill run claw-migrate setup
```

### 问题 2：无法获取 GitHub Token

**错误信息**：
```
❌ 错误：无法获取 GitHub Token
   请设置 GITHUB_TOKEN 环境变量或运行 setup 配置向导
```

**解决方案**：

方法 1：设置环境变量
```bash
export GITHUB_TOKEN=your_token_here
```

方法 2：使用 gh CLI
```bash
gh auth login
```

方法 3：重新配置
```bash
openclaw skill run claw-migrate setup
```

### 问题 3：仓库 404 错误

**错误信息**：
```
❌ 备份失败：GitHub API 错误 (404): Not Found
```

**解决方案**：
1. 检查仓库名称是否正确（格式：`owner/repo`）
2. 确认 Token 有 repo 权限
3. 确认仓库存在（私人仓库需要 Token 访问）

### 问题 4：恢复后 Channel 无法使用

**原因**：Channel pairing 信息是设备特定的

**解决方案**：
```bash
# 重新配置 Channel pairing
# Feishu: 重新扫描二维码配对
# Telegram: 重新登录
```

### 问题 5：记忆索引丢失

**错误信息**：
```
❌ 记忆索引不存在
```

**解决方案**：
```bash
openclaw memory rebuild
```

---

## ✅ 最佳实践

### 1. 备份策略

**推荐配置**：
- ✅ 核心配置（必须）
- ✅ 技能文件（必须）
- ✅ 记忆数据（推荐）
- ✅ 学习记录（推荐）
- ⚪ 定时任务（可选）
- ⚪ 项目文档（可选）
- ❌ 敏感信息（谨慎）

### 2. 备份频率

- **开发期间**：每次重大修改后
- **稳定期间**：每周一次
- **长期不用**：停用前备份

### 3. 仓库管理

- 使用 **Private Repository**（私人仓库）
- 启用 **Branch Protection**（分支保护）
- 定期 **清理旧 Commit**（可选）

### 4. 安全建议

- 🔒 使用细粒度 Token（repo 权限即可）
- 🔒 定期轮换 Token
- 🔒 不备份 `.env` 到公共仓库
- 🔒 多设备使用不同 pairing 信息

### 5. 恢复验证

恢复后建议检查：
- [ ] AGENTS.md 配置是否正确
- [ ] 技能文件是否完整
- [ ] 记忆数据是否保留
- [ ] Channel 是否需要重新配对
- [ ] 运行 `openclaw memory rebuild`

---

## 📞 获取帮助

### 查看帮助

```bash
openclaw skill run claw-migrate --help
```

### 查看文档

- [技能说明](SKILL.md)
- [备份清单](docs/BACKUP_CHECKLIST.md)
- [测试计划](tests/TEST_PLAN.md)

### 报告问题

访问：https://github.com/hanxueyuan/claw-migrate/issues

---

**最后更新**: 2026-03-18  
**版本**: v2.3.0
