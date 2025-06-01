# 分支策略与 CI/CD 工作流程

## 分支结构

### 主要分支
- **`main`** - 主开发分支，包含最新的稳定开发代码
- **`develop`** - 开发分支，用于集成功能分支
- **`release`** - 发布分支，**只有此分支会触发生产部署**

### 功能分支
- **`feature/*`** - 功能开发分支（如 `feature/editor-module`）
- **`hotfix/*`** - 紧急修复分支（如 `hotfix/login-bug`）

## CI/CD 工作流程

### 🔄 持续集成 (CI) - 所有分支
- **触发条件**: 推送到任何分支或向主要分支提交 PR
- **执行内容**: 
  - 代码质量检查 (ESLint)
  - TypeScript 类型检查
  - 单元测试
  - 构建验证

### 🧪 测试工作流程 - 功能分支
- **触发条件**: 推送到 main, develop, release, feature/*, hotfix/*
- **执行内容**:
  - 完整测试套件
  - 代码覆盖率报告
  - 上传到 Codecov

### 🏗️ 构建检查 - 多版本
- **触发条件**: 推送到主要分支或功能分支
- **执行内容**:
  - 多 Node.js 版本构建测试 (18.x, 20.x)
  - 跨环境兼容性验证

### 🚀 生产部署 - 仅 Release 分支
- **触发条件**: 推送到 `release` 分支
- **执行内容**:
  - 完整的 CI 检查
  - 生产构建
  - 部署到 GitHub Pages

## 开发工作流程

### 1. 功能开发
```bash
# 从 main 分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 开发并提交
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature-name

# 创建 PR 到 develop 分支
```

### 2. 集成测试
```bash
# 将功能分支合并到 develop
git checkout develop
git merge feature/your-feature-name
git push origin develop
```

### 3. 发布准备
```bash
# 从 develop 创建 release 分支
git checkout develop
git pull origin develop
git checkout -b release
git push origin release
```

### 4. 生产部署
- 推送到 `release` 分支会自动触发部署到 GitHub Pages
- 部署前会自动运行所有测试和代码质量检查

## 分支保护规则建议

在 GitHub 仓库设置中启用以下保护规则：

### `main` 分支
- ✅ 要求 PR 审核
- ✅ 要求状态检查通过
- ✅ 要求分支为最新

### `release` 分支  
- ✅ 要求 PR 审核
- ✅ 要求状态检查通过
- ✅ 限制推送权限
- ✅ 要求分支为最新

## 注意事项

1. **只有 `release` 分支会部署到生产环境**
2. 所有分支都会运行基本的 CI 检查
3. 功能分支应该从 `main` 创建并合并回 `develop`
4. `release` 分支应该从 `develop` 创建
5. 紧急修复可以直接在 `hotfix/*` 分支进行，然后合并到相关分支 