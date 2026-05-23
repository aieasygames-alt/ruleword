# PRD: Ruleword AI 转型 — AI Playable Content SEO Network

> 本文档基于竞品调研、技术可行性分析和现有代码库探索，规划 Ruleword 从"静态游戏合集"向"AI Playable Content SEO Network"的渐进式转型路线。

---

## 1. 产品愿景与目标

### 1.1 愿景

将 Ruleword 打造为全球首个 **AI 互动内容 + Web SEO** 平台。核心理念：

> **Readable Content → Playable Content**

用户不再只是"阅读内容"，而是"玩内容"——搜索"创业模拟器"不是看文章，而是直接玩一个 AI 驱动的创业故事。

### 1.2 战略定位

不做 AI 游戏引擎（与 Astrocade/Rosebud 竞争），做 **AI Playable Content SEO Network**：
- AI 生成互动内容（故事、模拟器、测验）
- 每个内容有独立 SEO 页面
- 通过搜索引擎获取免费流量
- 与现有 112 款游戏共存，不替换

### 1.3 目标指标（6 个月）

| 指标 | 当前值 | Phase 1 (W8) | Phase 2 (W20) | Phase 3 (W26+) |
|------|--------|-------------|---------------|----------------|
| 索引页面数 | ~500 | ~510 | ~800 | 2,000+ |
| AI 游戏模板数 | 0 | 5 | 15-20 | 50+ |
| AI 游戏页面 | 0 | 5-10 | 50-100 | 500+ |
| 平均停留时间 | baseline | +40% (AI 游戏 >5min) | +60% | +100% |
| AI 相关关键词排名 | 无 | 进入前 50 | 进入前 20 | 进入前 10 |

### 1.4 成功标准

- **Phase 1 通过**：3+ 个 AI 游戏上线可玩，Google 已索引页面
- **Phase 2 通过**：AI 游戏带来可测量的新 SEO 流量（GSC 验证）
- **Phase 3 通过**：至少 1 个 AI 游戏关键词进入 Google 前 10

---

## 2. 用户画像

### 用户 A：休闲游戏玩家（70%）
- 18-35 岁，Google 搜索"play [game] online free"到达
- 需求：即开即玩，无需注册，移动端友好

### 用户 B：互动体验探索者（20%）
- 来自 TikTok/Reddit，搜索"AI dating sim"、"AI horror story"
- 需求：独特体验，结果可分享

### 用户 C：信息型搜索者（10%）
- 搜索"startup simulator"、"personality quiz"
- 需求：用互动体验替代传统文章阅读

### 用户旅程

```
Google "AI dating sim online"
  → /stories/ai-dating-simulator/ (静态 SEO 页面)
    → 点击 "Start Game" (加载 AI 内容)
      → 与 AI 角色互动 (Workers AI API 调用)
        → 完成故事 → 分享结果 → 浏览更多 AI 游戏
```

---

## 3. Phase 1（W1-8）：AI 剧情互动原型

### 3.1 技术架构

```
浏览器 (React AIStoryGame)
  ↓ POST /api/ai/story/generate
Cloudflare Pages Function (functions/api/ai/story.ts)
  ↓ Prompt 构建 + AI Gateway 缓存
Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)
  ↓ 结构化 JSON 响应
返回 { narration, choices, effects }
```

**关键决策**：
- Astro output 保持 `static`，API 通过 `functions/` 目录的 Cloudflare Pages Functions 提供（已有先例：`functions/api/feedback.ts`）
- 不引入 Phaser/PixiJS，纯 React + useReducer
- 用户只能从预定义选项中选择（Phase 1 不支持自由文本输入），降低复杂度和安全风险

### 3.2 新建文件清单

