# GSC 搜索表现修复与游戏逻辑 QA 计划

> 数据基线：Google Search Console，2026-06-09 至 2026-06-15  
> 基线指标：45 点击、5,440 展示、0.83% CTR  
> 技术 SEO 修复部署日期：2026-06-18

## 目标

1. 优先提升已经排名 6–12、但 CTR 明显偏低的页面。
2. SEO 修改涉及的游戏必须通过真实玩法验证，避免把流量导向损坏或规则错误的游戏。
3. 将游戏规则从 React UI 中抽成可复用的纯逻辑模块，采用 TDD 的 RED → GREEN → REFACTOR 循环。
4. 建立覆盖桌面与移动端的关键游戏 Playwright 冒烟测试。

## 范围与优先级

### P0：先验证游戏，再改搜索摘要

| 页面 | GSC 信号 | SEO 动作 | 必测游戏 |
|---|---|---|---|
| `/games/shakashaka/` | 259 展示，排名 7.62，CTR 0.39% | 覆盖 `Shakashaka` 与 `Shaka Shaka Puzzle` 拼写；重写 Title/H1/首段 | Shakashaka |
| `/games/threes/` | 141 展示，排名 11.89；`threes online` 80 展示 0 点击 | Title 前置 `Threes Online`；补充与 2048 的差异；增加内链 | Threes、2048 |
| `/games/crosswordle/` | 73 展示，排名 12.44；相关查询排名约 10 | 对齐 `crosswordle scrambled`、`crossword meets wordle` | Crosswordle |
| `/blog/wordle-vs-connections-vs-spelling-bee/` | 98 展示，排名 9.18，0 点击 | 标题改用用户真实的并列查询语序；优化摘要 | Wordle、Connections、Spelling Bee 基础加载与交互 |

### P1：攻略页搜索意图修复

| 页面 | GSC 信号 | SEO 动作 | 必测游戏 |
|---|---|---|---|
| `/guides/sokoban/` | 88 展示，排名 8.27 | 强化 `solutions`、`push boxes to goals`、步骤型内容 | Sokoban |
| `/guides/15-puzzle/` | 43 展示，排名 9.05，0 点击 | 强化 `solution steps`、合法移动与可解性说明 | 15 Puzzle |
| `/guides/minesweeper/` | 42 展示，排名 9.45，0 点击 | 精简摘要，突出 patterns、safe first click、strategy | Minesweeper |
| `/games/2048/` | 23 展示，排名 8.61，0 点击 | 检查标题长度与品牌后缀；强化即时可玩意图 | 2048 |
| `/guides/flow-free/` | 21 展示，排名 8.24，0 点击 | 强化连接所有颜色且填满棋盘的规则说明 | Flow Free |

### P2：已有高 CTR 页面保护性验证

这些页面暂不大改 SEO，只补玩法回归测试，防止后续修改破坏表现：

- `/games/memory-matrix/`
- `/games/memory-grid/`
- `/games/chinese-chess/`

## 实施原则

### TDD 垂直切片

每款游戏独立完成一个小循环：

1. RED：先写一个描述用户行为的失败测试。
2. GREEN：抽取或修复最少量逻辑，让测试通过。
3. REFACTOR：在测试保护下整理组件。
4. 增加该游戏的 Playwright 核心交互测试。
5. 该游戏测试全绿后，才修改对应 SEO 文案。

不一次性抽取所有游戏逻辑，也不复制组件内部算法到测试文件。

### 纯逻辑模块建议

新增目录：

```text
astro-app/src/games/
  shakashaka/logic.ts
  threes/logic.ts
  crosswordle/logic.ts
  game-2048/logic.ts
  flow-free/logic.ts
  memory-matrix/logic.ts
  memory-grid/logic.ts
  sokoban/logic.ts
  fifteen-puzzle/logic.ts
  minesweeper/logic.ts
  chinese-chess/logic.ts
```

React 组件只负责状态、渲染、输入事件和音效；棋盘变换、合法性判断、胜负条件放入纯函数。

## 游戏逻辑测试矩阵

