# GitLab 仓库设置指南

## 📦 创建 GitLab 仓库

### 1. 在 GitLab 上创建新仓库

访问：https://gitlab.com/projects/new

**仓库信息：**
- **项目名称**: `claw-migrate`
- **项目路径**: `claw-migrate`
- **可见性**: Public（公开）或 Private（私有）
- **初始化**: ❌ 不要添加 README/.gitignore（我们已经有自己的）

### 2. 添加 GitLab 远程仓库

```bash
cd /workspace/projects/workspace/skills/claw-migrate

# 添加 GitLab 远程仓库（替换 <your-username> 为你的 GitLab 用户名）
git remote add gitlab https://gitlab.com/<your-username>/claw-migrate.git

# 或者使用 SSH（推荐）
git remote add gitlab git@gitlab.com:<your-username>/claw-migrate.git

# 验证远程仓库
git remote -v
```

### 3. 推送到 GitLab

```bash
# 推送到 GitLab
git push -u gitlab main

# 推送所有标签（如果有）
git push gitlab --tags
```

---

## 🔧 CI/CD 配置说明

### 已配置的流水线阶段

| 阶段 | 说明 | 触发条件 |
|------|------|---------|
| **lint** | 代码质量检查 | MR 或 main 分支 |
| **test** | 单元测试 | MR 或 main 分支 |
| **build** | 构建验证 | main 分支 |
| **deploy** | 发布部署（手动） | 打标签时 |
| **health_check** | 定时健康检查 | 定时触发 |

### 配置定时健康检查

1. 进入 GitLab 项目 → **Build** → **Schedules**
2. 点击 **New schedule**
3. 设置：
   - **Description**: `Weekly health check`
   - **Cron pattern**: `0 2 * * 1`（每周一凌晨 2 点）
   - **Target branch**: `main`
4. 保存

---

## 📋 发布流程

### 发布新版本

```bash
# 1. 更新版本号
vim package.json  # 修改 version 字段

# 2. 提交更改
git add package.json
git commit -m "chore: Bump version to 2.0.1"

# 3. 创建标签
git tag -a v2.0.1 -m "Release v2.0.1"

# 4. 推送代码和标签
git push gitlab main
git push gitlab v2.0.1
```

### 触发发布流水线

推送标签后：
1. 进入 GitLab → **Build** → **Pipelines**
2. 找到对应的 pipeline
3. 点击 **deploy** 阶段的 ▶️ 按钮手动触发

---

## 🔐 环境变量配置

在 GitLab 项目设置中配置以下变量：

**Settings** → **CI/CD** → **Variables**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NPM_TOKEN` | `xxx` | npm 发布 Token（可选） |
| `OPENCLAW_MARKETPLACE_API_KEY` | `xxx` | OpenClaw 技能市场 API Key（可选） |

---

## 📊 代码覆盖率报告

CI/CD 配置已包含覆盖率解析：
- 测试输出格式：`Tests: X total, Y passed, Z failed`
- GitLab 会自动解析并显示覆盖率趋势

---

## 🚀 下一步

1. ✅ 创建 GitLab 仓库
2. ✅ 推送代码
3. ✅ 验证 CI/CD 流水线
4. ✅ 配置定时健康检查
5. ⏳ 发布到 OpenClaw 技能市场

---

## 📝 检查清单

- [ ] GitLab 仓库已创建
- [ ] 代码已推送
- [ ] CI/CD 流水线运行成功
- [ ] 测试全部通过
- [ ] 定时健康检查已配置
- [ ] 发布流程已验证