```
astro-app/
  functions/api/ai/
    story.ts              — AI 故事生成 API 端点
    quiz.ts               — AI 测验生成 API 端点
    _shared.ts            — 共享工具（prompt 构建、响应验证、限流）

  src/
    content/stories/      — 故事模板 JSON 文件
      ai-dating-simulator.json
      startup-simulator.json
      ai-detective-story.json
      ai-horror-story.json
      ai-personality-quiz.json

    components/ai/
      AIStoryGame.tsx     — 核心故事游戏引擎（主组件）
      StoryRenderer.tsx   — 聊天气泡/叙述渲染器
      ChoicePanel.tsx     — 选择按钮面板
      StatsBar.tsx        — 状态指标条（好感度、资金等）
      StoryEndScreen.tsx  — 结局展示 + 分享
      TypingEffect.tsx    — 打字机效果

    pages/stories/
      [slug].astro        — AI 游戏页面（SEO shell）
      index.astro         — AI 游戏列表页

    utils/
      aiClient.ts         — AI API 客户端（请求、重试、降级）
      storyTemplates.ts   — 模板加载和 prompt 构建
```

### 3.3 修改文件清单

```
astro-app/src/content/config.ts    — 新增 storiesCollection (Zod schema)
astro-app/src/data/categories.ts   — 新增 'story' 类别
astro-app/src/data/seo.ts          — 新增 AI 游戏的 SEO 配置
astro-app/src/pages/sitemap.xml.ts — 新增 stories 页面
astro-app/src/pages/index.astro    — 首页新增 AI Games 区域
astro-app/src/components/ShareModal.tsx — 扩展支持故事结局分享
```

### 3.4 Content Schema 扩展

在 `src/content/config.ts` 中新增 `storiesCollection`：

```typescript
const storiesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    icon: z.string(),
    templateType: z.enum([
      'dating-sim', 'startup-sim', 'detective',
      'horror', 'personality-quiz', 'survival',
      'negotiation', 'open-adventure'
    ]),
    color: z.string(),
    aiModel: z.string().default('@cf/meta/llama-3.1-8b-instruct'),

    systemPrompt: z.object({
      en: z.string(),
      zh: z.string().optional(),
    }),

    storySkeleton: z.object({
      setting: z.string(),
      characters: z.array(z.object({
        id: z.string(),
        name: z.string(),
        personality: z.string(),
        relationship: z.string().optional(),
      })),
      opening: z.string(),
      chapters: z.array(z.object({
        id: z.string(),
        title: z.string().optional(),
        goal: z.string(),
        minTurns: z.number().default(3),
        maxTurns: z.number().default(10),
      })),
      endings: z.array(z.object({
        id: z.string(),
        condition: z.string(),
        title: z.string(),
        description: z.string(),
      })),
      maxTotalTurns: z.number().default(30),
    }),

    uiConfig: z.object({
      showStats: z.boolean().default(true),
      stats: z.array(z.object({
        id: z.string(),
        label: z.string(),
        icon: z.string(),
        initialValue: z.number(),
        min: z.number().optional(),
        max: z.number().optional(),
      })).default([]),
      theme: z.enum(['dark', 'light', 'romantic', 'horror', 'business']).default('dark'),
    }),

    en: z.object({
      name: z.string(),
      desc: z.string(),
      description: z.string(),
      howToPlay: z.string(),
      tips: z.array(z.string()).optional(),
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })).optional(),
    }),
    zh: z.object({
      name: z.string(),
      desc: z.string(),
      description: z.string().optional(),
      howToPlay: z.string().optional(),
    }).optional(),
  }),
})

export const collections = {
  games: gamesCollection,
  stories: storiesCollection,
}
```

### 3.5 API 设计

遵循现有 `functions/api/feedback.ts` 的 PagesFunction 模式：

```
POST /api/ai/story/generate
  Request:  { templateId, currentChapter, userChoice, storyContext, language }
  Response: { nodeText, speaker?, emotion?, choices[], isChapterEnd, nextChapter?, metadataUpdate? }

POST /api/ai/story/ending
  Request:  { templateId, storyContext, language }
  Response: { endingId, title, description, summary, shareText }

POST /api/ai/quiz/question
  Request:  { templateId, previousAnswers, questionNumber, language }
  Response: { questionText, choices[], dimensionWeights }

POST /api/ai/quiz/result
  Request:  { templateId, answers, language }
  Response: { resultType, title, description, shareText, dimensions }

GET  /api/ai/health
  Response: { status: 'ok', model: string }
```

