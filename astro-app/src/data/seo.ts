// SEO Configuration for each game
// High-value keywords based on search volume and competition analysis

export interface GameSEO {
  // Primary keyword (highest search volume, most relevant)
  primaryKeyword: string
  // Secondary keywords (related searches)
  secondaryKeywords: string[]
  // Long-tail keywords (specific user intents)
  longTailKeywords: string[]
  // Meta title template (use {game} and {brand} placeholders)
  titleTemplate: string
  // Meta description template
  descriptionTemplate: string
  // Search intent: 'play' | 'learn' | 'daily' | 'unlimited'
  intent: string
}

// Top 20 high-value games with SEO optimization
export const gameSEOConfig: Record<string, GameSEO> = {
  // Word Games - High search volume
  wordle: {
    primaryKeyword: 'wordle online',
    secondaryKeywords: ['wordle game', 'wordle free', 'play wordle', 'word puzzle'],
    longTailKeywords: ['wordle unlimited free', 'play wordle online no download', 'daily wordle challenge', '5 letter word game'],
    titleTemplate: 'Wordle Online Free - Play Daily Word Puzzle Game | {brand}',
    descriptionTemplate: 'Play Wordle online free! Guess the hidden 5-letter word in 6 tries. Daily challenge, unlimited practice mode. No download required, play instantly!',
    intent: 'play'
  },
  'spelling-bee': {
    primaryKeyword: 'spelling bee game',
    secondaryKeywords: ['spelling bee online', 'spelling game', 'word game'],
    longTailKeywords: ['free spelling bee game', 'play spelling bee online', 'nyt spelling bee alternative', 'word puzzle game'],
    titleTemplate: 'Spelling Bee Game Online Free - Word Puzzle Challenge | {brand}',
    descriptionTemplate: 'Play Spelling Bee online free! Create words using given letters, find the pangram to win. No download required, unlimited play.',
    intent: 'play'
  },
  'word-search': {
    primaryKeyword: 'word search',
    secondaryKeywords: ['word find', 'word puzzle', 'search words game'],
    longTailKeywords: ['word search online free', 'play word search puzzle', 'word finder game', 'hidden word puzzle'],
    titleTemplate: 'Word Search Online Free - Play Word Find Puzzle | {brand}',
    descriptionTemplate: 'Play Word Search online free! Find hidden words in the letter grid. Multiple difficulty levels, new puzzles daily. No download needed!',
    intent: 'play'
  },
  boggle: {
    primaryKeyword: 'boggle game',
    secondaryKeywords: ['boggle online', 'word search game', 'letter grid'],
    longTailKeywords: ['play boggle online free', 'boggle word game', '4x4 word game', 'timed word puzzle'],
    titleTemplate: 'Boggle Game Online Free - Play Word Grid Puzzle | {brand}',
    descriptionTemplate: 'Play Boggle online free! Find as many words as possible in the 4x4 letter grid before time runs out. Classic word game, no download!',
    intent: 'play'
  },
  crosswordle: {
    primaryKeyword: 'crosswordle',
    secondaryKeywords: ['crossword puzzle', 'word crossword', 'letter game'],
    longTailKeywords: ['crosswordle game online', 'play crosswordle free', 'word grid puzzle', 'crossword word game'],
    titleTemplate: 'Crosswordle Online Free - Word Cross Puzzle Game | {brand}',
    descriptionTemplate: 'Play Crosswordle online free! Swap letters to form valid words in this unique crossword puzzle. Brain training word game, no download!',
    intent: 'play'
  },
  connections: {
    primaryKeyword: 'connections game',
    secondaryKeywords: ['word connections', 'group words game', 'word puzzle'],
    longTailKeywords: ['play connections online free', 'word grouping game', 'find word categories', 'nyt connections alternative'],
    titleTemplate: 'Connections Game Online Free - Word Grouping Puzzle | {brand}',
    descriptionTemplate: 'Play Connections online free! Group 16 words into 4 categories. Find hidden connections between words. No download required!',
    intent: 'play'
  },

  // Logic Games - Very high search volume
  sudoku: {
    primaryKeyword: 'sudoku online',
    secondaryKeywords: ['sudoku game', 'sudoku puzzle', 'number puzzle'],
    longTailKeywords: ['play sudoku free online', 'daily sudoku puzzle', 'sudoku easy medium hard', '9x9 number game'],
    titleTemplate: 'Sudoku Online Free - Play Daily Sudoku Puzzle | {brand}',
    descriptionTemplate: 'Play Sudoku online free! Fill the 9x9 grid with numbers 1-9. Multiple difficulty levels from easy to expert. No download, play instantly!',
    intent: 'play'
  },
  '2048': {
    primaryKeyword: '2048 game',
    secondaryKeywords: ['2048 online', 'number puzzle', 'sliding puzzle'],
    longTailKeywords: ['play 2048 online free', '2048 tile game', 'merge numbers game', '2048 puzzle online'],
    titleTemplate: '2048 Game Online Free - Play Number Puzzle | {brand}',
    descriptionTemplate: 'Play 2048 online free! Slide and merge tiles to reach 2048. Addictive number puzzle game. No download required, play in browser!',
    intent: 'play'
  },
  minesweeper: {
    primaryKeyword: 'minesweeper online',
    secondaryKeywords: ['minesweeper game', 'mine sweeper', 'classic puzzle'],
    longTailKeywords: ['play minesweeper free', 'minesweeper classic game', 'avoid mines puzzle', 'windows minesweeper'],
    titleTemplate: 'Minesweeper Online Free - Play Classic Puzzle Game | {brand}',
    descriptionTemplate: 'Play Minesweeper online free! Uncover squares while avoiding hidden mines. Classic puzzle game with multiple difficulty levels!',
    intent: 'play'
  },
  nonogram: {
    primaryKeyword: 'nonogram puzzle',
    secondaryKeywords: ['picross', 'picture puzzle', 'grid puzzle'],
    longTailKeywords: ['play nonogram online free', 'picross puzzle game', 'picture cross puzzle', 'paint by numbers game'],
    titleTemplate: 'Nonogram Puzzle Online Free - Play Picross Game | {brand}',
    descriptionTemplate: 'Play Nonogram online free! Use number clues to reveal hidden pixel art pictures. Picross-style logic puzzle, no download!',
    intent: 'play'
  },
  'killer-sudoku': {
    primaryKeyword: 'killer sudoku',
    secondaryKeywords: ['killer sudoku online', 'sum sudoku', 'cage sudoku'],
    longTailKeywords: ['play killer sudoku free', 'killer sudoku puzzle', 'sudoku with sums', 'advanced sudoku'],
    titleTemplate: 'Killer Sudoku Online Free - Play Sum Sudoku Puzzle | {brand}',
    descriptionTemplate: 'Play Killer Sudoku online free! Sudoku with cage sums - fill grids so each cage adds up to its target. Ultimate sudoku challenge!',
    intent: 'play'
  },

  // Strategy Games
  chess: {
    primaryKeyword: 'chess online',
    secondaryKeywords: ['chess game', 'play chess free', 'chess vs computer'],
    longTailKeywords: ['play chess online free', 'chess against ai', 'free chess game no download', 'classic chess'],
    titleTemplate: 'Chess Online Free - Play Chess Against Computer | {brand}',
    descriptionTemplate: 'Play Chess online free! Challenge the AI in this classic strategy game. Multiple difficulty levels. No download, play instantly!',
    intent: 'play'
  },
  mastermind: {
    primaryKeyword: 'mastermind game',
    secondaryKeywords: ['mastermind online', 'code breaking game', 'guess the code'],
    longTailKeywords: ['play mastermind online free', 'mastermind puzzle', 'color code game', 'logic deduction game'],
    titleTemplate: 'Mastermind Game Online Free - Play Code Breaking Puzzle | {brand}',
    descriptionTemplate: 'Play Mastermind online free! Crack the secret color code in 8 attempts. Classic code-breaking logic game. No download required!',
    intent: 'play'
  },
  gomoku: {
    primaryKeyword: 'gomoku game',
    secondaryKeywords: ['gomoku online', 'five in a row', 'connect five'],
    longTailKeywords: ['play gomoku online free', 'gomoku vs ai', '5 in a row game', 'renju game'],
    titleTemplate: 'Gomoku Game Online Free - Play Five in a Row | {brand}',
    descriptionTemplate: 'Play Gomoku online free! Get 5 stones in a row to win. Classic strategy board game vs AI. No download, play in browser!',
    intent: 'play'
  },
  reversi: {
    primaryKeyword: 'reversi online',
    secondaryKeywords: ['othello game', 'reversi game', 'flip discs'],
    longTailKeywords: ['play reversi free online', 'othello vs computer', 'disc flipping game', 'classic board game'],
    titleTemplate: 'Reversi Online Free - Play Othello Game | {brand}',
    descriptionTemplate: 'Play Reversi (Othello) online free! Flip opponent discs by placing yours strategically. Classic strategy game vs AI!',
    intent: 'play'
  },

  // Arcade Games - High search volume
  tetris: {
    primaryKeyword: 'tetris online',
    secondaryKeywords: ['tetris game', 'block puzzle', 'falling blocks'],
    longTailKeywords: ['play tetris online free', 'classic tetris game', 'tetris no download', 'block stacking game'],
    titleTemplate: 'Tetris Online Free - Play Classic Block Puzzle Game | {brand}',
    descriptionTemplate: 'Play Tetris online free! Rotate and stack falling blocks to clear lines. Classic arcade game. No download required, play instantly!',
    intent: 'play'
  },
  snake: {
    primaryKeyword: 'snake game',
    secondaryKeywords: ['snake online', 'classic snake', 'worm game'],
    longTailKeywords: ['play snake online free', 'classic snake game', 'google snake', 'eat and grow game'],
    titleTemplate: 'Snake Game Online Free - Play Classic Snake | {brand}',
    descriptionTemplate: 'Play Snake online free! Guide the snake to eat food and grow longer. Classic arcade game. No download, play in browser!',
    intent: 'play'
  },
  'pac-man': {
    primaryKeyword: 'pacman online',
    secondaryKeywords: ['pac man game', 'pacman free', 'maze game'],
    longTailKeywords: ['play pacman online free', 'classic pacman game', 'eat dots game', 'retro arcade game'],
    titleTemplate: 'Pac-Man Online Free - Play Classic Arcade Game | {brand}',
    descriptionTemplate: 'Play Pac-Man online free! Eat all dots while avoiding ghosts. Classic 1980s arcade game. No download required!',
    intent: 'play'
  },
  'space-invaders': {
    primaryKeyword: 'space invaders',
    secondaryKeywords: ['space invaders online', 'shooter game', 'alien game'],
    longTailKeywords: ['play space invaders free', 'classic arcade shooter', 'retro space game', 'defend earth game'],
    titleTemplate: 'Space Invaders Online Free - Play Classic Shooter | {brand}',
    descriptionTemplate: 'Play Space Invaders online free! Defend Earth from alien invasion. Classic 1978 arcade shooter. No download, play instantly!',
    intent: 'play'
  },

  // Skill Games - HIGH POTENTIAL (Tier 1 SEO)
  'chimp-test': {
    primaryKeyword: 'chimp test',
    secondaryKeywords: ['chimpanzee memory test', 'chimp memory', 'ape memory test', 'animal memory'],
    longTailKeywords: ['chimp test online free', 'can you beat a chimp', 'chimpanzee memory game', 'memory test vs chimp', 'beat chimpanzee memory'],
    titleTemplate: 'Chimp Test Online Free - Can You Beat a Chimpanzee? | {brand}',
    descriptionTemplate: 'Take the Chimp Test! Can you beat a chimpanzee at memory? Remember number positions and prove your memory skills. Free online, no download!',
    intent: 'play'
  },
  'stroop-test': {
    primaryKeyword: 'stroop test',
    secondaryKeywords: ['stroop effect test', 'stroop task', 'color word test', 'cognitive test'],
    longTailKeywords: ['stroop test online free', 'stroop effect game', 'color word interference', 'psychology test online', 'brain reaction test'],
    titleTemplate: 'Stroop Test Online Free - Test Your Cognitive Control | {brand}',
    descriptionTemplate: 'Take the free Stroop Test online! Test your cognitive flexibility and reaction time. Classic psychology experiment. No download required!',
    intent: 'play'
  },
  'aim-trainer': {
    primaryKeyword: 'aim trainer',
    secondaryKeywords: ['aim training', 'click accuracy', 'fps trainer', 'target practice'],
    longTailKeywords: ['free aim trainer online', 'improve mouse aim', 'click speed trainer', 'fps aim practice', 'mouse accuracy test'],
    titleTemplate: 'Aim Trainer Online Free - Improve Mouse Accuracy for FPS | {brand}',
    descriptionTemplate: 'Free online aim trainer! Improve your mouse precision and reaction time. Perfect for FPS gamers. Track accuracy, speed, and score!',
    intent: 'play'
  },
  'typing-test': {
    primaryKeyword: 'typing test',
    secondaryKeywords: ['typing speed test', 'wpm test', 'typing game', 'keyboard test'],
    longTailKeywords: ['free typing test online', 'check typing speed', 'words per minute test', 'keyboard practice', 'typing speed checker'],
    titleTemplate: 'Typing Test Online Free - Check Your WPM Speed | {brand}',
    descriptionTemplate: 'Free online typing test! Check your typing speed in WPM. Improve keyboard skills with instant results. No download required!',
    intent: 'play'
  },
  'number-memory': {
    primaryKeyword: 'number memory test',
    secondaryKeywords: ['digit memory', 'number sequence', 'memory span', 'digit span'],
    longTailKeywords: ['number memory test online', 'digit span test free', 'memory digit sequence', 'how many digits can you remember'],
    titleTemplate: 'Number Memory Test Online Free - Test Your Digit Memory | {brand}',
    descriptionTemplate: 'Test your number memory online! Remember increasingly long digit sequences. How many numbers can you memorize? Free, no download!',
    intent: 'play'
  },
  'reaction-test': {
    primaryKeyword: 'reaction time test',
    secondaryKeywords: ['reaction test', 'reflex test', 'response time', 'reaction speed'],
    longTailKeywords: ['reaction time test online', 'test your reaction speed', 'reflex test free', 'human reaction time', 'click speed test'],
    titleTemplate: 'Reaction Time Test Online Free - Test Your Reflexes | {brand}',
    descriptionTemplate: 'Test your reaction time online! Measure your reflex speed in milliseconds. Track your best times and challenge friends. Free!',
    intent: 'play'
  },

  // Logic Puzzles - NICHE LOW COMPETITION (Tier 1 SEO for Japan/Germany)
  nonogram: {
    primaryKeyword: 'nonogram puzzle',
    secondaryKeywords: ['picross', 'picture cross', 'paint by numbers', 'griddler'],
    longTailKeywords: ['nonogram online free', 'play picross online', 'japanese picture puzzle', 'pixel art puzzle game', 'ノノグラム'],
    titleTemplate: 'Nonogram Puzzle Online Free - Play Picross Game | {brand}',
    descriptionTemplate: 'Play Nonogram (Picross) online free! Use number clues to reveal hidden pixel art. Japanese logic puzzle. No download required!',
    intent: 'play'
  },
  slitherlink: {
    primaryKeyword: 'slitherlink puzzle',
    secondaryKeywords: ['slitherlink online', 'loop puzzle', 'fences puzzle', 'suraromu'],
    longTailKeywords: ['slitherlink online free', 'play slitherlink puzzle', 'logic loop game', 'スリザーリンク', 'single loop puzzle'],
    titleTemplate: 'Slitherlink Puzzle Online Free - Play Loop Logic Game | {brand}',
    descriptionTemplate: 'Play Slitherlink online free! Draw a single loop through the grid using number clues. Japanese logic puzzle. No download!',
    intent: 'play'
  },
  suguru: {
    primaryKeyword: 'suguru puzzle',
    secondaryKeywords: ['suguru online', 'number regions', 'japanese number puzzle'],
    longTailKeywords: ['suguru puzzle online free', 'play suguru game', 'number region puzzle', 'japanese logic puzzle'],
    titleTemplate: 'Suguru Puzzle Online Free - Play Japanese Number Game | {brand}',
    descriptionTemplate: 'Play Suguru online free! Fill regions with numbers so no adjacent cells match. Japanese logic puzzle. No download required!',
    intent: 'play'
  },
  nurikabe: {
    primaryKeyword: 'nurikabe puzzle',
    secondaryKeywords: ['nurikabe online', 'island puzzle', 'wall puzzle', 'ぬりかべ'],
    longTailKeywords: ['nurikabe puzzle online free', 'play nurikabe game', 'japanese wall puzzle', 'island logic puzzle'],
    titleTemplate: 'Nurikabe Puzzle Online Free - Play Japanese Wall Game | {brand}',
    descriptionTemplate: 'Play Nurikabe online free! Build walls to form islands. Japanese logic puzzle with number clues. No download required!',
    intent: 'play'
  },
  'star-battle': {
    primaryKeyword: 'star battle puzzle',
    secondaryKeywords: ['star battle online', 'two stars puzzle', 'place stars game'],
    longTailKeywords: ['star battle puzzle online', 'play star battle free', 'logic star placement', 'region star puzzle'],
    titleTemplate: 'Star Battle Puzzle Online Free - Place Stars Logic Game | {brand}',
    descriptionTemplate: 'Play Star Battle online free! Place stars in grid so each row, column, and region has exactly two. Logic puzzle, no download!',
    intent: 'play'
  },
  masyu: {
    primaryKeyword: 'masyu puzzle',
    secondaryKeywords: ['masyu online', 'pearl puzzle', 'loop path', 'ましゅ'],
    longTailKeywords: ['masyu puzzle online free', 'play masyu game', 'pearl loop puzzle', 'japanese path puzzle'],
    titleTemplate: 'Masyu Puzzle Online Free - Play Pearl Loop Game | {brand}',
    descriptionTemplate: 'Play Masyu online free! Draw a loop through all pearls following the rules. Japanese logic puzzle. No download required!',
    intent: 'play'
  },
  kakuro: {
    primaryKeyword: 'kakuro puzzle',
    secondaryKeywords: ['kakuro online', 'cross sum', 'math crossword', 'カックロ'],
    longTailKeywords: ['kakuro puzzle online free', 'play kakuro game', 'cross sum puzzle', 'math logic puzzle', 'kakuro kostenlos'],
    titleTemplate: 'Kakuro Puzzle Online Free - Play Cross Sum Game | {brand}',
    descriptionTemplate: 'Play Kakuro online free! Fill cells with digits that sum to the target. Crossword-style math puzzle. No download required!',
    intent: 'play'
  },
  skyscrapers: {
    primaryKeyword: 'skyscrapers puzzle',
    secondaryKeywords: ['skyscrapers online', 'building puzzle', 'visibility puzzle', 'wolkenkratzer'],
    longTailKeywords: ['skyscrapers puzzle online', 'play skyscrapers free', '3d logic puzzle', 'building visibility game'],
    titleTemplate: 'Skyscrapers Puzzle Online Free - Play Building Logic Game | {brand}',
    descriptionTemplate: 'Play Skyscrapers online free! Place buildings so the visible count matches clues. 3D logic puzzle. No download required!',
    intent: 'play'
  },
  hitori: {
    primaryKeyword: 'hitori puzzle',
    secondaryKeywords: ['hitori online', 'shade cells', 'japanese elimination'],
    longTailKeywords: ['hitori puzzle online free', 'play hitori game', 'elimination puzzle', 'shade duplicate numbers'],
    titleTemplate: 'Hitori Puzzle Online Free - Play Shade Cell Game | {brand}',
    descriptionTemplate: 'Play Hitori online free! Shade cells so no row or column has duplicate numbers. Japanese logic puzzle. No download!',
    intent: 'play'
  },
  bridges: {
    primaryKeyword: 'bridges puzzle',
    secondaryKeywords: ['hashiwokakero', 'build bridges', 'connect islands', '橋をかけろ'],
    longTailKeywords: ['bridges puzzle online free', 'hashiwokakero online', 'connect islands game', 'bridge building puzzle'],
    titleTemplate: 'Bridges Puzzle Online Free - Play Hashiwokakero Game | {brand}',
    descriptionTemplate: 'Play Bridges (Hashiwokakero) online free! Connect islands with bridges. Japanese logic puzzle. No download required!',
    intent: 'play'
  },
  calcudoku: {
    primaryKeyword: 'calcudoku',
    secondaryKeywords: ['math sudoku', 'calcudoku online', 'math grid puzzle', 'kenken style'],
    longTailKeywords: ['calcudoku online free', 'play calcudoku puzzle', 'math based sudoku', 'arithmetic puzzle game'],
    titleTemplate: 'Calcudoku Online Free - Play Math Sudoku Puzzle | {brand}',
    descriptionTemplate: 'Play Calcudoku online free! Fill grid with numbers satisfying math operations. Math-based logic puzzle. No download!',
    intent: 'play'
  },
  bullpen: {
    primaryKeyword: '佛系消消消',
    secondaryKeywords: ['shikaku puzzle', '数方游戏', '逻辑消消乐', 'rectangle puzzle', '佛系游戏'],
    longTailKeywords: ['佛系消消消攻略', '佛系消消消怎么玩', '佛系消消消在线玩', 'shikaku online free', '解压小游戏', '网页版消消乐', '逻辑谜题在线'],
    titleTemplate: '佛系消消消 - 超解压逻辑消消乐在线玩 | {brand}',
    descriptionTemplate: '佛系消消消在线免费玩！超解压的逻辑消消乐游戏，根据数字提示画出矩形区域。无需下载，打开即玩，每天玩几局，轻松又治愈！',
    intent: 'play'
  },

  // Puzzle Games
  'mahjong-solitaire': {
    primaryKeyword: 'mahjong solitaire',
    secondaryKeywords: ['mahjong game', 'tile matching', 'mahjong online'],
    longTailKeywords: ['play mahjong solitaire free', 'match tiles game', 'chinese tile game', 'relaxing puzzle'],
    titleTemplate: 'Mahjong Solitaire Online Free - Play Tile Matching | {brand}',
    descriptionTemplate: 'Play Mahjong Solitaire online free! Match identical tiles to clear the board. Relaxing Chinese puzzle game. No download!',
    intent: 'play'
  },
  'match-three': {
    primaryKeyword: 'match 3 game',
    secondaryKeywords: ['match three', 'gem matching', 'candy match'],
    longTailKeywords: ['play match 3 online free', 'gem puzzle game', 'swap and match', 'casual matching game'],
    titleTemplate: 'Match 3 Game Online Free - Play Gem Matching Puzzle | {brand}',
    descriptionTemplate: 'Play Match 3 online free! Swap gems to match 3 or more in a row. Classic casual puzzle game. No download required!',
    intent: 'play'
  },

  // Memory Games
  memory: {
    primaryKeyword: 'memory game',
    secondaryKeywords: ['memory match', 'card matching', 'memory training'],
    longTailKeywords: ['play memory game free', 'card flip game', 'brain training memory', 'matching pairs game'],
    titleTemplate: 'Memory Game Online Free - Play Card Matching | {brand}',
    descriptionTemplate: 'Play Memory game online free! Flip cards to find matching pairs. Train your brain with this classic memory game!',
    intent: 'play'
  }
}

