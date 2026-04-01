# RuleWord 外链提交管理

自动管理和跟踪 RuleWord 产品在各个平台的外链提交。

## 快速开始

```bash
# 查看当前状态
node track.mjs status

# 查看下一个待提交平台
node track.mjs next

# 打开提交页面
node track.mjs open <platform-id>

# 标记为已提交
node track.mjs submit <platform-id>
```

## 目录结构

```
marketing/submissions/
├── config.json          # 平台配置（名称、URL、优先级等）
├── progress.json        # 提交进度跟踪
├── track.mjs            # 管理脚本
├── templates/           # 提交内容模板
│   ├── product-hunt.md
│   ├── reddit-sideproject.md
│   ├── indiehackers.md
│   ├── hacker-news.md
│   ├── v2ex.md
│   └── generic.md
└── README.md
```

## 平台分类

### 🔥 第1梯队：核心产品目录（必提交）

| 平台 | 优先级 | 状态 |
|------|--------|------|
| Product Hunt | 1 | ⏳ |
| AlternativeTo | 2 | ⏳ |
| Uneed | 3 | ⏳ |
| Dev Hunt | 4 | ⏳ |
| Betalist | 5 | ⏳ |
| Hacker News | 6 | ⏳ |

### 🎮 第2梯队：游戏/工具目录

- Launched!, Toolbase.io, MakerPeak
- Findcool.tools, ToolHunter.ai
- StartupBase, KillerStartups, PitchWall
- 等 20-30 个平台

### 🌐 第3梯队：中文平台

- V2EX（分享创造）
- 即刻（独立开发圈子）
- W2solo
- 掘金
- 少数派

### 💬 第4梯队：Reddit 社区

- r/SideProject ⭐⭐⭐
- r/IMadeThis ⭐⭐⭐
- r/InternetIsBeautiful ⭐⭐⭐
- r/puzzles ⭐⭐⭐
- r/webdev ⭐⭐（仅周六）
- r/gaming ⭐⭐

### 📝 第5梯队：其他平台

- IndieHackers
- dev.to
- Medium

## 提交计划

### Day 1: 核心平台
- [ ] Product Hunt（需要预约发布日期）
- [ ] Reddit r/SideProject

### Day 2: 社区平台
- [ ] IndieHackers
- [ ] Hacker News (Show HN)

### Day 3: 目录平台
- [ ] AlternativeTo
- [ ] Uneed
- [ ] Dev Hunt
- [ ] Betalist

### Week 1: 工具目录站
- [ ] Launched
- [ ] Toolbase.io
- [ ] MakerPeak
- [ ] 等 20-30 个平台

### Week 1: 中文平台
- [ ] V2EX
- [ ] 即刻
- [ ] W2solo
- [ ] 掘金

### Week 2: 内容平台
- [ ] Medium 文章
- [ ] dev.to 文章

## 工作流程

### 1. 提交前准备

```bash
# 查看下一个待提交平台
node track.mjs next

# 查看该平台的提交模板
cat templates/<template-name>.md
```

### 2. 执行提交

```bash
# 打开提交页面
node track.mjs open <platform-id>

# 手动完成提交...
```

### 3. 更新状态

```bash
# 标记为已提交
node track.mjs submit <platform-id>

# 如果通过了
node track.mjs approve <platform-id>

# 如果被拒绝了
node track.mjs reject <platform-id>
```

### 4. 查看进度

```bash
# 查看总体状态
node track.mjs status

# 生成报告
node track.mjs report
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `node track.mjs status` | 查看总体进度 |
| `node track.mjs list` | 列出所有平台 |
| `node track.mjs list tier1` | 列出第1梯队平台 |
| `node track.mjs next` | 显示下一个待提交平台 |
| `node track.mjs open <id>` | 打开提交页面 |
| `node track.mjs submit <id>` | 标记为已提交 |
| `node track.mjs approve <id>` | 标记为已通过 |
| `node track.mjs reject <id>` | 标记为被拒绝 |
| `node track.mjs report` | 生成进度报告 |

## 平台 ID 列表

### Tier 1
- `product-hunt` - Product Hunt
- `alternative-to` - AlternativeTo
- `uneed` - Uneed
- `dev-hunt` - Dev Hunt
- `betalist` - Betalist
- `hacker-news` - Hacker News

### Tier 2
- `launched` - Launched!
- `toolbase` - Toolbase.io
- `makerpeak` - MakerPeak
- `findcooltools` - Findcool.tools
- `toolhunter` - ToolHunter.ai
- `startupbase` - StartupBase
- `killerstartups` - KillerStartups
- `pitchwall` - PitchWall

### Tier 3 (中文)
- `v2ex` - V2EX
- `jike` - 即刻
- `w2solo` - W2solo
- `juejin` - 掘金
- `sspai` - 少数派

### Tier 4 (Reddit)
- `reddit-sideproject` - r/SideProject
- `reddit-imadethis` - r/IMadeThis
- `reddit-internetIsBeautiful` - r/InternetIsBeautiful
- `reddit-webdev` - r/webdev
- `reddit-gaming` - r/gaming
- `reddit-puzzles` - r/puzzles

### Tier 5
- `indiehackers` - IndieHackers
- `devto` - dev.to
- `medium` - Medium

## 最佳实践

### Product Hunt
1. 提前 1-2 周预约发布日期
2. 周二、周三、周四发布效果最佳
3. 发布当天 00:01 PST 发布
4. 准备好 Maker 评论和回复
5. 通知朋友和支持者

### Hacker News
1. 美东时间 8-9 AM 发布
2. 标题必须以 "Show HN:" 开头
3. 保持内容简洁，避免营销语言
4. 快速回复评论
5. 包含技术细节

### Reddit
1. 周一到周五，美东 6-8 AM 发布
2. 发布后 1 小时内回复所有评论
3. 不要在标题中提 self-promotion
4. 不要购买点赞或自顶

### V2EX
1. 选择「分享创造」节点
2. 账号需要一定活跃度
3. 及时回复评论
4. 不要自顶帖子

## 注意事项

1. **不要一次性提交所有平台** - 分批进行，每批 2-3 个
2. **记录每个平台的反馈** - 便于改进产品
3. **关注最佳发布时间** - 不同平台有不同的活跃时段
4. **准备好多语言版本** - 英文和中文内容都要准备
5. **保持互动** - 发布后及时回复评论
