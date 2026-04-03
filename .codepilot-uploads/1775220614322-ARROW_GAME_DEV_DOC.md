# 箭头消除游戏开发文档

## 项目概述

### 游戏名称
**Arrow Puzzle** (箭头消除)

### 项目信息
| 项目 | 内容 |
|------|------|
| 目标平台 | ruleword.com (Web) |
| 参考游戏 | 箭了又箭（微信小游戏）|
| 游戏类型 | 路径规划解谜 |
| 开发周期 | 14天 |

---

## 游戏设计

### 核心玩法

**基本规则：**
- 玩家点击箭头，箭头沿自身指向方向直线滑行
- 箭头滑出网格即消除
- 碰到障碍物则弹回原位（非阻挡）
- 所有箭头消除即通关

**操作：**
- 点击/触摸箭头触发移动
- 支持撤销功能（记录历史步骤）
- 支持提示功能（高亮推荐下一步）

### 难度设计（四层递进）

```
┌─────────┬─────────────────┬──────────────┐
│  层级   │      机制       │   核心挑战   │
├─────────┼─────────────────┼──────────────┤
│ 第1层   │ 单方向箭头      │ 找消除顺序   │
│ 第2层   │ 多方向箭头      │ 策略决策     │
│ 第3层   │ 大网格+密集箭头 │ 割草爽感     │
│ 第4层   │ 数字方块障碍    │ 损失厌恶策略 │
└─────────┴─────────────────┴──────────────┘
```

**失误系统：**
- 默认3次失误机会
- 第4次失误时弹出"看广告复活"
- 通关后解锁下一关

---

## 技术架构

### 技术栈

```
前端: TypeScript + HTML5 Canvas
构建: Vite
引擎: 自研轻量级引擎（零第三方依赖）
部署: 单JS文件嵌入 Astro 页面
```

### 项目结构

```
arrow-puzzle/
├── src/
│   ├── core/           # 核心引擎
│   │   ├── Game.ts     # 游戏主循环
│   │   ├── Grid.ts     # 网格系统
│   │   ├── Arrow.ts    # 箭头实体
│   │   └── Path.ts     # 路径绘制
│   ├── algorithm/      # 关卡生成算法
│   │   ├── GridAlgorithm.ts  # 基类
│   │   ├── Basic.ts
│   │   ├── Aztec.ts
│   │   ├── Snake.ts
│   │   ├── Spaghetti.ts
│   │   ├── Loopy.ts
│   │   └── Country.ts
│   ├── level/          # 关卡系统
│   │   ├── LevelManager.ts
│   │   ├── LevelData.ts
│   │   └── levels.json  # 关卡配置
│   ├── ui/             # UI系统
│   │   ├── GameUI.ts
│   │   ├── MenuUI.ts
│   │   └── VictoryUI.ts
│   └── main.ts         # 入口
├── public/
│   └── index.html
├── styles/
│   └── game.css
├── vite.config.ts
└── package.json
```

### 核心类设计

```typescript
// Arrow.ts
class Arrow {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  state: 'idle' | 'moving' | 'exited' | 'blocked';

  move(grid: Grid): boolean;
  reset(): void;
}

// Grid.ts
class Grid {
  width: number;
  height: number;
  arrows: Arrow[];
  obstacles: Obstacle[];

  addArrow(arrow: Arrow): void;
  removeArrow(arrow: Arrow): void;
  isValidPath(x, y, direction): boolean;
  checkWinCondition(): boolean;
}

// Game.ts
class Game {
  level: number;
  mistakes: number;
  history: Move[];

  startLevel(levelId: number): void;
  handleInput(x, y): void;
  undo(): void;
  checkWinLose(): void;
}
```

---

## 关卡系统

### 关卡命名规范

```
格式: {版本}_{序号}_{网格尺寸}_{箭头数}_{算法列表}
示例: v1_001_8x10_6_basic-aztec
```