环境变量（Cloudflare Pages 设置）：
- `CF_ACCOUNT_ID`
- `CF_API_TOKEN`
- `CF_AI_GATEWAY_URL`（可选，启用缓存和限流）

### 3.6 AIStoryGame 组件设计

Props 接口（兼容现有 GameWrapper 模式）：

```typescript
interface AIStoryGameProps {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onBack: () => void
  onShare?: (data: { result: string; score?: number }) => void
  gameId?: string
  gameSlug?: string
  gameName?: string
}
```

状态管理（useReducer）：

```typescript
type StoryAction =
  | { type: 'START'; template: StoryTemplate }
  | { type: 'MAKE_CHOICE'; choiceId: string }
  | { type: 'RECEIVE_NODE'; node: StoryNode }
  | { type: 'REACH_ENDING'; ending: StoryEnding }
  | { type: 'ERROR'; error: string }
  | { type: 'RESTORE'; savedState: SavedStoryState }

interface StoryState {
  phase: 'idle' | 'intro' | 'playing' | 'loading' | 'ended' | 'error'
  currentChapterId: string
  turnNumber: number
  history: Array<{ speaker?: string; text: string; emotion?: string }>
  choices: Array<{ id: string; text: string }>
  metadata: Record<string, number>
  ending?: { title: string; description: string; shareText: string }
}
```

### 3.7 SEO 页面设计

新建 `src/pages/stories/[slug].astro`，参考现有 `src/pages/games/[slug].astro` 的模式：

**构建时（静态，Google 索引这部分）**：
- `<title>`, `<meta description>`, `<h1>`
- VideoGame + HowTo 结构化数据（JSON-LD）
- BreadcrumbList：Home > AI Games > [游戏名]
- 游戏介绍、角色介绍、How to Play、FAQ（来自 JSON 模板的 en/zh 字段）
- 相关游戏推荐（同类型 AI 游戏 + 同类别传统游戏）
- 分享和嵌入按钮

**运行时（动态，不影响 SEO）**：
- AI 生成的对话和场景
- 用户选择和游戏状态
- 打字机效果渲染

### 3.8 五个初始模板概要

| 模板 | slug | 目标关键词 | 角色数 | 章节数 | 结局数 | 状态指标 |
|------|------|-----------|--------|--------|--------|---------|
| Dating Sim | ai-dating-simulator | "AI dating simulator" | 3 | 5 | 3+ | 好感度×3、信心 |
| Startup Sim | startup-simulator | "startup simulator" | 4 | 6 | 4+ | 资金、用户、士气、进度 |
| Detective | ai-detective-story | "detective game online" | 5 | 5 | 3+ | 线索、时间、信任 |
| Horror | ai-horror-story | "AI horror story" | 2 | 4 | 2+ | 理智值、隐藏度 |
| Personality Quiz | ai-personality-quiz | "AI personality test" | 0 | 10-15问 | 8结果 | 5维度分数 |

### 3.9 任务分解

| 周次 | 任务 | 关键文件 |
|------|------|---------|
| W1 | Cloudflare Workers AI 评估 + API 端点搭建 | `functions/api/ai/story.ts`, `_shared.ts` |
| W2 | AI 客户端 + Prompt 构建系统 | `src/utils/aiClient.ts`, `src/utils/storyTemplates.ts` |
| W2-3 | Schema 扩展 + Dating Simulator 模板 | `content/config.ts`, `content/stories/ai-dating-simulator.json` |
| W3-4 | AIStoryGame 核心组件 + 子组件 | `components/ai/AIStoryGame.tsx` + 子组件 |
| W4-5 | Stories 页面路由 + SEO shell | `pages/stories/[slug].astro`, `pages/stories/index.astro` |
| W5-6 | Startup Simulator + Detective 模板 | `content/stories/startup-simulator.json`, `ai-detective-story.json` |
| W6-7 | Horror + Quiz 模板 + 保存/恢复 | `content/stories/ai-horror-story.json`, `ai-personality-quiz.json` |
| W7-8 | 分享扩展 + Sitemap + 首页集成 + 测试 | `ShareModal.tsx`, `sitemap.xml.ts`, `index.astro` |