### 1. Shakashaka

风险：当前实现明确采用“简化规则模型”，需确认产品规则与页面文案完全一致。

单元测试：

- 黑色提示格不可放置三角形。
- 普通格按 `空 → TL → TR → BL → BR → 空` 循环。
- 2×2 完全填充区域判定非法。
- 提示数字只统计正交相邻三角形。
- 白色连通区域必须构成轴对齐矩形。
- 每个内置谜题存在至少一个能通过规则检查的解。
- Reset 恢复当前谜题初始状态；Next 切换谜题并清除完成状态。

E2E：

- 页面加载后棋盘可见。
- 点击白格能依次改变三角方向。
- 点击黑格不改变状态。
- 错误答案点击 Check 出现规则错误。
- 使用测试夹具加载已知解后显示完成状态。
- 桌面和 Pixel 5 尺寸均可操作 Check/Reset。

### 2. Threes

单元测试：

- `1 + 2 → 3`，`2 + 1 → 3`。
- `3 + 3 → 6`，相同且大于等于 3 的数字才能合并。
- `1 + 1`、`2 + 2`、`3 + 6` 不合并。
- 一次移动中同一瓦片不能连续合并两次。
- 左右上下移动产生正确棋盘。
- 无变化的移动不生成新瓦片。
- 有效移动只生成一个 next tile。
- 满棋盘且无合法合并时进入 Game Over。
- Daily seed 在同一天生成相同初始棋盘。

E2E：

- 键盘和屏幕方向按钮都能改变棋盘。
- 有效移动后瓦片数或分数发生可观察变化。
- New Game 清零分数并生成新局。
- 移动端方向按钮可点击且不造成页面横向滚动。

### 3. Crosswordle

单元测试：

- 生成网格保留答案字母多重集合。
- 每个交叉点的两个单词字母必须一致。
- 交换两个有效格后字母互换，交换次数减一。
- 正确位置、错误位置、错误字母状态准确。
- 完整正确网格触发胜利。
- Undo 恢复棋盘和剩余交换次数。
- Daily puzzle 日期索引稳定。

E2E：

- 选择两个字母格可完成交换。
- 交换计数变化。
- Undo 恢复交换前状态。
- New Puzzle 生成可操作棋盘。
- Challenge URL 加载后谜题可用。

### 4. 2048

单元测试：

- `[2,2,2,2] → [4,4,0,0]`，不得变成 `[8,0,0,0]`。
- `[2,0,2,4] → [4,4,0,0]`。
- 四个方向旋转与滑动结果正确。
- 分数等于本次新合并数字之和。
- 无变化移动不生成新瓦片。
- 达到 2048 触发胜利。
- 满棋盘有相邻可合并时不 Game Over；完全无合法移动时 Game Over。

E2E：

- 键盘 Arrow 与触摸滑动均产生移动。
- Score 在合并后增加。
- New Game 重置棋盘、分数和胜利状态。
- Continue After Win 不阻塞后续移动。

### 5. Sokoban

单元测试：

- 玩家不能穿墙。
- 玩家可移动到空地和目标格。
- 箱子只能推，不能拉。
- 箱子后方被墙或箱子占据时不能推动。
- 箱子进入目标后变为 `*`；离开目标后恢复目标格。
- 所有箱子位于目标时获胜。
- Undo 同时恢复玩家、箱子、步数和推动次数。
- 每个内置关卡箱子数等于目标数。
- 对全部内置关卡运行求解器或至少验证无静态死局、存在已知解路径。

E2E：

- 键盘和屏幕方向键均可移动。
- 完成一次推箱后 moves 与 pushes 正确增加。
- Undo 恢复上一步。
- Reset 恢复初始关卡。
- 使用最短已知路径完成第一关并出现胜利提示。

### 6. 15 Puzzle

单元测试：

- 已完成棋盘被识别为 solved。
- 只有与空格正交相邻的方块可以移动。
- 移动后仅目标方块与空格互换。
- 打乱棋盘一定可解且不是完成状态。
- 固定 seed 生成相同棋盘。
- 完成最后一步后 moves 正确增加并触发胜利。

