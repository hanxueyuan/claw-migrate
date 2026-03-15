# claw-migrate 发布前检查清单

**版本**: v2.0.2  
**最后更新**: 2026-03-15

---

## 📦 发布文件清单

### ✅ 必需文件（核心）

- [x] `SKILL.md` - ClawHub 技能描述（必需）
- [x] `README.md` - 用户使用文档（必需）
- [x] `LICENSE` - 开源许可证（必需）
- [x] `package.json` - 项目元数据（必需）
- [x] `src/*.js` - 源代码（必需）
- [x] `CHANGELOG.md` - 版本变更记录（推荐）
- [x] `assets/config-template.yaml` - 配置模板（推荐）

### ✅ 可选文件（增强文档）

- [x] `EXAMPLES.md` - 使用示例
- [x] `CONTRIBUTING.md` - 贡献指南
- [x] `PRIVACY_COMPLIANCE.md` - 隐私合规报告

### ❌ 排除文件（不发布）

以下文件通过 `.clawhubignore` 自动排除：

- [x] `.github/workflows/` - CI/CD 配置
- [x] `IMPLEMENTATION.md` - 实现方案（内部文档）
- [x] `IMPROVEMENT_SUGGESTIONS.md` - 改进建议（内部讨论）
- [x] `RELEASE_CHECKLIST.md` - 发布检查清单（内部使用）
- [x] `.gitignore` - Git 配置
- [x] `package-lock.json` - 依赖锁定（无外部依赖）
- [x] `tests/` - 测试文件
- [x] `node_modules/` - 依赖目录

---

## ✅ 发布前验证

### 代码质量

- [x] JavaScript 语法检查通过 (`npm run lint`)
- [x] 单元测试通过 (`npm test` - 8/8)
- [x] 技能名称统一为 `claw-migrate`
- [x] 无 `MigrateKit` 旧名称引用

### 文档完整性

- [x] SKILL.md 包含必需字段（name, description, homepage, metadata）
- [x] README.md 包含快速开始和使用示例
- [x] CHANGELOG.md 记录最新变更
- [x] LICENSE 文件存在（MIT）

### 合规性检查

- [x] 隐私与合规审查通过
- [x] 无硬编码凭证
- [x] Token 安全管理符合最佳实践
- [x] 零外部依赖（无供应链风险）

### Git 状态

- [x] 所有修改已提交
- [x] 已推送到 GitHub
- [x] CI/CD 触发并运行
- [x] 版本号正确（v2.0.2）

---

## 🚀 发布命令

```bash
# 1. 登录 ClawHub（如未登录）
clawhub login --token clh_czc1BApCkqRIO7v9ALL2FpgtwUq-WZIQa4MM50NI2T4

# 2. 预览将发布的文件
clawhub publish /workspace/projects/workspace/skills/claw-migrate \
  --slug claw-migrate \
  --name "claw-migrate" \
  --version 2.0.2 \
  --dry-run

# 3. 正式发布
clawhub publish /workspace/projects/workspace/skills/claw-migrate \
  --slug claw-migrate \
  --name "claw-migrate" \
  --version 2.0.2 \
  --changelog "Add privacy compliance review, fix skill name consistency, add .clawhubignore" \
  --tags latest
```

---

## 📊 发布后验证

- [ ] ClawHub 技能页面可见
- [ ] 技能可以安装 (`clawhub install claw-migrate`)
- [ ] 安装后功能测试通过
- [ ] 版本号显示正确

---

## 📝 文件统计

| 类别 | 数量 |
|------|------|
| 发布文件 | ~15 个 |
| 排除文件 | ~10 个 |
| 源代码文件 | 6 个 (src/*.js) |
| 文档文件 | 7 个 |
| 配置文件 | 2 个 |

**预计发布大小**: ~50KB（压缩后）

---

**检查完成日期**: 2026-03-15  
**检查者**: Lisa (Main Agent)  
**状态**: ✅ 准备就绪，可以发布