---

## 4. Phase 2（W8-20）：AI 原生游戏扩展

### 4.1 新增 AI 游戏模板（10-15 个）

**模拟类（高 SEO）**：youtube-tycoon, crypto-trader, mafia-boss, election-simulator

**互动小说类（高停留）**：zombie-survival, time-traveler, anime-adventure, historical-figure

**测验类（高分享）**：which-founder-are-you, ai-fortune-teller, moral-dilemma

### 4.2 AI 增强现有游戏

为现有 112 款游戏添加 AI 功能（非破坏性叠加，用户可开关）：

| 游戏 | 增强类型 | 实现方式 |
|------|---------|---------|
| Chess / Chinese Chess | AI 对手人格化 | 新增 `src/hooks/useAIPersonality.ts`，包装现有 AI 逻辑 |
| Sudoku / Nonogram | AI 提示系统（解释思路） | 新增 `src/hooks/useAIHint.ts` |
| Wordle | AI 每日主题词 + 策略建议 | 扩展现有 Wordle 组件 |
| Mastermind | AI 对手使用不同策略 | 新增 `src/hooks/useAIStrategy.ts` |

### 4.3 Feed/发现系统

- 首页新增 "AI Games" 分类卡片
- 新增 `/hubs/ai-games/` hub 页面（复用现有 hubPages 模式，扩展 `src/data/hubPages.ts`）
- "Today's AI Story" 每日推荐

### 4.4 分享增强

扩展 `ShareModal.tsx`：
- 故事结局卡片："I survived the AI Horror Story with 23% sanity left!"
- Personality Quiz 结果图（维度雷达图 + emoji 摘要）
- 一键复制文字 + 分享到社交媒体

### 4.5 程序化 AI 游戏页面

参考现有 `src/data/gameVariants.ts` 的变体模式，创建 `src/data/storyVariants.ts`：
- 节日变体（Valentine 版 Dating Sim、Halloween 版 Horror）
- 主题变体（硅谷版 Startup Sim、东京版 Dating Sim）
- 每个变体有独立的 URL、SEO 配置、关键词

### 4.6 Phase 2 验证标准

- [ ] 15+ AI 游戏模板上线
- [ ] AI 游戏页面被 Google 索引 > 50 页
- [ ] AI 游戏带来的新用户 > 总流量 10%
- [ ] AI 游戏平均停留时间 > 静态游戏 1.5x
- [ ] 分享率 > 静态游戏 2x

---

## 5. Phase 3（W20+）：评估与规模化

### 5.1 A/B 测试框架

- 通过 Cloudflare Workers 环境变量控制特性开关
- 对比 AI 游戏页面 vs 静态游戏页面的 SEO 表现
- 指标：点击率、停留时间、跳出率、分享率

### 5.2 分析仪表板

- 跟踪：AI API 调用量、模板完成率、最热门选择路径
- 使用 Cloudflare Analytics + 自定义事件

### 5.3 内容生成流水线

- 自动化生成 AI 游戏页面：输入主题关键词 → 自动生成 story template JSON + SEO 配置
- 目标：批量生成 100+ 个 AI 游戏页面
- 每个页面有独特的 SEO 关键词和结构化数据

### 5.4 用户生成内容（UGC）

- 用户创建自定义故事模板（角色、设定、风格）
- 审核队列 → 发布为 `/stories/user/[id]/`

### 5.5 商业化

- **广告**：AI 游戏章节过渡时展示（复用现有广告基础设施）
- **Premium AI**：付费使用更强的模型（Claude/GPT-4），更多选择，更长故事
- **AI Credits**：每月免费 N 次，超出收费

---

## 6. 非功能需求

### 6.1 性能
- 首屏加载（静态 shell）：< 1.5s
- AI API 响应：< 3s（Workers AI 边缘推理）
- 降级：AI 不可用时显示预设文本路径，不白屏
- 单局故事 localStorage 占用 < 100KB

