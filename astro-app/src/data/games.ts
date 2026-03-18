// 游戏配置数据
export interface GameConfig {
  slug: string
  id: string
  name: string
  nameZh: string
  icon: string
  desc: string
  descZh: string
  category: 'word' | 'logic' | 'strategy' | 'arcade' | 'memory' | 'tools'
  featured?: boolean
  color: string
}

export const games: GameConfig[] = [
  // Word Games
  { slug: 'crosswordle', id: 'crosswordle', name: 'Crosswordle', nameZh: '填字游戏', icon: '🔤', desc: 'Swap letters to solve words', descZh: '字母交换填字游戏', category: 'word', featured: true, color: 'from-blue-500 to-indigo-600' },
  { slug: 'word-search', id: 'wordsearch', name: 'Word Search', nameZh: '找词游戏', icon: '🔍', desc: 'Find hidden words in grid', descZh: '在网格中找出隐藏单词', category: 'word', featured: true, color: 'from-emerald-500 to-teal-600' },
  { slug: 'hangman', id: 'hangman', name: 'Hangman', nameZh: '猜单词', icon: '📝', desc: 'Classic word guessing game', descZh: '经典猜单词游戏', category: 'word', color: 'from-rose-500 to-pink-600' },

  // Logic Games
  { slug: 'sudoku', id: 'sudoku', name: 'Sudoku', nameZh: '数独', icon: '🧩', desc: 'Classic 9x9 number puzzle', descZh: '经典9x9数字逻辑游戏', category: 'logic', featured: true, color: 'from-orange-500 to-red-600' },
  { slug: '2048', id: 'game2048', name: '2048', nameZh: '2048', icon: '🔢', desc: 'Merge numbers challenge', descZh: '数字合并挑战', category: 'logic', featured: true, color: 'from-amber-500 to-orange-600' },
  { slug: 'minesweeper', id: 'minesweeper', name: 'Minesweeper', nameZh: '扫雷', icon: '💣', desc: 'Classic mine-finding puzzle', descZh: '经典扫雷益智游戏', category: 'logic', featured: true, color: 'from-red-500 to-rose-600' },
  { slug: 'nonogram', id: 'nonogram', name: 'Nonogram', nameZh: '数织', icon: '🖼️', desc: 'Reveal hidden pixel art', descZh: '揭示隐藏像素画', category: 'logic', featured: true, color: 'from-purple-500 to-violet-600' },
  { slug: 'skyscrapers', id: 'skyscrapers', name: 'Skyscrapers', nameZh: '摩天楼', icon: '🏙️', desc: 'Place buildings by clues', descZh: '根据提示放置建筑', category: 'logic', color: 'from-cyan-500 to-blue-600' },
  { slug: 'suguru', id: 'suguru', name: 'Suguru', nameZh: '数独组', icon: '🎨', desc: 'Fill regions with numbers', descZh: '数字填充区域', category: 'logic', color: 'from-pink-500 to-rose-600' },
  { slug: 'binary', id: 'binary', name: 'Binary', nameZh: '01填格', icon: '⚪', desc: 'Fill grid with 0s and 1s', descZh: '用0和1填满格子', category: 'logic', color: 'from-slate-500 to-gray-600' },
  { slug: 'kakuro', id: 'kakuro', name: 'Kakuro', nameZh: '数和', icon: '➕', desc: 'Sum crossword puzzle', descZh: '求和填字游戏', category: 'logic', color: 'from-green-500 to-emerald-600' },
  { slug: 'kenken', id: 'kenken', name: 'KenKen', nameZh: '贤贤数独', icon: '🧮', desc: 'Math grid puzzle', descZh: '数学方格谜题', category: 'logic', color: 'from-teal-500 to-cyan-600' },
  { slug: 'hitori', id: 'hitori', name: 'Hitori', nameZh: '一人', icon: '⚫', desc: 'Eliminate duplicate numbers', descZh: '消除重复数字', category: 'logic', color: 'from-zinc-500 to-neutral-600' },
  { slug: 'slitherlink', id: 'slitherlink', name: 'Slitherlink', nameZh: '回路迷', icon: '🔗', desc: 'Form a single loop', descZh: '形成单一回路', category: 'logic', color: 'from-indigo-500 to-blue-600' },
  { slug: 'bridges', id: 'hashiwokakero', name: 'Bridges', nameZh: '造桥', icon: '🌉', desc: 'Connect islands with bridges', descZh: '用桥连接岛屿', category: 'logic', color: 'from-sky-500 to-cyan-600' },
  { slug: 'threes', id: 'threes', name: 'Threes', nameZh: '三消', icon: '3️⃣', desc: 'Slide and merge threes', descZh: '滑动合并三消', category: 'logic', color: 'from-violet-500 to-purple-600' },
  { slug: '15-puzzle', id: 'fifteenpuzzle', name: '15 Puzzle', nameZh: '数字推盘', icon: '🔲', desc: 'Slide numbers in order', descZh: '滑动数字排序', category: 'logic', color: 'from-amber-500 to-yellow-600' },
  { slug: 'lights-out', id: 'lightsout', name: 'Lights Out', nameZh: '熄灯游戏', icon: '💡', desc: 'Turn off all lights', descZh: '关闭所有灯泡', category: 'logic', color: 'from-yellow-500 to-amber-600' },
  { slug: 'bullpen', id: 'bullpen', name: 'Bullpen', nameZh: '牛栏逻辑', icon: '🐂', desc: 'Sudoku meets Minesweeper', descZh: '数独与扫雷的结合', category: 'logic', featured: true, color: 'from-lime-500 to-green-600' },
  { slug: 'nurikabe', id: 'nurikabe', name: 'Nurikabe', nameZh: '数墙', icon: '🧱', desc: 'Build walls to form islands', descZh: '建造墙壁形成岛屿', category: 'logic', color: 'from-stone-500 to-slate-600' },
  { slug: 'star-battle', id: 'starbattle', name: 'Star Battle', nameZh: '星星大战', icon: '⭐', desc: 'Place stars without touching', descZh: '放置不相邻的星星', category: 'logic', featured: true, color: 'from-yellow-500 to-amber-600' },
  { slug: 'heyawake', id: 'heyawake', name: 'Heyawake', nameZh: '屋的分', icon: '🏠', desc: 'Room partition puzzle', descZh: '房间分割逻辑谜题', category: 'logic', color: 'from-blue-500 to-indigo-600' },
  { slug: 'masyu', id: 'masyu', name: 'Masyu', nameZh: '真珠路', icon: '⚪', desc: 'Pearl loop puzzle', descZh: '珍珠画线回路谜题', category: 'logic', featured: true, color: 'from-slate-400 to-gray-600' },
  { slug: 'fillomino', id: 'fillomino', name: 'Fillomino', nameZh: '填满分', icon: '🧩', desc: 'Fill regions with numbers', descZh: '数字区域填充', category: 'logic', color: 'from-emerald-500 to-green-600' },
  { slug: 'yajilin', id: 'yajilin', name: 'Yajilin', nameZh: '耶吉林', icon: '🔵', desc: 'Draw loop, shade cells', descZh: '画回路并涂黑格', category: 'logic', color: 'from-blue-500 to-indigo-600' },
  { slug: 'castle-wall', id: 'castlewall', name: 'Castle Wall', nameZh: '城墙', icon: '🏰', desc: 'Draw castle walls', descZh: '画城墙包围数字', category: 'logic', color: 'from-amber-600 to-orange-700' },
  { slug: 'shakashaka', id: 'shakashaka', name: 'Shakashaka', nameZh: '斜斜', icon: '📐', desc: 'Place triangles for rectangles', descZh: '放置三角形形成矩形', category: 'logic', color: 'from-violet-500 to-purple-600' },
  { slug: 'aqre', id: 'aqre', name: 'Aqre', nameZh: '阿克雷', icon: '🔲', desc: 'Shade with no 3 consecutive', descZh: '涂黑格不超过连续3个', category: 'logic', color: 'from-purple-500 to-indigo-600' },
  { slug: 'tapa', id: 'tapa', name: 'Tapa', nameZh: '塔帕', icon: '⬛', desc: 'Shade connected cells', descZh: '涂黑格子形成连续墙', category: 'logic', color: 'from-gray-600 to-slate-700' },
  { slug: 'sudoku-x', id: 'sudokux', name: 'Sudoku X', nameZh: 'X数独', icon: '❌', desc: 'Sudoku with diagonals', descZh: '对角线数独', category: 'logic', color: 'from-red-500 to-orange-600' },
  { slug: 'killer-sudoku', id: 'killersudoku', name: 'Killer Sudoku', nameZh: '杀手数独', icon: '💀', desc: 'Sudoku with sum cages', descZh: '带求和笼的数独', category: 'logic', featured: true, color: 'from-slate-700 to-gray-800' },

  // Strategy
  { slug: 'mastermind', id: 'mastermind', name: 'Mastermind', nameZh: '密码破译', icon: '🔐', desc: '8 tries to crack code', descZh: '8次机会破解密码', category: 'strategy', featured: true, color: 'from-fuchsia-500 to-pink-600' },
  { slug: 'tic-tac-toe', id: 'tictactoe', name: 'Tic-Tac-Toe', nameZh: '井字棋', icon: '⭕', desc: 'Classic X and O game', descZh: '经典井字棋游戏', category: 'strategy', color: 'from-rose-500 to-red-600' },
  { slug: 'connect-four', id: 'connectfour', name: 'Connect Four', nameZh: '四子棋', icon: '🔴', desc: 'Connect four to win', descZh: '连成四子获胜', category: 'strategy', color: 'from-red-500 to-orange-600' },
  { slug: 'reversi', id: 'reversi', name: 'Reversi', nameZh: '黑白棋', icon: '⚪', desc: 'Flip opponent pieces', descZh: '翻转对方棋子', category: 'strategy', featured: true, color: 'from-gray-500 to-black' },
  { slug: 'gomoku', id: 'gomoku', name: 'Gomoku', nameZh: '五子棋', icon: '⚫', desc: 'Connect five to win', descZh: '五子连珠获胜', category: 'strategy', featured: true, color: 'from-amber-700 to-amber-900' },
  { slug: 'checkers', id: 'checkers', name: 'Checkers', nameZh: '跳棋', icon: '🔴', desc: 'Classic draughts game', descZh: '经典跳棋对战', category: 'strategy', color: 'from-red-600 to-rose-700' },
  { slug: 'dots-and-boxes', id: 'dotsandboxes', name: 'Dots and Boxes', nameZh: '点格棋', icon: '📦', desc: 'Complete boxes to score', descZh: '完成方格得分', category: 'strategy', color: 'from-indigo-500 to-blue-600' },
  { slug: 'chess', id: 'chess', name: 'Chess', nameZh: '国际象棋', icon: '♔', desc: 'Classic chess game', descZh: '经典国际象棋', category: 'strategy', featured: true, color: 'from-gray-600 to-slate-800' },
  { slug: 'chinese-chess', id: 'chinesechess', name: 'Chinese Chess', nameZh: '中国象棋', icon: '象棋', desc: 'Xiangqi classic game', descZh: '经典中国象棋', category: 'strategy', featured: true, color: 'from-red-600 to-amber-700' },
  { slug: 'battleship', id: 'battleship', name: 'Battleship', nameZh: '战舰', icon: '🚢', desc: 'Sink enemy ships', descZh: '击沉敌方战舰', category: 'strategy', featured: true, color: 'from-blue-600 to-indigo-700' },

  // Arcade
  { slug: 'tetris', id: 'tetris', name: 'Tetris', nameZh: '俄罗斯方块', icon: '🧱', desc: 'Classic block puzzle', descZh: '经典俄罗斯方块', category: 'arcade', featured: true, color: 'from-blue-500 to-cyan-600' },
  { slug: 'snake', id: 'snake', name: 'Snake', nameZh: '贪吃蛇', icon: '🐍', desc: 'Classic snake game', descZh: '经典贪吃蛇游戏', category: 'arcade', color: 'from-green-500 to-emerald-600' },
  { slug: 'brick-breaker', id: 'brickbreaker', name: 'Brick Breaker', nameZh: '打砖块', icon: '🏓', desc: 'Classic ball and paddle', descZh: '经典弹球游戏', category: 'arcade', color: 'from-purple-500 to-indigo-600' },
  { slug: 'pong', id: 'pong', name: 'Pong', nameZh: '乒乓球', icon: '🏓', desc: 'Classic arcade paddle game', descZh: '经典街机乒乓球', category: 'arcade', featured: true, color: 'from-cyan-500 to-blue-600' },
  { slug: 'frogger', id: 'frogger', name: 'Frogger', nameZh: '青蛙过河', icon: '🐸', desc: 'Cross road and river', descZh: '穿越马路和河流', category: 'arcade', featured: true, color: 'from-green-500 to-lime-600' },
  { slug: 'space-invaders', id: 'spaceinvaders', name: 'Space Invaders', nameZh: '太空侵略者', icon: '👾', desc: 'Classic alien shooter', descZh: '经典外星人射击', category: 'arcade', featured: true, color: 'from-purple-600 to-indigo-700' },
  { slug: 'asteroids', id: 'asteroids', name: 'Asteroids', nameZh: '小行星', icon: '☄️', desc: 'Destroy asteroids', descZh: '摧毁小行星', category: 'arcade', color: 'from-slate-600 to-gray-800' },
  { slug: 'pac-man', id: 'pacman', name: 'Pac-Man', nameZh: '吃豆人', icon: '🟡', desc: 'Eat dots, avoid ghosts', descZh: '吃豆子躲避幽灵', category: 'arcade', featured: true, color: 'from-yellow-400 to-amber-500' },
  { slug: 'breakout', id: 'breakoutgame', name: 'Breakout', nameZh: '打砖块', icon: '🧱', desc: 'Break all bricks', descZh: '打掉所有砖块', category: 'arcade', color: 'from-rose-500 to-pink-600' },

  // Memory
  { slug: 'memory', id: 'memory', name: 'Memory', nameZh: '记忆翻牌', icon: '🃏', desc: 'Flip cards to find pairs', descZh: '翻转卡片找到配对', category: 'memory', color: 'from-pink-500 to-rose-600' },
  { slug: 'simon-says', id: 'simonsays', name: 'Simon Says', nameZh: '西蒙说', icon: '🎵', desc: 'Memory color sequence', descZh: '记忆颜色序列', category: 'memory', color: 'from-violet-500 to-purple-600' },
  { slug: 'whack-a-mole', id: 'whackamole', name: 'Whack-a-Mole', nameZh: '打地鼠', icon: '🔨', desc: 'Quick reflexes game', descZh: '快速反应打地鼠', category: 'memory', color: 'from-orange-500 to-red-600' },
  { slug: 'number-memory', id: 'numbermemory', name: 'Number Memory', nameZh: '数字记忆', icon: '🔢', desc: 'Remember digit sequences', descZh: '记忆数字序列', category: 'memory', featured: true, color: 'from-cyan-500 to-blue-600' },
  { slug: 'pattern-memory', id: 'patternmemory', name: 'Pattern Memory', nameZh: '图案记忆', icon: '🎨', desc: 'Memorize colored patterns', descZh: '记忆彩色图案', category: 'memory', featured: true, color: 'from-fuchsia-500 to-purple-600' },

  // Tools
  { slug: 'dictionary', id: 'dictionary', name: 'Dictionary', nameZh: '词典', icon: '📚', desc: 'Word definitions', descZh: '单词定义与更多', category: 'tools', color: 'from-gray-500 to-slate-600' },

  // More Word Games
  { slug: 'anagrams', id: 'anagrams', name: 'Anagrams', nameZh: '字谜重组', icon: '🔀', desc: 'Unscramble letters', descZh: '重组字母成词', category: 'word', color: 'from-violet-500 to-purple-600' },
  { slug: 'boggle', id: 'boggle', name: 'Boggle', nameZh: '字母方阵', icon: '🎲', desc: 'Find words in grid', descZh: '在网格中找词', category: 'word', featured: true, color: 'from-orange-500 to-red-600' },
  { slug: 'wordle', id: 'wordle', name: 'Wordle', nameZh: '猜词', icon: '🟩', desc: '5-letter word guessing', descZh: '5字母猜词游戏', category: 'word', featured: true, color: 'from-green-500 to-emerald-600' },
  { slug: 'spelling-bee', id: 'spellingbee', name: 'Spelling Bee', nameZh: '拼字蜜蜂', icon: '🐝', desc: 'Make words from letters', descZh: '用字母拼写单词', category: 'word', featured: true, color: 'from-yellow-400 to-amber-500' },
  { slug: 'connections', id: 'connections', name: 'Connections', nameZh: '词语连线', icon: '🔗', desc: 'Group related words', descZh: '分组相关词语', category: 'word', featured: true, color: 'from-yellow-500 to-orange-600' },

  // More Strategy Games
  { slug: 'nim', id: 'nim', name: 'Nim', nameZh: '尼姆博弈', icon: '🪨', desc: 'Mathematical strategy', descZh: '数学策略博弈', category: 'strategy', color: 'from-slate-500 to-gray-600' },

  // More Arcade Games
  { slug: 'simon-game', id: 'simongame', name: 'Simon Game', nameZh: '西蒙记忆', icon: '🔴', desc: 'Color sequence memory', descZh: '颜色序列记忆', category: 'arcade', featured: true, color: 'from-green-500 to-teal-600' },

  // More Memory Games
  { slug: 'reaction-test', id: 'reactiontest', name: 'Reaction Test', nameZh: '反应测试', icon: '⚡', desc: 'Test your reflexes', descZh: '测试反应速度', category: 'memory', featured: true, color: 'from-yellow-500 to-orange-600' },
]

export const categories = [
  { id: 'all', name: 'All Games', nameZh: '全部游戏', icon: '🎮' },
  { id: 'word', name: 'Word Games', nameZh: '文字游戏', icon: '📝' },
  { id: 'logic', name: 'Logic & Numbers', nameZh: '数字逻辑', icon: '🧩' },
  { id: 'strategy', name: 'Strategy', nameZh: '策略对战', icon: '🎯' },
  { id: 'arcade', name: 'Arcade', nameZh: '经典街机', icon: '👾' },
  { id: 'memory', name: 'Memory & Reflex', nameZh: '记忆反应', icon: '🧠' },
  { id: 'tools', name: 'Tools', nameZh: '工具', icon: '🔧' },
]

export function getGameBySlug(slug: string): GameConfig | undefined {
  return games.find(g => g.slug === slug)
}