### 关卡配置格式

```json
{
  "id": 1,
  "name": "第1关",
  "version": "v1",
  "gridSize": { "rows": 8, "cols": 10 },
  "arrowCount": 6,
  "algorithms": ["basic", "aztec"],
  "arrows": [
    { "x": 2, "y": 1, "direction": "up" },
    { "x": 5, "y": 3, "direction": "right" }
  ],
  "blocks": [
    { "x": 4, "y": 4, "type": "number", "value": 2 }
  ],
  "maxMistakes": 3,
  "difficulty": 1
}
```

### 关卡生成算法

#### 1. Basic（基础直线路径）
```typescript
// 生成规则的水平/垂直线条
class BasicAlgorithm {
  generate(grid, count): Arrow[] {
    // 随机选择行或列
    // 沿直线放置箭头
    // 方向一致或相反
  }
}
```

#### 2. Aztec（阿兹特克曲折）
```typescript
// 生成阶梯式/金字塔形路径
class AztecAlgorithm {
  generate(grid, count): Arrow[] {
    // 创建中心对称的阶梯结构
    // 每层递增/递减箭头数
  }
}
```

#### 3. Snake（蛇形蜿蜒）
```typescript
// 生成S形蜿蜒路径
class SnakeAlgorithm {
  generate(grid, count): Arrow[] {
    // 蛇形贯穿网格
    // 方向交替变化
  }
}
```

#### 4. Spaghetti（意大利面条）
```typescript
// 生成随机缠绕的交叉路径
class SpaghettiAlgorithm {
  generate(grid, count): Arrow[] {
    // 随机交叉的路径
    // 多个方向混合
  }
}
```

#### 5. Loopy（环形回路）
```typescript
// 生成闭环路径
class LoopyAlgorithm {
  generate(grid, count): Arrow[] {
    // 创建环形结构
    // 需要打破某个环才能解
  }
}
```

#### 6. Country（乡村田园）
```typescript
// 生成不规则的自然路径
class CountryAlgorithm {
  generate(grid, count): Arrow[] {
    // 模拟乡间小路
    // 曲线和平滑转向
  }
}
```

### 关卡数量规划

| 难度 | 关卡数 | 算法组合 |
|------|--------|----------|
| 入门 | 30 | Basic + Aztec |
| 进阶 | 40 | Snake + Spaghetti |
| 挑战 | 50 | Loopy + Country |
| 大师 | 80 | 混合算法 + 障碍 |
| **总计** | **200** | |

---

## 关卡生成算法实现

### 反向插入法（核心）

```typescript
class LevelGenerator {
  generateLevel(config: LevelConfig): Level {
    // 1. 创建空网格
    const grid = new Grid(config.rows, config.cols);

    // 2. 反向插入箭头
    const solution: Arrow[] = [];
    for (let i = 0; i < config.arrowCount; i++) {
      // 从边缘随机选择入口点
      const edge = this.selectRandomEdge(grid);
      const direction = opposite(edge.entryDirection);

      // 找到第一个有效位置
      const pos = this.findFirstValidCell(grid, edge, direction);

      // 插入箭头
      const arrow = new Arrow(pos.x, pos.y, direction);
      grid.addArrow(arrow);
      solution.unshift(arrow); // 反序存储
    }

    // 3. 验证可解性
    if (!this.isSolvable(grid)) {
      return this.generateLevel(config); // 重新生成
    }

    return {
      grid,
      solution, // 正序 = 消除顺序
      difficulty: this.calculateDifficulty(grid)
    };
  }
}
```

### 算法组合策略

```typescript
class AlgorithmComposer {
  combine(algorithms: string[], grid, count): Arrow[] {
    // 按比例分配箭头数量
    const ratio = 1 / algorithms.length;
    const perAlgo = Math.floor(count * ratio);

    let allArrows: Arrow[] = [];
    algorithms.forEach(algo => {
      const instance = this.createAlgorithm(algo);
      const arrows = instance.generate(grid, perAlgo);
      allArrows = allArrows.concat(arrows);
    });

    // 打乱位置
    return this.shuffle(allArrows);
  }
}
```

