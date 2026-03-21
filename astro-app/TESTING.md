# RuleWord 游戏测试方案

## 📊 测试概览

| 测试类型 | 工具 | 数量 | 自动化 |
|----------|------|------|--------|
| E2E 页面加载测试 | Playwright | 79 个游戏 | ✅ |
| E2E 功能测试 | Playwright | 8 核心游戏 | ✅ |
| 单元测试 | Vitest | 按需 | ✅ |
| 分类页测试 | Playwright | 7 分类 | ✅ |
| 多语言测试 | Playwright | 2 种语言 | ✅ |
| 移动端测试 | Playwright | 关键页面 | ✅ |

## 🚀 运行测试

```bash
# 进入项目目录
cd astro-app

# 运行所有 E2E 测试
pnpm test:e2e

# 运行特定测试文件
pnpm exec playwright test e2e/games.spec.ts

# 带 UI 运行（调试用）
pnpm test:e2e:ui

# 生成测试报告
pnpm exec playwright show-report
```

## 📋 手动测试清单

### 每款游戏必测项

- [ ] **页面加载** - 游戏在 5 秒内加载完成
- [ ] **返回按钮** - 点击可返回首页
- [ ] **语言切换** - 中英文切换正常
- [ ] **基本操作** - 游戏核心功能可用
- [ ] **移动端** - 在手机上可正常游玩

### 按分类的详细测试项

#### 文字游戏 (Word Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Wordle | 输入字母 | 显示颜色反馈（绿/黄/灰） |
| Crosswordle | 交换字母 | 字母正确交换 |
| Hangman | 猜字母 | 正确显示猜测结果 |
| Boggle | 找词 | 可选择连续字母 |
| Word Scramble | 输入答案 | 验证正确/错误 |

#### 逻辑游戏 (Logic Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Sudoku | 输入数字 | 显示冲突提示 |
| 2048 | 方向键 | 方块正确移动和合并 |
| Minesweeper | 点击格子 | 正确显示数字/地雷 |
| Nonogram | 填充格子 | 显示隐藏图片 |
| Skyscrapers | 放置建筑 | 验证规则 |

#### 策略游戏 (Strategy Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Chess | 移动棋子 | 合法移动才可执行 |
| Tic-Tac-Toe | 落子 | AI 正确响应 |
| Connect Four | 投币 | 检测四子连线 |
| Reversi | 翻转棋子 | 正确计算翻转 |
| Battleship | 发射 | 命中/未命中反馈 |

#### 街机游戏 (Arcade Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Tetris | 旋转/下落 | 方块正确响应 |
| Snake | 方向控制 | 蛇正确移动 |
| Pac-Man | 移动/吃豆 | 正确计分 |
| Space Invaders | 射击 | 子弹正确发射 |

#### 记忆游戏 (Memory Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Memory | 翻牌配对 | 正确匹配消除 |
| Simon Says | 跟随序列 | 序列正确验证 |
| Reaction Test | 等待绿色 | 记录反应时间 |

#### 技能游戏 (Skill Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Typing Test | 输入单词 | WPM 正确计算 |
| Aim Trainer | 点击目标 | 准确率正确计算 |
| Chimp Test | 记忆位置 | 等级正确提升 |
| Speed Math | 输入答案 | 即时验证 |
| Color Match | 选择颜色 | 斯特鲁普效应正确 |

#### 拼图游戏 (Puzzle Games)
| 游戏 | 测试项 | 预期结果 |
|------|--------|----------|
| Mahjong Solitaire | 配对移除 | 正确判断可点击 |
| Sokoban | 推箱子 | 碰撞检测正确 |
| Match-3 | 交换宝石 | 消除和下落正确 |
| Bubble Shooter | 发射泡泡 | 碰撞检测正确 |
| Jigsaw | 交换拼图块 | 正确检测完成 |

## 🧪 单元测试示例

```typescript
// tests/games/sudoku.test.ts
import { describe, it, expect } from 'vitest'

describe('Sudoku Logic', () => {
  it('should validate correct placement', () => {
    // Test sudoku validation logic
  })

  it('should detect conflicts', () => {
    // Test conflict detection
  })
})

// tests/games/game2048.test.ts
describe('2048 Logic', () => {
  it('should merge tiles correctly', () => {
    // Test tile merging
  })

  it('should spawn new tile after move', () => {
    // Test new tile spawning
  })
})
```

## 📱 移动端测试设备

| 设备 | 尺寸 | 测试重点 |
|------|------|----------|
| iPhone SE | 375×667 | 基本可用性 |
| iPhone 12 | 390×844 | 触控响应 |
| iPad | 768×1024 | 平板布局 |
| Android | 360×640 | 兼容性 |

## 🔄 CI/CD 集成

```yaml
# .github/workflows/test.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## 📈 测试覆盖率目标

| 指标 | 目标 | 当前 |
|------|------|------|
| 页面加载测试 | 100% | 100% |
| 核心功能测试 | 80% | ~50% |
| 单元测试 | 50% | 0% |
| 移动端测试 | 100% | 100% |

## 🐛 常见问题排查

### 游戏无法加载
1. 检查控制台错误
2. 验证组件导入路径
3. 确认 GameWrapper 注册

### 样式异常
1. 检查 Tailwind 类名
2. 验证 CSS 加载
3. 测试不同屏幕尺寸

### 多语言不生效
1. 检查 URL 参数
2. 验证 localStorage
3. 确认翻译文件
