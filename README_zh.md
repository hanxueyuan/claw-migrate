# claw-migrate - OpenClaw 备份与恢复指南

> 🔄 **纯指导技能** - 无需安装，按步骤执行即可

[![Version](https://img.shields.io/github/package-json/v/hanxueyuan/claw-migrate)](https://github.com/hanxueyuan/claw-migrate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 这是什么？

**claw-migrate 不是一个工具，而是一份指导文档。**

无需安装，无需运行代码，只需按照 [SKILL.md](SKILL.md) 中的步骤操作即可。

---

## 🚀 快速开始

### 我要备份

```bash
# 快速备份（核心文件）
tar -czf backup.tar.gz -C /workspace/projects/workspace \
  AGENTS.md SOUL.md IDENTITY.md USER.md TOOLS.md \
  memory/ .learnings/ docs/ scripts/

# 完整备份（包含技能）
tar -czf full-backup.tar.gz -C /workspace/projects/workspace \
  AGENTS.md SOUL.md memory/ .learnings/ skills/ agents/
```

### 我要恢复

```bash
# 解压备份
tar -xzf backup.tar.gz -C /workspace/projects/workspace/

# 重新配对频道
openclaw pairing
```

### 我要分享

1. 清理敏感文件（`.env`、`credentials/` 等）
2. 上传到 GitHub 或 ClawTalent
3. 分享仓库链接或 CT-XXXX ID

### 我要发现

访问：https://clawtalent.shop

搜索社区分享的配置。

---

## ⚠️ 重要安全提示

### 始终要做 ✅
- 将备份存储在**私有**仓库
- API 密钥使用环境变量
- 恢复后重新配对频道
- 分享前脱敏处理

### 绝对不要 ❌
- 分享 `.env` 文件
- 提交 API 密钥到 Git
- 分享配对令牌
- 备份浏览器数据

---

## 📋 完整指南

查看 **[SKILL.md](SKILL.md)** 获取：
- ✅ 详细备份清单
- ✅ 恢复步骤详解
- ✅ 安全最佳实践
- ✅ 故障排除技巧
- ✅ 快速参考命令

---

## 🔐 免责声明

**使用 claw-migrate 即表示您同意：**

1. **自行承担风险** - 本指南仅供参考，不保证备份/恢复的完整性
2. **自行负责安全** - 分享前请确保已清理所有敏感信息
3. **遵守法律法规** - 不得分享侵犯他人权益的内容
4. **社区规范** - 遵守 ClawTalent 平台规则

**作者不对以下情况负责：**
- 数据丢失或损坏
- 敏感信息泄露
- 配置恢复失败
- 任何直接或间接损失

---

## 📊 包含内容

| 文件 | 大小 | 类型 |
|------|------|------|
| SKILL.md | ~6KB | 完整指导流程 |
| README.md | ~2KB | 快速开始 |
| CHANGELOG.md | ~6KB | 版本历史 |
| .clawhub.json | ~1KB | ClawHub 元数据 |

**总计：~15KB**（无代码、无依赖！）

---

## 🌐 链接

- **[完整指南](SKILL.md)** - 备份/恢复详细流程
- **[ClawTalent](https://clawtalent.shop)** - 分享与发现配置
- **[GitHub](https://github.com/hanxueyuan/claw-migrate)** - 源码与示例
- **[OpenClaw 文档](https://docs.openclaw.ai)** - 官方文档

---

## 📄 许可

MIT License - 可自由使用和分享（但请记住先脱敏！）

---

*最后更新：2026-03-26*