---

## 界面设计

### 主界面

```
┌────────────────────────────────────┐
│         Arrow Puzzle               │
├────────────────────────────────────┤
│                                    │
│           [开始游戏]               │
│           [关卡选择]               │
│           [设置]                   │
│                                    │
│        音效: [ON/OFF]              │
│        震动: [ON/OFF]              │
└────────────────────────────────────┘
```

### 游戏界面

```
┌────────────────────────────────────┐
│  第1关            失误: 1/3  [撤销] │
├────────────────────────────────────┤
│                                    │
│     ┌──────────────────────┐       │
│     │  ↑  →  ↓  ←  ↑      │       │
│     │  →  ↓  ←  ↑  →      │       │
│     │  ↓  ←  ↑  →  ↓      │  <- 网格区域
│     │  ←  ↑  →  ↓  ←      │       │
│     │  ↑  →  ↓  ←  ↑      │       │
│     └──────────────────────┘       │
│                                    │
│              [提示]                │
└────────────────────────────────────┘
```

### 胜利界面

```
┌────────────────────────────────────┐
│                                    │
│           ★ 完美通关 ★             │
│                                    │
│         用时: 00:45               │
│         步数: 12                   │
│                                    │
│        [下一关]  [重玩]            │
│                                    │
│         [分享成绩]                 │
└────────────────────────────────────┘
```

### 失败界面

```
┌────────────────────────────────────┐
│                                    │
│            挑战失败                 │
│                                    │
│         再接再厉！                 │
│                                    │
│        [看广告复活]                │
│        [返回菜单]                  │
│                                    │
└────────────────────────────────────┘
```

---

## 交互设计

### 输入处理

```typescript
class InputHandler {
  // 鼠标/触摸点击
  onClick(x: number, y: number): void {
    const arrow = grid.getArrowAt(x, y);
    if (arrow && arrow.state === 'idle') {
      game.moveArrow(arrow);
    }
  }

  // 键盘快捷键
  onKeyPress(key: string): void {
    switch(key) {
      case 'z': game.undo(); break;
      case 'h': game.showHint(); break;
      case 'r': game.restart(); break;
    }
  }

  // 滑动手势（移动端）
  onSwipe(start: Point, end: Point): void {
    // 计算滑动方向
    const direction = calculateDirection(start, end);
    const arrow = getArrowAt(start);
    if (arrow && arrow.direction === direction) {
      game.moveArrow(arrow);
    }
  }
}
```

### 动画系统

```typescript
class AnimationSystem {
  // 箭头移动动画
  animateArrowMove(arrow: Arrow, path: Point[]): Promise {
    return new Promise(resolve => {
      const timeline = path.map((point, index) => ({
        x: point.x,
        y: point.y,
        duration: 100,
        delay: index * 100
      }));

      // 执行动画
      this.playTimeline(timeline, () => resolve());
    });
  }

  // 箭头消除动画
  animateArrowExit(arrow: Arrow): Promise {
    return new Promise(resolve => {
      // 渐隐 + 缩小
      this.playEffect('exit', { target: arrow }, resolve);
    });
  }

  // 碰撞反弹动画
  animateBounce(arrow: Arrow): Promise {
    return new Promise(resolve => {
      // 震动效果
      this.playEffect('bounce', { target: arrow }, resolve);
    });
  }
}
```

---

## 数据持久化

### 本地存储

