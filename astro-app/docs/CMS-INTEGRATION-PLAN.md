# CMS 集成开发计划

## 项目概述

将 RuleWord 游戏平台从本地 JSON 文件管理迁移到 CMS，实现：
- 通过 CMS 界面管理游戏内容
- 发布时自动触发 Cloudflare 构建部署
- 支持多语言内容管理 (8种语言)
- 保持 Astro 静态生成的性能优势

---

## ✅ 实施状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| Phase 1 | ✅ 完成 | Sanity 和 Contentful 依赖已安装 |
| Phase 2 | ✅ 完成 | `src/lib/sanity.ts` 和 `src/lib/contentful.ts` 已创建 |
| Phase 3 | ✅ 完成 | `src/types/contentful.ts` 类型定义已创建 |
| Phase 4 | ✅ 完成 | `scripts/migrate-to-sanity.ts` 迁移脚本已创建 |
| Phase 5 | ✅ 完成 | `src/lib/games.ts` 统一数据层已创建 |
| Phase 6 | 📋 文档 | `docs/WEBHOOK-SETUP.md` 已创建 |
| Phase 7 | ⏳ 待执行 | 需要在 CMS 配置完成后测试 |

---

## CMS 选择

### 推荐方案：Sanity CMS

**优势：**
- ✅ 免费额度充足：10万+ API 请求/月
- ✅ 实时协作编辑
- ✅ 优秀的 TypeScript 支持
- ✅ 强大的 GROQ 查询语言
- ✅ 内置图片处理

**免费计划包含：**
- 10 GB 带宽/月
- 100,000 API 请求/月
- 5 个用户
- 无限项目

### 备选方案：Contentful

**注意：** Contentful 已取消免费计划，最低 $300/月起

---

## 已创建的文件

```
astro-app/
├── src/
│   ├── lib/
│   │   ├── sanity.ts          # Sanity API 客户端
│   │   ├── contentful.ts      # Contentful API 客户端 (备选)
│   │   └── games.ts           # 统一数据获取层
│   ├── types/
│   │   └── contentful.ts      # TypeScript 类型定义
│   └── env.d.ts               # 环境变量类型
├── scripts/
│   ├── migrate-to-sanity.ts      # 数据迁移到 Sanity
│   ├── migrate-to-contentful.ts  # 数据迁移到 Contentful (备选)
│   └── sync-from-contentful.ts   # 从 CMS 同步到本地
├── docs/
│   ├── CMS-INTEGRATION-PLAN.md   # 本文档
│   └── WEBHOOK-SETUP.md          # Webhook 配置指南
├── sanity.config.ts              # Sanity schema 定义
└── .env.example                  # 环境变量模板
```

---

## 快速开始 (Sanity)

### 1. 创建 Sanity 账户和项目

1. 访问 [sanity.io](https://www.sanity.io/) 注册账户
2. 创建新项目
3. 记录 **Project ID**

### 2. 创建 Game Schema

在 Sanity Studio 中创建 `game` 文档类型，包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `gameId` | String | 游戏唯一标识 |
| `slug` | Slug | URL 路径 |
| `title` | String | 游戏名称 |
| `icon` | String | Emoji 图标 |
| `category` | String | 分类 (word, logic, etc.) |
| `colorGradient` | String | Tailwind 渐变 |
| `isFeatured` | Boolean | 是否推荐 |
| `description` | Text | 游戏介绍 |
| `howToPlay` | Text | 游戏规则 |
| `tips` | Text | 游戏技巧 |
| `coverImage` | Image | 封面图 |

### 3. 配置环境变量

```bash
cd astro-app
cp .env.example .env
```

编辑 `.env` 文件：

```env
SANITY_PROJECT_ID=你的ProjectID
SANITY_DATASET=production
SANITY_API_TOKEN=你的APIToken
```

### 4. 获取 API Token

1. 进入 Sanity 项目设置
2. **API** → **Tokens**
3. 创建新 Token，选择 **Editor** 权限
4. 复制 Token 到 `.env`

### 5. 运行迁移

```bash
pnpm cms:migrate:sanity
```

### 6. 配置 Webhook

参见 [WEBHOOK-SETUP.md](./WEBHOOK-SETUP.md)

---

## NPM Scripts

```bash
# Sanity 迁移
pnpm cms:migrate:sanity

# Contentful 迁移 (备选)
pnpm cms:migrate

# 从 CMS 同步到本地
pnpm cms:sync
```

---

## 数据源优先级

`src/lib/games.ts` 会自动检测可用的数据源：

1. **Sanity** - 如果设置了 `SANITY_PROJECT_ID`
2. **Contentful** - 如果设置了 `CONTENTFUL_SPACE_ID`
3. **本地 JSON** - 默认回退

---

## Sanity Schema 定义

参考 `sanity.config.ts` 文件中的 schema 定义。

### 使用 Sanity CLI 初始化 Studio (可选)

```bash
# 在 astro-app 目录下
pnpm create sanity@latest

# 选择 "Create a new project"
# 选择 "Clean project, no predefined schemas"
```

然后将 `sanity.config.ts` 中的 schema 复制到 Sanity 项目中。

---

## 多语言支持

Sanity 支持两种多语言方案：

### 方案 1：字段后缀 (简单)

```typescript
{
  title: string,      // 英文
  title_zh: string,   // 中文
  title_zhTW: string, // 繁体中文
}
```

### 方案 2：国际化插件 (推荐)

```bash
pnpm add sanity-plugin-internationalized-array
```

配置后每个字段自动支持多语言。

---

## 后续优化建议

1. **预览模式**: 使用 Sanity 的 GROQ 和实时订阅实现草稿预览
2. **图片优化**: 使用 Sanity 的图片 API 自动裁剪和格式转换
3. **缓存策略**: 考虑使用 ISR 减少构建时间
4. **内容审核**: 配置 Sanity 的工作流进行内容审核