// Default SEO for games not in the config
export const defaultGameSEO: GameSEO = {
  primaryKeyword: 'online game',
  secondaryKeywords: ['free game', 'browser game', 'puzzle game'],
  longTailKeywords: ['play online free', 'no download game', 'browser puzzle'],
  titleTemplate: '{game} Online Free - Play Puzzle Game | {brand}',
  descriptionTemplate: 'Play {game} online free at {brand}! A fun puzzle game to challenge your brain. No download required, play instantly in browser!',
  intent: 'play'
}

// Get SEO config for a game by slug
export function getGameSEO(gameSlug: string): GameSEO {
  // Normalize slug: remove hyphens and try variations
  const normalizedSlug = gameSlug.replace(/-/g, '')
  const variations = [
    gameSlug,           // original: word-search
    normalizedSlug,     // wordsearch
    gameSlug.replace(/-/g, '') // wordsearch
  ]

  // Try to find matching config
  for (const variation of variations) {
    if (gameSEOConfig[variation]) {
      return gameSEOConfig[variation]
    }
  }

  return defaultGameSEO
}

// Generate keywords string for meta tag
export function generateKeywords(seo: GameSEO): string {
  const allKeywords = [
    seo.primaryKeyword,
    ...seo.secondaryKeywords,
    ...seo.longTailKeywords.slice(0, 3)
  ]
  return allKeywords.join(', ')
}