```typescript
class SaveManager {
  // 保存进度
  saveProgress(data: {
    currentLevel: number;
    unlockedLevels: number[];
    stars: Record<number, number>;
    settings: UserSettings;
  }): void {
    localStorage.setItem('arrowPuzzle', JSON.stringify(data));
  }

  // 加载进度
  loadProgress(): SaveData | null {
    const data = localStorage.getItem('arrowPuzzle');
    return data ? JSON.parse(data) : null;
  }

  // 保存关卡记录
  saveLevelRecord(levelId: number, record: {
    time: number;
    moves: number;
    mistakes: number;
    timestamp: number;
  }): void {
    const key = `level_${levelId}`;
    const existing = this.getLevelRecord(levelId);
    if (!existing || record.time < existing.time) {
      localStorage.setItem(key, JSON.stringify(record));
    }
  }
}
```

### 云存档（可选）

```typescript
class CloudSaveManager {
  async sync(): Promise<void> {
    const localData = saveManager.loadProgress();
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(localData)
    });
  }

  async load(): Promise<SaveData> {
    const response = await fetch('/api/load');
    return await response.json();
  }
}
```

---

## 音效与反馈

### 音效设计

| 动作 | 音效 | 时长 |
|------|------|------|
| 点击箭头 | click.mp3 | 0.1s |
| 箭头移动 | slide.mp3 | 0.3s |
| 箭头消除 | pop.mp3 | 0.2s |
| 碰撞反弹 | bump.mp3 | 0.2s |
| 通关胜利 | victory.mp3 | 2s |
| 失败 | fail.mp3 | 1s |

### 震动反馈（移动端）

```typescript
class Haptics {
  static light(): void {
    navigator.vibrate?.(10);
  }

  static medium(): void {
    navigator.vibrate?.(20);
  }

  static heavy(): void {
    navigator.vibrate?.(50);
  }

  static success(): void {
    navigator.vibrate?.([10, 50, 10]);
  }

  static error(): void {
    navigator.vibrate?.([20, 30, 20, 30, 20]);
  }
}
```

---

## 性能优化

### 渲染优化

```typescript
class RenderOptimizer {
  // 对象池
  private arrowPool: Arrow[] = [];

  getArrow(): Arrow {
    return this.arrowPool.pop() || new Arrow();
  }

  releaseArrow(arrow: Arrow): void {
    arrow.reset();
    this.arrowPool.push(arrow);
  }

  // 批量渲染
  batchRender(arrows: Arrow[]): void {
    const batches = this.groupByTexture(arrows);
    batches.forEach(batch => {
      this.renderBatch(batch);
    });
  }

  // 视口裁剪
  renderVisibleOnly(grid: Grid, viewport: Rect): void {
    const visible = grid.getArrowsInRect(viewport);
    visible.forEach(arrow => arrow.render());
  }
}
```

### 内存管理

```typescript
class ResourceManager {
  private cache = new Map<string, any>();

  // 懒加载关卡
  async loadLevel(id: number): Promise<Level> {
    if (this.cache.has(`level_${id}`)) {
      return this.cache.get(`level_${id}`);
    }

    const data = await fetch(`/levels/${id}.json`);
    const level = await data.json();
    this.cache.set(`level_${id}`, level);
    return level;
  }

  // 预加载相邻关卡
  preloadAdjacent(currentLevel: number): void {
    [currentLevel - 1, currentLevel + 1].forEach(id => {
      if (id > 0) this.loadLevel(id);
    });
  }

  // 清理缓存
  clearCache(): void {
    this.cache.clear();
  }
}
```

---

## 部署方案

### 构建流程

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 输出文件
dist/
├── arrow-puzzle.js      # 主游戏 (~50KB gzipped)
├── arrow-puzzle.css     # 样式 (~3KB gzipped)
└── assets/              # 资源文件
    ├── audio/
    ├── images/
    └── levels/
```

### 集成到 ruleword.com

```astro
---
// src/pages/games/arrow-puzzle.astro
---

