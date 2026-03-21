# RuleWord CMS 集成指南

## 概述

本项目使用 **Decap CMS** (原 Netlify CMS) 管理游戏内容，支持：
- 📝 可视化编辑游戏简介、玩法说明、技巧提示
- 🌍 多语言内容管理 (英文/中文)
- 💾 内容存储在 Git 仓库，无需数据库
- 🔗 完美集成 GitHub Pages 部署

## 快速开始

### 1. 本地开发

```bash
# 启动 Astro 开发服务器
pnpm dev

# 在另一个终端启动 CMS 代理
node cms-proxy.js
```

访问 `http://localhost:4321/admin/` 进入 CMS 管理界面。

### 2. 部署到 GitHub Pages

#### 配置 GitHub OAuth

1. 创建 GitHub OAuth App:
   - Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `RuleWord CMS`
   - Homepage URL: `https://ruleword.com`
   - Authorization callback URL: `https://api.github.com`

2. 获取 Client ID 和 Client Secret

3. 更新 `public/admin/config.yml`:
```yaml
backend:
  name: github
  repo: YOUR_USERNAME/YOUR_REPO
  branch: main
```

### 3. Netlify 部署 (可选)

如果使用 Netlify 部署，可以启用 Netlify Identity:

1. 在 Netlify 后台启用 Identity
2. 启用 Git Gateway
3. 邀请用户成为编辑者

## 文件结构

```
astro-app/
├── public/
│   └── admin/
│       ├── index.html      # CMS 入口
│       └── config.yml      # CMS 配置
├── src/
│   ├── content/
│   │   ├── config.ts       # Content Collections 配置
│   │   └── games/          # 游戏内容 JSON 文件
│   │       ├── wordle.json
│   │       ├── sudoku.json
│   │       └── ...
│   └── data/
│       └── gameContent.ts  # CMS 内容加载工具
└── cms-proxy.js            # 本地开发代理
```

## 使用 CMS 内容

### 在 Astro 页面中使用

```astro
---
import { getAllGames, getGameBySlug } from '../data/gameContent'

// 获取所有游戏
const games = await getAllGames()

// 获取单个游戏
const wordle = await getGameBySlug('wordle')
---

<h1>{wordle.en.name}</h1>
<p>{wordle.en.desc}</p>
```

### 在 React 组件中使用

```tsx
import { getGameName, getGameDesc } from '../data/gameContent'

function GameCard({ game, lang }) {
  return (
    <div>
      <h2>{getGameName(game, lang)}</h2>
      <p>{getGameDesc(game, lang)}</p>
    </div>
  )
}
```

## 迁移现有数据

运行迁移脚本将 `games.ts` 数据转换为 CMS 格式:

```bash
# 创建所有游戏的 JSON 文件
pnpm ts-node scripts/migrate-to-cms.ts
```

## CMS 编辑界面预览

访问 `/admin/` 后，你可以：

1. **游戏列表** - 查看所有游戏，支持搜索和筛选
2. **编辑游戏** - 修改游戏名称、描述、玩法说明
3. **多语言** - 切换英文/中文标签页编辑内容
4. **实时预览** - 编辑时查看预览效果

## 优势

| 特性 | 原方案 (games.ts) | CMS 方案 |
|------|------------------|----------|
| 内容编辑 | 需要改代码 | 可视化界面 |
| 非技术人员 | 无法使用 | 可以使用 |
| 版本控制 | Git | Git (自动提交) |
| 多语言 | 手动管理 | 标签页切换 |
| SEO 优化 | 需要手动 | 自动生成 |

## 注意事项

1. **首次使用**: 需要登录 GitHub 授权
2. **内容更新**: 修改后需要重新构建部署
3. **图片管理**: 上传图片存储在 `public/images/`
4. **缓存**: 构建时会自动清除缓存

## 故障排除

### CMS 无法连接 GitHub
- 检查 OAuth App 配置
- 确认 Callback URL 正确

### 本地代理无法启动
- 确认端口 4321 未被占用
- 检查 Node.js 版本 >= 18

### 内容不更新
- 清除 `.astro` 缓存目录
- 重新运行 `pnpm dev`
