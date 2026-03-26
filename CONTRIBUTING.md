# CONTRIBUTING.md - claw-migrate 贡献指南

> 欢迎为 claw-migrate 项目做出贡献！

---

## 🎯 项目定位

**claw-migrate 是一个纯指导项目**，不包含任何代码。

贡献内容主要是：
- ✅ 改进备份/恢复流程
- ✅ 完善文档和示例
- ✅ 修复错误和遗漏
- ✅ 增加新的使用场景

---

## 📝 如何贡献

### 1. 发现问题

如果您发现：
- 文档中有错误
- 流程不清晰
- 缺少重要步骤
- 安全隐患

请提交 [Issue](https://github.com/hanxueyuan/claw-migrate/issues)。

### 2. 提出改进

如果您有：
- 更好的备份方案
- 更安全的脱敏方法
- 新的使用场景
- 文档优化建议

请提交 [Pull Request](https://github.com/hanxueyuan/claw-migrate/pulls)。

### 3. 分享经验

如果您：
- 成功使用 claw-migrate 迁移
- 发现了最佳实践
- 遇到并解决了问题

欢迎在 [Discussions](https://github.com/hanxueyuan/claw-migrate/discussions) 分享！

---

## 📋 贡献规范

### 文档格式

- 使用 Markdown 格式
- 保持简洁清晰
- 提供具体示例
- 标注风险警告

### 提交流程

```bash
# 1. Fork 项目
git clone https://github.com/YOUR_USERNAME/claw-migrate.git

# 2. 创建分支
git checkout -b feature/your-feature-name

# 3. 修改文档
# 编辑相关文件...

# 4. 提交更改
git add -A
git commit -m "feat: 添加 XXX 备份方案"

# 5. 推送并创建 PR
git push origin feature/your-feature-name
# 然后到 GitHub 创建 Pull Request
```

### 提交信息规范

```
feat: 新增功能
fix: 修复问题
docs: 文档更新
style: 格式调整（不影响功能）
refactor: 重构（不影响功能）
test: 测试相关
chore: 构建/工具相关
```

---

## 🔐 安全要求

### 绝对禁止 ❌

- 包含任何 API 密钥
- 包含任何密码
- 包含任何令牌（token）
- 包含任何个人敏感信息

### 必须脱敏 ✅

- 使用 `YOUR_API_KEY` 代替真实密钥
- 使用 `xxx` 或 `***` 隐藏敏感部分
- 使用示例路径而非真实路径

---

## 📞 联系方式

- **GitHub Issues** - 问题反馈
- **GitHub Discussions** - 经验交流
- **ClawTalent** - https://clawtalent.shop

---

## 📄 许可

MIT License - 贡献内容同样采用 MIT 许可

---

*感谢您的贡献！🎉*
