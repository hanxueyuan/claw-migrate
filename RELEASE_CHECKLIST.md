# claw-migrate 发布检查清单

## 发布前检查

- [x] ✅ 所有测试通过 (8/8)
- [x] ✅ 代码质量检查通过
- [x] ✅ 安全扫描通过
- [x] ✅ 文档完整
- [x] ✅ 技能名称统一
- [x] ✅ CI/CD 配置完成
- [x] ✅ SKILL.md 添加 metadata 配置
- [x] ✅ 添加 homepage 链接

## 发布流程

### 1. 更新版本号

编辑 `package.json`:
```json
{
  "version": "2.0.1"  // 发布版本号
}
```

### 2. 更新 CHANGELOG.md

确保 CHANGELOG.md 包含本次发布的所有更改。

### 3. 提交并打标签

```bash
git add .
git commit -m "chore: Prepare release v2.0.1"
git tag -a v2.0.1 -m "Release v2.0.1 - ClawHub compliance fixes"
git push origin main
git push origin v2.0.1
```

### 4. 验证 CI/CD

访问 https://github.com/hanxueyuan/claw-migrate/actions

确认所有阶段通过：
- ✅ Lint
- ✅ Test
- ✅ Security Scan
- ✅ Build
- 🚀 Release (自动触发)

### 5. 发布到 ClawHub

```bash
# 登录
clawhub login

# 发布
clawhub publish /workspace/projects/workspace/skills/claw-migrate \
  --slug claw-migrate \
  --name "claw-migrate" \
  --version 2.0.1 \
  --changelog "Fix ClawHub compliance: add metadata, unify skill name" \
  --tags latest
```

## 发布后验证

- [ ] ClawHub 可见
- [ ] 安装测试通过
- [ ] 基本功能测试通过

---

**发布版本**: v2.0.1
**发布日期**: 2026-03-15
**发布经理**: OpenClaw Team
