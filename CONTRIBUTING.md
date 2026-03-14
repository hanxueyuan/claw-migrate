# Contributing to claw-migrate

欢迎为 claw-migrate 项目贡献代码！

## 🚀 快速开始

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/hanxueyuan/claw-migrate.git
cd claw-migrate

# 安装依赖
npm install

# 运行测试
npm test

# 运行代码检查
npm run lint
```

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具配置

### 示例

```bash
git commit -m "feat: 添加批量迁移支持"
git commit -m "fix: 修复 GitHub API 认证问题"
git commit -m "docs: 更新 README 使用示例"
```

## 🧪 测试要求

所有 PR 必须：
- ✅ 通过所有现有测试
- ✅ 为新功能添加测试用例
- ✅ 代码覆盖率不降低

### 运行测试

```bash
# 运行所有测试
npm test

# 运行单个测试文件
node tests/merger.test.js
```

## 📋 代码审查清单

提交 PR 前请确认：

- [ ] 代码通过 lint 检查
- [ ] 所有测试通过
- [ ] 添加了必要的文档
- [ ] 更新了 CHANGELOG.md（如适用）
- [ ] 遵循了代码风格指南

## 🔧 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 💬 问题反馈

遇到问题？请创建 [Issue](https://github.com/hanxueyuan/claw-migrate/issues)

---

感谢你的贡献！🎉
