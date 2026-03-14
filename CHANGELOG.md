# Changelog

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划功能
- 支持批量迁移多个配置文件
- 添加迁移进度显示
- 支持增量同步模式

## [2.0.0] - 2026-03-14

### 新增 ✨
- 从 GitHub 私有仓库拉取 OpenClaw 配置
- 智能增量合并策略（不覆盖本地配置）
- 自动备份与回滚支持
- 差异预览模式（--dry-run）
- 支持环境变量或交互式输入 GitHub Token
- 按类型迁移（config/skills/memory/learnings）

### 改进 🔧
- 完整的单元测试覆盖（8 个测试用例）
- GitHub Actions CI/CD 配置
- 代码质量检查工作流
- 依赖更新检查

### 安全 🔒
- 敏感信息脱敏处理
- Token 不保存，仅本次会话使用
- 原子写入避免文件损坏

### 文档 📖
- 完整的使用文档（README.md）
- 实现方案说明（IMPLEMENTATION.md）
- 使用示例（EXAMPLES.md）
- 贡献指南（CONTRIBUTING.md）

## [1.0.0] - 2026-03-13

### 已移除
- 旧版 SSH 同步功能（已废弃）

---

## 版本说明

### 语义化版本

- **主版本号（Major）**: 不兼容的 API 变更
- **次版本号（Minor）**: 向后兼容的功能新增
- **修订号（Patch）**: 向后兼容的问题修复

### 标签说明

- `[Unreleased]`: 未发布的功能
- `[2.0.0]`: 重大版本更新
- `[1.0.0]`: 初始版本
