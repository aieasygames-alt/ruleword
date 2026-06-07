# Ruleword SEO 优化计划

> 基于 Google Search Console 数据分析（2026/5/7 - 6/3）
> 数据来源：搜索表现、AI 引用、关键词排名、国家分布

---

## 数据概况

| 指标 | 数值 | 备注 |
|---|---|---|
| 总展示数 | ~2,613 | 上升趋势，6月初达 150+/天 |
| 总点击数 | ~34 次 | CTR 偏低 |
| 平均 CTR | ~1.3% | 远低于行业平均 3-5% |
| AI Citations | 254 次 | AI 搜索引用远超 Google 点击 |
| 有排名关键词 | 264 个 | 长尾词为主 |
| 被引用页面数 | 19 个 | 占全站 362 页面的一小部分 |

---

## 核心问题

### 1. 排名在 7-10 名 = 几乎零点击

大部分关键词排名在第 7-10 位（Google 第二页底部）。CTR 从第 1 名的 30%+ 骤降到第 8 名的 <2%。提升排名 3-5 位就能带来流量翻倍。

### 2. 高 AI 引用 ≠ 高网站流量

| 来源 | Boggle 页面 |
|---|---|
| AI Citations | 61 次 |
| Google 点击 | 8 次 |

AI 搜索引用内容 254 次，但 Google 点击只有 34 次。用户在 AI 回答中直接得到了答案，不需要访问网站。

### 3. 新页面（故事/变体）零索引

15 个故事页 + 8 个变体页 = 23 个新页面，搜索数据中只出现 1 个（ai-convince）。Google 尚未发现或排名这些页面。

### 4. 首页几乎无搜索存在感

首页 `/` 仅 4 印象、3 点击，说明品牌词搜索量极低，流量完全依赖长尾词。

---

## 高优先级优化

### 1. Boggle 页面优化

**现状**：508 印象 | 8 点击 | CTR 1.57% | 排名 ~8.0 | AI 引用 61 次

**优化动作**：

- [ ] **Title 优化**：确保包含 "Play Boggle Online Free - Word Game"
- [ ] **Meta Description 重写**：加入行动号召 "Play Boggle free in your browser — no download"
- [ ] **添加 FAQ Schema**：
  - "How to play Boggle?"
  - "What are the Boggle rules?"
  - "How is Boggle scored?"
  - "What is a Boggle grid size?"
- [ ] **补充长尾内容**：添加 4x4 boggle、5x5 boggle、Boggle strategy、Boggle word list 等内容段落
- [ ] **内链建设**：从 `/blog/japanese-logic-puzzles-guide/`（CTR 11.59%）和 hub 页面添加内链

**预期效果**：排名从 8→5 以内，CTR 从 1.57%→5%+

---

### 2. Japanese Logic Puzzles 博客模式复制

**现状**：`/blog/japanese-logic-puzzles-guide/` CTR 11.59%，排名 3.7 — 全站最佳表现

**优化动作**：

- [ ] **创建系列指南博客**：
  - "Best Number Puzzles Online Free — Play in Your Browser"
  - "How to Solve Heyawake — Complete Strategy Guide"
  - "Slitherlink Tips and Techniques for Beginners"
  - "Japanese Puzzle Types — A Complete Guide"
- [ ] **每个日文谜题页面添加结构化内容**：
  - "What is {puzzle_name}?"
  - "How to solve {puzzle_name} — step by step"
  - "{puzzle_name} rules explained"
  - "{puzzle_name} tips and strategies"
- [ ] **在博客中内链到对应游戏页面**（heyawake, slitherlink, shakashaka, aqre, suguru 等）

**预期效果**：复制 japanese-logic-puzzles-guide 的成功模式，这些长尾词竞争低但精准

---

### 3. 提升现有接近首页的页面排名

以下页面已有印象但排名在 5-9 位，提升 2-3 位即可进入首页：

| 页面 | 当前排名 | 目标排名 | 当前 CTR |
|---|---|---|---|
| `/games/crosswordle/` | 7.9 | ≤5 | 0% |
| `/guides/2048/` | 7.3 | ≤5 | 0% |
| `/games/suguru/` | 8.4 | ≤6 | 0% |
| `/games/heyawake/` | 5.1 | ≤4 | 1.47% |
| `/games/aqre/` | 5.5 | ≤4 | 0% |
| `/games/shakashaka/` | 3.4 | ≤3 | 0% |

**优化动作**：

- [ ] 为每个页面添加 **FAQ 区域**（5-8 个常见问题），用 FAQPage schema 标记
- [ ] 补充 **"How to Play"** 和 **"Tips & Strategies"** 段落，目标 500+ 字的独特内容
- [ ] 添加 **BreadcrumbList schema**（如未添加）
- [ ] 确保 **meta description** 包含目标关键词和行动号召
- [ ] 为每个游戏创建 **guide 页面**（如 `/guides/suguru/`、`/guides/heyawake/`），从 guide 内链到 game 页面

---

## 中优先级优化

### 4. 加速故事/变体页面索引

**现状**：23 个新页面（15 故事 + 8 变体）几乎无搜索表现

**优化动作**：