E2E：

- Practice 和 Daily 都能开始。
- 点击合法方块会移动，非法方块不移动。
- Move 计数只在合法移动时增加。
- 通过预置近完成棋盘执行最后一步后显示完成。

### 7. Minesweeper

风险：当前组件先生成含雷棋盘，首次点击后重新生成安全棋盘；应确保首次点击周围 3×3 必定安全且雷数不变。

单元测试：

- 棋盘雷数严格等于难度配置。
- 每个非雷格 adjacentMines 正确。
- 首次点击及周围 3×3 无雷。
- 空白格 flood reveal 不穿过数字边界。
- Flag 不可超过雷数，已揭示格不可标旗。
- 点击雷触发失败并展示雷。
- 所有非雷格揭示后触发胜利。
- Daily seed 稳定且不同难度棋盘不同。

E2E：

- 首次点击不会 Game Over。
- 右键/长按可以标旗和取消标旗。
- New Game 重置计时、旗帜和状态。
- Easy/Medium/Hard 切换后棋盘尺寸正确。

### 8. Flow Free

单元测试：

- 路径只能在正交相邻格延伸。
- 路径必须从同色端点开始并在同色端点结束。
- 新路径覆盖旧路径时状态一致。
- 不同颜色路径不可非法交叉。
- 所有颜色连接且棋盘填满才算完成。
- 现有 30 个关卡继续通过求解器验证。

E2E：

- 鼠标拖动和触摸拖动都能绘制路径。
- 完成一条颜色路径后保持显示。
- Reset 清空路径但保留端点。
- 载入已知可解的第一关路径后出现 Level Complete。

### 9. Memory Matrix

单元测试：

- 每关 pattern 索引唯一且在网格范围内。
- 用户选择顺序不影响集合判定（若产品规则如此）。
- 完全正确时增加分数和等级。
- 错误答案扣一条生命。
- 生命归零后重置到初始状态。
- 网格升级规则不会生成越界 pattern。

E2E：

- Start 后依次进入 showing 和 guessing。
- showing 阶段不能提交答案。
- guessing 阶段点击格子可选择/取消。
- 正确和错误提交分别进入预期结果状态。

### 10. Memory Grid

单元测试：

- 序列长度与等级规则一致。
- 用户必须按顺序输入。
- 正确完整序列进入下一等级。
- 第一个错误输入立即扣生命且停止本轮。
- 生命归零进入 Game Over。
- Start Again 清空旧序列与输入。

E2E：

- Start 后序列动画出现。
- 动画结束前格子不可误输入。
- 使用可控随机数完成一轮正确输入。
- 故意点错后生命减少。

### 11. Chinese Chess

单元测试：

- 将/帅只能在九宫内移动。
- 士不能离开九宫。
- 象不能过河且象眼被堵时不可移动。
- 马腿被堵时对应移动非法。
- 炮吃子必须隔一个棋子，普通移动路径必须为空。
- 兵过河前后移动规则正确。
- 两将照面为非法局面。
- 任何走法不能让己方将帅处于被将状态。
- 将死与无合法走法判断正确。
- AI 返回的走法必须属于合法走法集合。

E2E：

- 选择棋子后只显示合法目标。
- 执行合法走法后轮次切换。
- AI 模式下黑方在合理时间内走一步。
- Reset 恢复初始棋盘。

### 12. Wordle、Connections、Spelling Bee

这些游戏仅因博客 SEO 修改被间接涉及，先做保护性 E2E：

- 页面正常加载。
- Wordle 接收字母输入并显示在当前行。
- Connections 可选择 4 个词并提交。
- Spelling Bee 点击字母可组成单词并提交/清空。

## E2E 基础设施修复

当前 `e2e/games.spec.ts` 的清单已经过时：

- 文件仍标注 “All 79 Games”，站点实际已有 114 款。
- `flow-free`、`memory-grid` 等目标游戏未纳入全量加载测试。
- 多数测试只判断页面存在，无法证明游戏能玩。