// Homepage SEO - Optimized for high-value keywords (updated for Tier 1 games)
export const homepageSEO = {
  title: 'Play Wordle, Sudoku, 2048 Online Free - 100+ Puzzle Games | RuleWord',
  description: 'Play free online games: Wordle, Sudoku, 2048, Tetris, Chimp Test, Stroop Test, Typing Test, Aim Trainer. 100+ puzzle, word, arcade & brain games. No download!',
  keywords: 'wordle online free, sudoku online, 2048 game, chimp test, stroop test, aim trainer, typing test, tetris online, chess online, minesweeper, snake game, nonogram, picross, brain test, memory test, reaction test, free online games, puzzle games, word games, arcade games, browser games, no download games, play games online free',
  longTailKeywords: [
    'play wordle online free no download',
    'free sudoku puzzle game online',
    'chimp test online free',
    'stroop effect test online',
    'aim trainer for fps players',
    'typing speed test free online',
    'nonogram picross online free',
    'brain training games free',
    'memory test vs chimpanzee',
    'online puzzle games free no download',
    'word games free no registration',
    'arcade games play online free'
  ]
}

// Category SEO
export const categorySEO: Record<string, { title: string; description: string; keywords: string }> = {
  word: {
    title: 'Free Word Games Online - Play Wordle, Spelling Bee & More | RuleWord',
    description: 'Play free word games online: Wordle, Spelling Bee, Word Search, Boggle, Crosswordle and more! Test your vocabulary and word skills. No download required.',
    keywords: 'word games, wordle online, spelling bee, word search, boggle game, crossword puzzle, vocabulary games, free word games'
  },
  logic: {
    title: 'Free Logic & Number Puzzle Games - Sudoku, 2048, Nonogram | RuleWord',
    description: 'Play free logic puzzle games: Sudoku, 2048, Nonogram, Minesweeper, KenKen and more! Train your brain with number puzzles. No download required.',
    keywords: 'logic games, sudoku online, 2048 game, nonogram puzzle, minesweeper, number puzzles, brain training, free puzzle games'
  },
  strategy: {
    title: 'Free Strategy Games Online - Chess, Mastermind, Gomoku | RuleWord',
    description: 'Play free strategy games: Chess, Mastermind, Gomoku, Reversi, Checkers and more! Test your strategic thinking. No download required.',
    keywords: 'strategy games, chess online, mastermind game, gomoku, reversi, board games, tactical games, free strategy games'
  },
  arcade: {
    title: 'Free Arcade Games Online - Tetris, Snake, Pac-Man | RuleWord',
    description: 'Play free classic arcade games: Tetris, Snake, Pac-Man, Space Invaders, Pong and more! Retro gaming fun. No download required.',
    keywords: 'arcade games, tetris online, snake game, pacman, space invaders, classic games, retro games, free arcade games'
  },
  memory: {
    title: 'Free Memory & Brain Training Games Online | RuleWord',
    description: 'Play free memory games: Memory Match, Simon Says, Number Memory, Reaction Test and more! Train your brain and improve memory. No download.',
    keywords: 'memory games, brain training, memory test, reaction test, cognitive games, brain games, free memory games'
  },
  skill: {
    title: 'Free Skill Games - Typing Test, Aim Trainer & More | RuleWord',
    description: 'Play free skill games: Typing Test, Aim Trainer, Reaction Time, Color Match and more! Test and improve your skills. No download required.',
    keywords: 'skill games, typing test, aim trainer, reaction test, typing speed, mouse accuracy, free skill games'
  },
  puzzle: {
    title: 'Free Puzzle Games Online - Mahjong, Match-3, Solitaire | RuleWord',
    description: 'Play free puzzle games: Mahjong Solitaire, Match-3, Solitaire, Jigsaw and more! Relaxing puzzle fun. No download required.',
    keywords: 'puzzle games, mahjong solitaire, match 3 game, solitaire, jigsaw puzzle, relaxing games, free puzzle games'
  }
}
