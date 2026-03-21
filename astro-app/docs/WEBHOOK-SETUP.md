# Cloudflare Webhook 配置指南

本文档说明如何配置 Contentful 和 Cloudflare Pages 之间的 Webhook，实现"发布即部署"的自动化流程。

## 架构流程

```
Contentful 发布内容 → Webhook 触发 → Cloudflare Pages 构建 → 网站更新
```

## 第一步：获取 Cloudflare Deploy Hook

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → 选择你的 **RuleWord** 项目
3. 点击 **Settings** → **Builds & deployments**
4. 找到 **Build hooks** 部分
5. 点击 **Add build hook**
6. 输入名称：`Contentful Publish`
7. 选择分支：`main` (或你的生产分支)
8. 点击 **Save**
9. **复制生成的 URL** (格式类似: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxx`)

## 第二步：配置 Contentful Webhook

1. 登录 [Contentful](https://app.contentful.com/)
2. 选择你的 Space
3. 进入 **Settings** → **Webhooks**
4. 点击 **Add Webhook**

### 基本配置

| 字段 | 值 |
|------|-----|
| Name | `Cloudflare Auto Deploy` |
| URL | 粘贴上一步复制的 Cloudflare Hook URL |
| Method | `POST` |

### 触发条件 (Triggers)

选择 **Select specific triggering events**:

- ✅ **Publish** (发布)
  - ✅ Entry
  - ✅ Asset
- ✅ **Unpublish** (取消发布)
  - ✅ Entry
  - ✅ Asset

### 过滤条件 (Filters)

如果只想在 Game 内容变化时触发:

- **Filter by content type**: `game`

### 高级设置

| 设置 | 推荐值 |
|------|--------|
| Headers | 留空 (Cloudflare Hook 已包含认证) |
| Secret | 留空 |

5. 点击 **Save** 保存 Webhook

## 第三步：测试 Webhook

### 方法一：在 Contentful 中测试

1. 进入 **Content** → 选择任意 Game 条目
2. 修改内容并 **Publish**
3. 查看 Cloudflare Pages 的 **Deployments** 页面
4. 应该看到一个新的构建正在运行

### 方法二：手动触发测试

在 Contentful Webhook 设置页面:
1. 找到你创建的 Webhook
2. 点击 **Send test** 按钮
3. 检查 Cloudflare 是否收到构建请求

## 可选：添加构建通知

### Slack 通知

1. 在 Slack 中创建 Incoming Webhook
2. 在 Contentful 中添加另一个 Webhook:
   - URL: Slack Webhook URL
   - Triggers: Publish
   - 自定义消息模板

### 邮件通知

可以使用 Cloudflare 的 **Deployment notifications**:
1. Cloudflare Dashboard → 你的项目 → Settings
2. **Notifications** → 添加邮件地址

## 故障排除

### Webhook 没有触发构建

1. **检查 URL 是否正确**: 确保复制了完整的 Cloudflare Hook URL
2. **检查触发条件**: 确保选择了正确的 events
3. **查看 Contentful Webhook 日志**:
   - Settings → Webhooks → 点击 Webhook
   - 查看 **Recent deliveries** 了解请求状态

### 构建失败

1. **检查环境变量**: 确保 Contentful 环境变量在 Cloudflare 中正确配置
2. **查看构建日志**: Cloudflare → Deployments → 点击失败的部署查看详情
3. **本地测试**: 运行 `pnpm build` 确保构建成功

### 延迟问题

- Cloudflare 构建通常需要 1-3 分钟
- 可以在 Contentful Webhook 设置中启用重试机制

## 环境变量配置

在 Cloudflare Pages 中设置以下环境变量:

**Production 环境:**
```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
```

**Preview 环境 (可选):**
```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token
```

设置位置: Cloudflare Dashboard → 你的项目 → Settings → Environment variables
