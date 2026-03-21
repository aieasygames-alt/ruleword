# GitHub OAuth 配置指南

## 方案 1: 使用 GitHub Personal Access Token（推荐）

### 步骤 1: 创建 Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置：
   - **Note**: `Decap CMS for ruleword`
   - **Expiration**: 选择过期时间（或无过期）
   - **Scopes**: 勾选 `repo` (完整仓库访问权限)
4. 点击 **"Generate token"**
5. **复制生成的 token**（只显示一次）

### 步骤 2: 配置 Netlify 环境变量

1. 进入 Netlify 后台 → 你的站点
2. **Site settings** → **Environment variables**
3. 添加以下变量：
   - **Key**: `GITHUB_TOKEN`
   - **Value**: 粘贴刚才复制的 token
4. 点击保存

### 步骤 3: 更新 CMS 配置

在 `astro-app/public/admin/config.yml` 中添加 token：

```yaml
backend:
  name: github
  repo: aieasygames-alt/ruleword
  branch: main
  token: process.env.GITHUB_TOKEN  # 使用环境变量
```

### 步骤 4: 重新部署

1. Netlify 后台 → **Deploys**
2. 点击 **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 方案 2: 使用 GitHub OAuth App

需要创建 OAuth App 和配置回调 URL，较复杂。

---

## 推荐使用方案 1

Personal Access Token 方案最简单：
- ✅ 无需额外服务
- ✅ 配置简单
- ✅ 安全可靠
- ✅ 完全控制权限

创建 token 后，告诉我，我帮你更新配置！
