// ===== LEVEL CONFIGURATION =====
// Based on the original game's 100 levels configuration
// Format: {date}_[{width}x{height}]_[{arrowCount}]_[{algorithms}]

// Grid dimensions: width x height (not square)
// Arrow count varies based on difficulty

// Difficulty levels:
// - Tutorial (Level 1): 8x10 grid, 6 arrows (Loopy, Country)
// - Easy (Levels 2-10): 20x21 to 20x32, ~ 24-88 arrows
// - Medium (Levels 11-30): 25x38 to 30x41, ~ 66-176 arrows
// - Hard (Levels 31-50): 27x43 to 32x49, ~ 111-187 arrows
// - Expert (Levels 51-75): 30x41 to 33x53, ~ 113-187 arrows
// - Master (Levels 76-100): 31x47 to 41x53, ~ 121-196 arrows

// Algorithm types: basic, aztec, loopy, snake, spaghetti, country
// Each level specifies which algorithms to use

// Example level config:
// {
//   id: 1,
//   name: 'First Steps',
//   nameZh: '第一步',
//   width: 8,
//   height: 10,
//   arrowCount: 6,
//   algorithms: ['loopy', 'country'],
//   chapter: 1,
//   maxMistakes: 3,
// },
// {
//   id: 2,
//   name: 'Getting Started',
//   nameZh: '入门',
//   width: 20,
//   height: 21,
//   arrowCount: 24,
//   algorithms: ['aztec'],
//   chapter: 1,
//   maxMistakes: 3,
// },
// {
//   id: 3,
//   name: 'Clear the Way',
//   nameZh: '扫清道路',
//   width: 20,
//   height: 22,
//   arrowCount: 36,
//   algorithms: ['loopy'],
//   chapter: 1,
//   maxMistakes: 3,
// },
// {
//   id: 4,
//   name: 'Order Matters',
//   nameZh: '顺序很重要',
//   width: 20,
//   height: 27,
//   arrowCount: 47,
//   algorithms: ['aztec', 'basic'],
//   chapter: 1,
//   maxMistakes: 3,
// },
// {
//   id: 5,
//   name: 'Think Ahead',
//   nameZh: '三思而后行',
//   width: 25,
//   height: 38,
//   arrowCount: 69,
//   algorithms: ['spaghetti', 'aztec'],
//   chapter: 1,
//   maxMistakes: 3,
// },
// // ... continue for more levels up to 100
]