### 6.2 SEO
- 每个 AI 游戏独立 URL（`/stories/[slug]/`）
- 构建时 SSG，非 CSR
- 全部出现在 sitemap.xml 中
- 结构化数据通过 Google 富摘要测试
- 不与现有 `/games/` 页面冲突

### 6.3 安全
- API Key 仅存在于 Workers `env` 对象（与现有 `EMAILJS_*` 模式一致）
- 限流：Cloudflare AI Gateway，30 请求/分钟/IP
- 内容安全：系统提示词约束 + `security.ts` 的 `sanitizeInput` 过滤
- 用户输入仅限预定义选项 ID（Phase 1 不接受自由文本）
- CORS：仅允许 ruleword.com

### 6.4 可访问性
- ARIA live region 通知屏幕阅读器
- 键盘 Tab/Enter 操作选择按钮
- `prefers-reduced-motion` 关闭打字机效果

### 6.5 国际化
- Phase 1：英语为主，中文为辅
- AI 请求通过 `language` 参数切换
- 复用现有 `src/data/locales.ts` 的 UI 翻译体系

---

## 7. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| Workers AI 模型质量不足（无法可靠输出 JSON） | 中 | 高 | W1 先做模型评估；准备 OpenAI/Anthropic 适配器 |
| AI 输出格式不稳定 | 高 | 中 | `response_format: json_object` + 重试 + 降级预设文本 |
| AI 游戏页面不被 Google 索引 | 中 | 高 | 确保静态 shell 有足够内容；主动提交 sitemap |
| AI 生成不当内容 | 中 | 高 | 系统提示词约束 + 输出过滤 + 长度限制 |
| Workers AI 免费额度变化 | 低 | 中 | 监控用量；备用方案约 $0.000625/M token |

---

## 8. 决策框架

### 继续扩大的条件
- Phase 1 完成后，AI 页面 4 周内被 Google 索引
- 用户平均停留时间 > 5 分钟
- API 成本在免费额度内

### 调整方向的条件
- AI 页面 8 周后仍未被索引 → 调整 SEO 策略
- AI 响应质量持续低于预期 → 切换到更强模型
- 用户完成率 < 20% → 简化故事结构

### 停止的条件
- AI 内容对现有页面 SEO 产生负面影响
- Workers AI 免费额度取消且成本不可接受
- 内容质量无法达到可接受水平

---

## 9. 开放问题

| # | 问题 | 建议 |
|---|------|------|
| 1 | Workers AI 的 `@cf/meta/llama-3.1-8b-instruct` 能否可靠输出 JSON？ | W1 优先验证；备选 `@cf/mistral/mistral-7b-instruct-v0.1` |
| 2 | `json_object` response format 是否被 Workers AI 支持？ | 需验证；若不支持则自定义 JSON 解析 |
| 3 | 'story' 是否作为 categories.ts 第 8 个类别？ | 推荐：是，但使用独立 `/stories/` URL 路径 |
| 4 | 是否需要独立 AIStoryWrapper 而非复用 GameWrapper？ | 推荐：独立。GameWrapper 的 `import.meta.glob('./games/*.tsx')` 专为静态游戏设计 |
| 5 | Phase 2 是否支持用户自由文本输入？ | 建议：暂不支持。预定义选项降低复杂度和风险 |

---

## 10. 验证方法

### Phase 1 验收测试
1. 部署后访问 `/stories/ai-dating-simulator/`，页面正常加载，SEO 元素完整
2. 点击 "Start Game"，AI 开始生成故事，打字机效果正常
3. 选择一个选项，AI 响应新内容，状态栏更新
4. 中途刷新页面，游戏进度恢复
5. 完成故事，结局页面正常，分享功能可用
6. 关闭网络/API 不可用，降级路径正常显示
7. Google Search Console 中页面已提交到 sitemap
8. 手机端访问，布局和交互正常

### 持续监控
- Google Search Console：每周检查 AI 页面索引状态和排名
- Cloudflare Analytics：监控 API 调用量和错误率
- 用户行为：GA4 跟踪 AI 游戏的停留时间、完成率、分享率