改造方案：

1. 从统一游戏数据源动态生成游戏 slug，禁止维护手写清单。
2. 给游戏核心控件增加稳定的 `data-testid`，避免依赖 Tailwind class。
3. 将测试拆分：
   - `game-load.spec.ts`：全游戏加载、无 pageerror、核心容器可见。
   - `game-critical-paths.spec.ts`：本计划涉及游戏的真实操作。
   - `game-mobile.spec.ts`：触摸操作、无横向滚动、关键按钮可点击。
4. CI 使用 Chromium Desktop + Pixel 5；关键游戏失败时保留 trace 和 screenshot。

## SEO 修改清单

所有文案修改必须满足：

- Title 约 50–65 个英文字符，主关键词尽量前置。
- Description 约 120–160 个字符，说明免费、在线、无需下载以及独特玩法。
- H1 与 Title 意图一致，但不逐字重复。
- 页面首段自然包含 GSC 实际查询。
- 不为同一查询创建新薄页。

计划修改：

1. `src/data/seo.ts`
   - Shakashaka、Threes、Crosswordle、2048。
2. `src/data/blogPosts.ts`
   - Wordle / Connections / Spelling Bee 比较文章。
3. `src/data/gameGuidesSEO.ts`
   - Sokoban、15 Puzzle、Minesweeper、Flow Free。
4. 相关 Hub、游戏推荐和攻略交叉链接
   - 使用 `play Threes online`、`Sokoban solutions` 等精准但自然的锚文本。

## 分阶段交付

### Phase 1：测试基础设施与 P0 游戏

- 动态全游戏加载清单。
- 抽取并测试 Shakashaka、Threes、Crosswordle、2048 逻辑。
- 增加对应 Playwright 关键路径。
- 修复发现的玩法问题。
- 测试通过后更新 P0 SEO 文案。

验收：

- 4 款游戏逻辑单测和桌面/移动 E2E 全绿。
- 全游戏 slug 都进入加载测试。
- 无新增 console/page errors。

### Phase 2：攻略对应游戏

- Sokoban、15 Puzzle、Minesweeper、Flow Free。
- 每款按 RED→GREEN 单独提交。
- 更新攻略标题、描述和对应正文区块。

验收：

- 第一关/第一局存在可重复的成功路径。
- 所有内置 Flow Free 关卡继续可解。
- Minesweeper 首次点击安全属性经过随机与固定 seed 测试。

### Phase 3：高 CTR 页面保护

- Memory Matrix、Memory Grid、Chinese Chess。
- 补逻辑模块和关键 E2E。
- 不改变搜索摘要，除非测试发现内容与玩法不一致。

### Phase 4：上线与 GSC 验证

- 运行完整 Vitest。
- 运行关键 Playwright Desktop + Mobile。
- 运行生产构建。
- 部署后检查 title、description、canonical、robots、结构化数据。
- 记录部署日期。
- 14 天和 28 天分别导出同口径 GSC 数据。

## GSC 成功指标

以 2026-06-09 至 2026-06-15 为基线：

- 全站 CTR：0.83% → 首阶段目标 1.2%。
- Shakashaka CTR：0.39% → 2% 以上，排名不低于 10。
- Threes：`threes online` 从 0 点击提升到有稳定点击，平均排名进入前 10。
- Wordle 比较博客：98 展示 0 点击 → CTR 至少 1.5%。
- Sokoban Guide：CTR 1.14% → 3%。
- P0/P1 游戏关键路径测试通过率：100%。
- 全游戏加载测试覆盖：当前站点全部游戏，不能再使用固定 “79 games” 清单。

## 提交建议

保持小提交，示例：

1. `test(games): derive load coverage from game registry`
2. `test(shakashaka): specify puzzle validation behavior`
3. `fix(shakashaka): align rule engine with playable puzzles`
4. `seo(shakashaka): target shaka shaka puzzle queries`
5. `test(threes): cover merges movement and game over`
6. `seo(threes): target threes online intent`

每个 SEO 提交必须建立在对应游戏测试已经全绿之后。