- [ ] **Google Search Console 手动提交**：批量提交所有 `/stories/` 和 `/stories/*/` URL
- [ ] **内链建设**：
  - 首页添加 "AI Story Games" 区域（链接到 stories index）
  - 每个 AI 故事页之间添加 "More AI Stories" 互链
  - 博客文章中自然提及并链接到故事页
- [ ] **Sitemap 验证**：确认所有新页面在 sitemap.xml 中
- [ ] **添加 "What is AI Story Game" 博客文章**：解释 AI 互动故事概念，内链到各故事页

---

### 5. 故事页面 SEO 内容增强

**现状**：故事页面大量内容在 JS React 组件中，Google 可能无法完全理解

**优化动作**：

- [ ] 每个故事页面添加 **500+ 字的独特 SEO 描述内容**（在 `<section>` SEO 区域）
- [ ] 添加 **FAQ**（5 个以上），使用 FAQPage schema
- [ ] 为每个故事类型创建 **landing page 式的介绍**：
  - "What is AI Dating Simulator?"
  - "Why Play AI Story Games?"
  - "How AI Story Games Work"
- [ ] 确保 **每个故事页面有独特的 title 和 description**（非模板化）
- [ ] 添加 **VideoGame schema**（部分已有）+ **HowTo schema**

---

### 6. 利用已有 AI 引用优势

**现状**：AI 搜索引用 254 次，但用户不访问网站

**优化动作**：

- [ ] 在页面中强化 **"Play Now" / "Play Free in Browser"** 的行动号召
- [ ] 每个游戏页面添加 **互动截图** 或 **GIF 预览**，让 AI 引用时附带视觉内容
- [ ] 确保 OG 图片高质量（已有 generate-images.ts 自动生成）
- [ ] 在 meta description 中突出 **"No download required" / "Free" / "Play online"**

---

## 长期优化

### 7. 内容差异化策略

**目标**：提供 AI 无法直接回答的内容价值

**优化动作**：

- [ ] **互动内容不可替代性**：在页面中突出"这个内容只能通过体验获得"
- [ ] **用户生成内容**：添加游戏评论区、高分分享（已有 ShareModal）
- [ ] **实时数据**：每日挑战结果统计、"Today's most played" 等
- [ ] **独家内容**：策略视频、交互式教程、难度排行

---

### 8. 国际化 SEO

**现状**：中国 97 印象/4 点击（4.12% CTR），来自 "佛系消消消" 关键词

**优化动作**：

- [ ] 为 Bullpen 游戏创建 **中文 SEO 内容**（攻略、规则说明）
- [ ] 验证 `zh-CN` 页面的 hreflang 标签配置
- [ ] 考虑为热门中文关键词创建独立中文 landing page
- [ ] 日文谜题可以考虑添加日语内容（jp 有 16 印象）

---

### 9. 程序化 SEO 扩展

**现状**：gameVariants 和 storyVariants 已创建，但变体页面零索引

**优化动作**：

- [ ] 创建更多 **guide 变体**：
  - `/guides/boggle/`（目前只有 `/games/boggle/`）
  - `/guides/crosswordle/`
  - `/guides/suguru/`
- [ ] 为每个游戏变体添加 **独特内容**（不只是换标题）
- [ ] 创建 **hub 页面间的交叉链接**

---

## 关键词机会清单

以下关键词有搜索量但排名较低，值得重点优化：

| 关键词 | 印象 | 当前排名 | 页面 | 优化潜力 |
|---|---|---|---|---|
| `boggle online free` | 62 | 8.0 | /games/boggle/ | ⭐⭐⭐ |
| `2048 strategy guide` | 79 | 7.2 | /guides/2048/ | ⭐⭐⭐ |
| `crosswordle` | 26 | 8.4 | /games/crosswordle/ | ⭐⭐⭐ |
| `slitherlink` | 42 | 9.0 | /games/slitherlink/ + /guides/slitherlink/ | ⭐⭐ |
| `suguru game` | 18 | 7.8 | /games/suguru/ | ⭐⭐ |
| `heyawake` | 40 | 5.2 | /games/heyawake/ | ⭐⭐⭐ |
| `aqre` | 18 | 5.7 | /games/aqre/ | ⭐⭐ |
| `shakashaka` | 4 | 3.4 | /games/shakashaka/ | ⭐⭐⭐ |
| `skyscrapers game` | 21 | 8.0 | /games/skyscrapers/ | ⭐⭐ |
| `mastermind game online` | 5 | 8.4 | /games/mastermind/ + /guides/mastermind/ | ⭐⭐ |
| `japanese logic puzzles` | 8 | 2.4 | /blog/japanese-logic-puzzles-guide/ | ⭐⭐⭐ |
| `boggle grid` | 27 | AI only | /games/boggle/ | ⭐⭐⭐ |

---

## 预期成果（90 天）

| 指标 | 当前 | 目标 | 方法 |
|---|---|---|---|
| 日均展示 | ~130 | ~500 | 新页面索引 + 排名提升 |
| 日均点击 | ~1 | ~15-20 | CTR 优化 + 排名进入前 5 |
| AI 引用/月 | ~254 | ~500+ | 新故事页被 AI 发现 |
| 被索引页面 | ~50 | ~150+ | 故事/变体/guide 页面索引 |
| CTR 平均 | 1.3% | 3-4% | 排名提升 + snippet 优化 |