<html>
  <head>
    <link rel="stylesheet" href="/games/arrow-puzzle/arrow-puzzle.css">
  </head>
  <body>
    <div id="game-container"></div>
    <script src="/games/arrow-puzzle/arrow-puzzle.js"></script>
    <script>
      // 初始化游戏
      ArrowPuzzle.init({
        container: '#game-container',
        debug: false
      });
    </script>
  </body>
</html>
```

### CDN 部署

```
主服务器:
  - HTML 页面
  - API 接口

CDN:
  - 游戏脚本 (arrow-puzzle.js)
  - 样式文件
  - 静态资源 (音频、图片)
```

---

## 开发计划

### 第一周：核心引擎
- [ ] Day 1-2: Grid 系统、Arrow 实体
- [ ] Day 3-4: 移动逻辑、碰撞检测
- [ ] Day 5: 撤销系统、历史记录
- [ ] Day 6-7: 动画系统、渲染优化

### 第二周：内容与打磨
- [ ] Day 1-2: 关卡生成算法（6种）
- [ ] Day 3-4: 200关关卡配置
- [ ] Day 5: UI 界面实现
- [ ] Day 6: 音效集成
- [ ] Day 7: 测试、优化、上线

---

## 测试计划

### 功能测试

| 功能 | 测试用例 | 预期结果 |
|------|----------|----------|
| 基本移动 | 点击箭头 | 沿方向滑出 |
| 碰撞检测 | 遇到障碍 | 弹回原位 |
| 胜利条件 | 消除所有箭头 | 进入胜利界面 |
| 失败条件 | 3次失误 | 进入失败界面 |
| 撤销功能 | 点击撤销 | 回退一步 |
| 提示功能 | 点击提示 | 高亮推荐箭头 |

### 兼容性测试

| 平台 | 浏览器 | 测试项 |
|------|--------|--------|
| iOS | Safari | 触摸、震动、性能 |
| Android | Chrome | 触摸、震动、性能 |
| Desktop | Chrome/Firefox/Safari | 鼠标、键盘 |

### 性能测试

```
指标:
- 首屏加载时间: < 2s
- 关卡加载时间: < 500ms
- 帧率: 60 FPS 稳定
- 内存占用: < 50MB
```

---

## 运营计划

### 数据埋点

```typescript
class Analytics {
  // 关卡开始
  trackLevelStart(levelId: number): void {
    this.track('level_start', { levelId });
  }

  // 关卡完成
  trackLevelComplete(levelId: number, data: {
    time: number;
    moves: number;
    mistakes: number;
  }): void {
    this.track('level_complete', { levelId, ...data });
  }

  // 关卡失败
  trackLevelFail(levelId: number, reason: string): void {
    this.track('level_fail', { levelId, reason });
  }

  // 功能使用
  trackFeatureUse(feature: 'undo' | 'hint' | 'restart'): void {
    this.track('feature_use', { feature });
  }
}
```

### A/B 测试

```
实验1: 提示按钮位置
  - A: 右上角
  - B: 底部居中

实验2: 失误次数限制
  - A: 3次
  - B: 5次

实验3: 音效开关
  - A: 默认开启
  - B: 默认关闭
```

---

## 版本规划

### v1.0（MVP）
- 200关基础内容
- 核心玩法
- 本地存档
- 基础UI

### v1.1
- 每日挑战
- 排行榜
- 社交分享

### v1.2
- 主题系统（皮肤）
- 成就系统
- 云存档

### v2.0
- 关卡编辑器
- 社区关卡
- 多人对战

---

## 参考资源

### 技术文档
- [Cocos Creator 文档](https://docs.cocos.com/)
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

### 游戏设计
- 《箭了又箭》逆向分析报告
- 100关关卡数据
- 6种网格绘制算法

### API 参考
```
GET  https://api.sm0.fun/v2/cfg/SM3400376871559255/1.0.6/sdk
POST https://yghy123.com/v2-api/stat/level/report-complete
```

---

*文档版本: 1.0*
*最后更新: 2026-04-03*
*作者: Claude Code*
