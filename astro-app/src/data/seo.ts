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
  },

  // Word Games - Additional
  hangman: {
    primaryKeyword: 'hangman game',
    secondaryKeywords: ['hangman online', 'word guessing game', 'hangman free'],
    longTailKeywords: ['play hangman online free', 'classic hangman game', 'word guessing puzzle', 'hangman word game'],
    titleTemplate: 'Hangman Game Online Free - Play Word Guessing | {brand}',
    descriptionTemplate: 'Play Hangman online free! Guess the hidden word letter by letter before running out of attempts. Classic word game!',
    intent: 'play'
  },
  'word-scramble': {
    primaryKeyword: 'word scramble game',
    secondaryKeywords: ['word scramble online', 'unscramble words', 'word puzzle'],
    longTailKeywords: ['play word scramble free', 'unscramble letters game', 'word jumble puzzle', 'scrambled word solver'],
    titleTemplate: 'Word Scramble Game Online Free - Unscramble Words | {brand}',
    descriptionTemplate: 'Play Word Scramble online free! Unscramble letters to form words. Challenge your vocabulary skills!',
    intent: 'play'
  },
  anagrams: {
    primaryKeyword: 'anagrams game',
    secondaryKeywords: ['anagram solver', 'word anagrams', 'letter rearrangement'],
    longTailKeywords: ['play anagrams online free', 'anagram puzzle game', 'rearrange letters game', 'word making game'],
    titleTemplate: 'Anagrams Game Online Free - Play Word Puzzle | {brand}',
    descriptionTemplate: 'Play Anagrams online free! Rearrange letters to create new words. Test your word skills!',
    intent: 'play'
  },
  crossword: {
    primaryKeyword: 'crossword puzzle online',
    secondaryKeywords: ['crossword game', 'daily crossword', 'word crossword'],
    longTailKeywords: ['play crossword free online', 'crossword puzzle game', 'fill in crossword', 'word grid puzzle'],
    titleTemplate: 'Crossword Puzzle Online Free - Play Daily Crossword | {brand}',
    descriptionTemplate: 'Play Crossword puzzle online free! Fill in the grid using clues. Classic word puzzle game!',
    intent: 'play'
  },

  // Strategy Games - Additional
  checkers: {
    primaryKeyword: 'checkers game',
    secondaryKeywords: ['checkers online', 'draughts game', 'checkerboard'],
    longTailKeywords: ['play checkers online free', 'checkers vs computer', 'classic checkers', 'jump pieces game'],
    titleTemplate: 'Checkers Game Online Free - Play Classic Board Game | {brand}',
    descriptionTemplate: 'Play Checkers online free! Jump opponent pieces to win. Classic strategy board game vs AI!',
    intent: 'play'
  },
  'connect-four': {
    primaryKeyword: 'connect four game',
    secondaryKeywords: ['connect 4', 'four in a row', 'column drop game'],
    longTailKeywords: ['play connect four online free', 'connect 4 vs computer', 'drop discs game', 'vertical connect'],
    titleTemplate: 'Connect Four Game Online Free - Play 4 in a Row | {brand}',
    descriptionTemplate: 'Play Connect Four online free! Drop discs to connect 4 in a row. Classic strategy game vs AI!',
    intent: 'play'
  },
  'tic-tac-toe': {
    primaryKeyword: 'tic tac toe game',
    secondaryKeywords: ['noughts and crosses', 'XO game', 'three in a row'],
    longTailKeywords: ['play tic tac toe online free', 'tic tac toe vs computer', 'X and O game', 'simple strategy game'],
    titleTemplate: 'Tic Tac Toe Game Online Free - Play X and O | {brand}',
    descriptionTemplate: 'Play Tic Tac Toe online free! Get 3 in a row to win. Classic simple strategy game!',
    intent: 'play'
  },
  'dots-and-boxes': {
    primaryKeyword: 'dots and boxes game',
    secondaryKeywords: ['dots game', 'boxes puzzle', 'line drawing game'],
    longTailKeywords: ['play dots and boxes free', 'connect dots game', 'complete boxes puzzle', 'paper puzzle game'],
    titleTemplate: 'Dots and Boxes Game Online Free - Play Classic Puzzle | {brand}',
    descriptionTemplate: 'Play Dots and Boxes online free! Connect dots to complete boxes. Classic paper-and-pencil game!',
    intent: 'play'
  },

  // Puzzle Games - Additional
  '15-puzzle': {
    primaryKeyword: '15 puzzle game',
    secondaryKeywords: ['sliding puzzle', 'fifteen puzzle', 'tile sliding game'],
    longTailKeywords: ['play 15 puzzle online free', 'sliding tile puzzle', 'number sliding game', 'classic 15 puzzle'],
    titleTemplate: '15 Puzzle Game Online Free - Play Sliding Puzzle | {brand}',
    descriptionTemplate: 'Play 15 Puzzle online free! Slide tiles to arrange numbers 1-15. Classic sliding puzzle game!',
    intent: 'play'
  },
  'simon-says': {
    primaryKeyword: 'simon says game',
    secondaryKeywords: ['simon game', 'memory sequence', 'color memory'],
    longTailKeywords: ['play simon says online free', 'color sequence game', 'memory pattern game', 'follow the pattern'],
    titleTemplate: 'Simon Says Game Online Free - Play Memory Sequence | {brand}',
    descriptionTemplate: 'Play Simon Says online free! Follow the color sequence pattern. Test your memory skills!',
    intent: 'play'
  },
  'lights-out': {
    primaryKeyword: 'lights out puzzle',
    secondaryKeywords: ['lights out game', 'toggle puzzle', 'light switching'],
    longTailKeywords: ['play lights out online free', 'turn off lights puzzle', 'grid toggle game', 'logic light puzzle'],
    titleTemplate: 'Lights Out Puzzle Online Free - Play Toggle Game | {brand}',
    descriptionTemplate: 'Play Lights Out online free! Toggle lights to turn them all off. Logic puzzle game!',
    intent: 'play'
  },
  'peg-solitaire': {
    primaryKeyword: 'peg solitaire game',
    secondaryKeywords: ['peg game', 'marble solitaire', 'jumping pegs'],
    longTailKeywords: ['play peg solitaire online free', 'single peg puzzle', 'jump pegs game', 'classic peg board'],
    titleTemplate: 'Peg Solitaire Game Online Free - Play Peg Board | {brand}',
    descriptionTemplate: 'Play Peg Solitaire online free! Jump pegs to leave only one. Classic board puzzle!',
    intent: 'play'
  },
  jigsaw: {
    primaryKeyword: 'jigsaw puzzle online',
    secondaryKeywords: ['jigsaw game', 'piece puzzle', 'picture puzzle'],
    longTailKeywords: ['play jigsaw online free', 'assemble puzzle pieces', 'image puzzle game', 'drag pieces puzzle'],
    titleTemplate: 'Jigsaw Puzzle Online Free - Play Picture Puzzle | {brand}',
    descriptionTemplate: 'Play Jigsaw puzzle online free! Drag pieces to complete the picture. Relaxing puzzle game!',
    intent: 'play'
  },
  solitaire: {
    primaryKeyword: 'solitaire game online',
    secondaryKeywords: ['klondike solitaire', 'card solitaire', 'patience game'],
    longTailKeywords: ['play solitaire online free', 'classic solitaire', 'card sorting game', 'windows solitaire'],
    titleTemplate: 'Solitaire Game Online Free - Play Classic Cards | {brand}',
    descriptionTemplate: 'Play Solitaire online free! Sort cards by suit from Ace to King. Classic card game!',
    intent: 'play'
  },
  'mahjong-titans': {
    primaryKeyword: 'mahjong titans',
    secondaryKeywords: ['mahjong titans online', 'titan mahjong', 'tile matching'],
    longTailKeywords: ['play mahjong titans free', 'classic mahjong layout', 'titan tile game', 'match tiles puzzle'],
    titleTemplate: 'Mahjong Titans Online Free - Play Classic Tile Game | {brand}',
    descriptionTemplate: 'Play Mahjong Titans online free! Match tiles in classic turtle layout. Relaxing puzzle!',
    intent: 'play'
  },

  // Logic Puzzles - Additional
  hidato: {
    primaryKeyword: 'hidato puzzle',
    secondaryKeywords: ['hidato online', 'number path', 'consecutive numbers'],
    longTailKeywords: ['play hidato online free', 'number sequence puzzle', 'path finding puzzle', 'connect numbers game'],
    titleTemplate: 'Hidato Puzzle Online Free - Play Number Path Game | {brand}',
    descriptionTemplate: 'Play Hidato online free! Connect consecutive numbers in a path. Logic number puzzle!',
    intent: 'play'
  },
  fillomino: {
    primaryKeyword: 'fillomino puzzle',
    secondaryKeywords: ['fillomino online', 'region puzzle', 'polyomino game'],
    longTailKeywords: ['play fillomino online free', 'fill regions puzzle', 'number region game', 'japanese logic puzzle'],
    titleTemplate: 'Fillomino Puzzle Online Free - Play Region Game | {brand}',
    descriptionTemplate: 'Play Fillomino online free! Divide grid into regions matching numbers. Japanese logic puzzle!',
    intent: 'play'
  },
  yajilin: {
    primaryKeyword: 'yajilin puzzle',
    secondaryKeywords: ['yajilin online', 'loop puzzle', 'shade cells'],
    longTailKeywords: ['play yajilin online free', 'japanese loop puzzle', 'arrow clue puzzle', 'paint cells game'],
    titleTemplate: 'Yajilin Puzzle Online Free - Play Japanese Loop Game | {brand}',
    descriptionTemplate: 'Play Yajilin online free! Draw a loop through unpainted cells. Japanese logic puzzle!',
    intent: 'play'
  },
  heyawake: {
    primaryKeyword: 'heyawake puzzle',
    secondaryKeywords: ['heyawake online', 'room puzzle', 'paint cells'],
    longTailKeywords: ['play heyawake online free', 'japanese room puzzle', 'rectangular regions', 'shade cells game'],
    titleTemplate: 'Heyawake Puzzle Online Free - Play Room Logic Game | {brand}',
    descriptionTemplate: 'Play Heyawake online free! Shade cells following room rules. Japanese logic puzzle!',
    intent: 'play'
  },
  aqre: {
    primaryKeyword: 'aqre puzzle',
    secondaryKeywords: ['aqre online', 'shade region', 'japanese puzzle'],
    longTailKeywords: ['play aqre online free', 'region shading puzzle', 'connected cells game', 'logic shade puzzle'],
    titleTemplate: 'Aqre Puzzle Online Free - Play Shade Region Game | {brand}',
    descriptionTemplate: 'Play Aqre online free! Shade cells to form connected regions. Japanese logic puzzle!',
    intent: 'play'
  },
  'castle-wall': {
    primaryKeyword: 'castle wall puzzle',
    secondaryKeywords: ['castle wall online', 'shirokakero', 'wall building'],
    longTailKeywords: ['play castle wall online free', 'japanese wall puzzle', 'grid wall game', 'castle puzzle'],
    titleTemplate: 'Castle Wall Puzzle Online Free - Play Wall Building Game | {brand}',
    descriptionTemplate: 'Play Castle Wall puzzle online free! Build walls following number clues. Japanese logic game!',
    intent: 'play'
  },
  shakashaka: {
    primaryKeyword: 'shakashaka puzzle',
    secondaryKeywords: ['shakashaka online', 'balance puzzle', 'triangle placement'],
    longTailKeywords: ['play shakashaka online free', 'japanese balance puzzle', 'black triangles', 'equilibrium game'],
    titleTemplate: 'Shakashaka Puzzle Online Free - Play Balance Game | {brand}',
    descriptionTemplate: 'Play Shakashaka online free! Place triangles to balance each region. Japanese puzzle!',
    intent: 'play'
  },
  tapa: {
    primaryKeyword: 'tapa puzzle',
    secondaryKeywords: ['tapa online', 'shade cells', 'turkish puzzle'],
    longTailKeywords: ['play tapa online free', 'shade cell puzzle', 'turkish logic puzzle', 'paint by numbers'],
    titleTemplate: 'Tapa Puzzle Online Free - Play Turkish Shade Game | {brand}',
    descriptionTemplate: 'Play Tapa online free! Shade cells following number clues. Turkish logic puzzle!',
    intent: 'play'
  },

  // Arcade Games - Additional
  breakout: {
    primaryKeyword: 'breakout game',
    secondaryKeywords: ['breakout online', 'brick breaker', 'ball paddle'],
    longTailKeywords: ['play breakout online free', 'classic brick game', 'paddle ball game', 'destroy bricks'],
    titleTemplate: 'Breakout Game Online Free - Play Brick Breaker | {brand}',
    descriptionTemplate: 'Play Breakout online free! Use paddle to bounce ball and destroy bricks. Classic arcade game!',
    intent: 'play'
  },
  'brick-breaker': {
    primaryKeyword: 'brick breaker game',
    secondaryKeywords: ['brick breaker online', 'breakout clone', 'smash bricks'],
    longTailKeywords: ['play brick breaker free', 'break bricks game', 'paddle ball arcade', 'brick smash'],
    titleTemplate: 'Brick Breaker Game Online Free - Smash Bricks | {brand}',
    descriptionTemplate: 'Play Brick Breaker online free! Smash all bricks with the ball. Addictive arcade action!',
    intent: 'play'
  },
  'bubble-shooter': {
    primaryKeyword: 'bubble shooter game',
    secondaryKeywords: ['bubble shooter online', 'match bubbles', 'bubble pop'],
    longTailKeywords: ['play bubble shooter free', 'shoot bubbles game', 'match 3 bubbles', 'pop bubble puzzle'],
    titleTemplate: 'Bubble Shooter Game Online Free - Pop Bubbles | {brand}',
    descriptionTemplate: 'Play Bubble Shooter online free! Match 3+ bubbles to pop them. Addictive puzzle arcade!',
    intent: 'play'
  },
  'whack-a-mole': {
    primaryKeyword: 'whack a mole game',
    secondaryKeywords: ['whack a mole online', 'mole hitting', 'reflex game'],
    longTailKeywords: ['play whack a mole free', 'hit moles game', 'arcade reflex game', 'popup mole game'],
    titleTemplate: 'Whack-a-Mole Game Online Free - Hit Moles | {brand}',
    descriptionTemplate: 'Play Whack-a-Mole online free! Hit moles as they pop up. Test your reflexes!',
    intent: 'play'
  },
  'fruit-ninja': {
    primaryKeyword: 'fruit ninja game',
    secondaryKeywords: ['fruit ninja online', 'slice fruit', 'cutting game'],
    longTailKeywords: ['play fruit ninja free', 'slice fruits game', 'fruit cutting arcade', 'ninja slice'],
    titleTemplate: 'Fruit Ninja Game Online Free - Slice Fruits | {brand}',
    descriptionTemplate: 'Play Fruit Ninja online free! Slice fruits with your finger/mouse. Avoid bombs!',
    intent: 'play'
  },
  'flappy-bird': {
    primaryKeyword: 'flappy bird game',
    secondaryKeywords: ['flappy bird online', 'tap fly', 'pipe game'],
    longTailKeywords: ['play flappy bird free', 'tap to fly game', 'bird pipe game', 'flapping bird'],
    titleTemplate: 'Flappy Bird Game Online Free - Tap to Fly | {brand}',
    descriptionTemplate: 'Play Flappy Bird online free! Tap to fly through pipes. Addictive arcade challenge!',
    intent: 'play'
  },
  'doodle-jump': {
    primaryKeyword: 'doodle jump game',
    secondaryKeywords: ['doodle jump online', 'jumping game', 'platform jumper'],
    longTailKeywords: ['play doodle jump free', 'jump platforms game', 'doodler game', 'bounce jump'],
    titleTemplate: 'Doodle Jump Game Online Free - Jump Platforms | {brand}',
    descriptionTemplate: 'Play Doodle Jump online free! Jump on platforms to climb higher. Addictive arcade!',
    intent: 'play'
  },
  'angry-birds': {
    primaryKeyword: 'angry birds game',
    secondaryKeywords: ['angry birds online', 'bird slingshot', 'physics game'],
    longTailKeywords: ['play angry birds free', 'launch birds game', 'slingshot physics', 'destroy pigs'],
    titleTemplate: 'Angry Birds Game Online Free - Launch Birds | {brand}',
    descriptionTemplate: 'Play Angry Birds online free! Launch birds to destroy pig structures. Physics puzzle!',
    intent: 'play'
  },
  'cut-the-rope': {
    primaryKeyword: 'cut the rope game',
    secondaryKeywords: ['cut the rope online', 'om nom', 'rope cutting'],
    longTailKeywords: ['play cut the rope free', 'cut rope puzzle', 'feed candy monster', 'physics rope game'],
    titleTemplate: 'Cut the Rope Game Online Free - Physics Puzzle | {brand}',
    descriptionTemplate: 'Play Cut the Rope online free! Cut ropes to feed candy to Om Nom. Physics puzzle!',
    intent: 'play'
  },
  'tower-defense': {
    primaryKeyword: 'tower defense game',
    secondaryKeywords: ['tower defense online', 'td game', 'defense strategy'],
    longTailKeywords: ['play tower defense free', 'build towers game', 'stop enemies strategy', 'td browser game'],
    titleTemplate: 'Tower Defense Game Online Free - Strategy Game | {brand}',
    descriptionTemplate: 'Play Tower Defense online free! Build towers to stop waves of enemies. Strategy game!',
    intent: 'play'
  },

  // Memory/Skill Games - Additional
  'memory-grid': {
    primaryKeyword: 'memory grid game',
    secondaryKeywords: ['memory grid online', 'grid memory', 'pattern memory'],
    longTailKeywords: ['play memory grid free', 'remember grid pattern', 'visual memory game', 'grid recall'],
    titleTemplate: 'Memory Grid Game Online Free - Pattern Memory | {brand}',
    descriptionTemplate: 'Play Memory Grid online free! Remember and recreate grid patterns. Visual memory training!',
    intent: 'play'
  },
  'pattern-memory': {
    primaryKeyword: 'pattern memory test',
    secondaryKeywords: ['pattern memory game', 'visual memory', 'sequence recall'],
    longTailKeywords: ['play pattern memory free', 'remember patterns game', 'visual memory test', 'pattern recall'],
    titleTemplate: 'Pattern Memory Test Online Free - Visual Memory | {brand}',
    descriptionTemplate: 'Play Pattern Memory test online free! Remember visual patterns. Memory training game!',
    intent: 'play'
  },
  'color-match': {
    primaryKeyword: 'color match game',
    secondaryKeywords: ['color matching', 'color test', 'hue matching'],
    longTailKeywords: ['play color match free', 'match colors game', 'color perception test', 'hue puzzle'],
    titleTemplate: 'Color Match Game Online Free - Color Perception | {brand}',
    descriptionTemplate: 'Play Color Match online free! Match colors accurately. Test your color perception!',
    intent: 'play'
  },
  'speed-math': {
    primaryKeyword: 'speed math game',
    secondaryKeywords: ['mental math', 'math speed test', 'arithmetic practice'],
    longTailKeywords: ['play speed math free', 'fast math game', 'mental arithmetic', 'math drill'],
    titleTemplate: 'Speed Math Game Online Free - Mental Arithmetic | {brand}',
    descriptionTemplate: 'Play Speed Math online free! Solve arithmetic problems quickly. Mental math training!',
    intent: 'play'
  },
  'trivia-quiz': {
    primaryKeyword: 'trivia quiz game',
    secondaryKeywords: ['trivia online', 'quiz game', 'knowledge test'],
    longTailKeywords: ['play trivia quiz free', 'general knowledge quiz', 'trivia questions', 'quiz game online'],
    titleTemplate: 'Trivia Quiz Game Online Free - Knowledge Test | {brand}',
    descriptionTemplate: 'Play Trivia Quiz online free! Test your general knowledge. Fun quiz game!',
    intent: 'play'
  },

  // Classic Board Games
  'chinese-chess': {
    primaryKeyword: 'chinese chess game',
    secondaryKeywords: ['xiangqi', 'chinese chess online', 'elephant game'],
    longTailKeywords: ['play chinese chess free', 'xiangqi online', 'chess variant game', 'asian chess'],
    titleTemplate: 'Chinese Chess Game Online Free - Play Xiangqi | {brand}',
    descriptionTemplate: 'Play Chinese Chess (Xiangqi) online free! Classic strategy board game vs AI!',
    intent: 'play'
  },
  nim: {
    primaryKeyword: 'nim game',
    secondaryKeywords: ['nim online', 'take-away game', 'mathematical game'],
    longTailKeywords: ['play nim online free', 'nimgame puzzle', 'remove objects game', 'math strategy game'],
    titleTemplate: 'Nim Game Online Free - Mathematical Strategy | {brand}',
    descriptionTemplate: 'Play Nim online free! Remove objects strategically to win. Mathematical strategy game!',
    intent: 'play'
  },
  'huarong-pass': {
    primaryKeyword: 'huarong pass puzzle',
    secondaryKeywords: ['klotski', 'sliding block', 'chinese puzzle'],
    longTailKeywords: ['play huarong pass free', 'klotski puzzle online', 'cao cao escape', 'sliding blocks'],
    titleTemplate: 'Huarong Pass Puzzle Online Free - Sliding Block | {brand}',
    descriptionTemplate: 'Play Huarong Pass online free! Slide blocks to help Cao Cao escape. Classic Chinese puzzle!',
    intent: 'play'
  },

  // More Arcade
  'space-invaders': {
    primaryKeyword: 'space invaders game',
    secondaryKeywords: ['space invaders online', 'alien shooter', 'retro arcade'],
    longTailKeywords: ['play space invaders free', 'classic arcade shooter', 'alien invasion game', 'retro space game'],
    titleTemplate: 'Space Invaders Game Online Free - Classic Shooter | {brand}',
    descriptionTemplate: 'Play Space Invaders online free! Shoot alien invaders. Classic 1978 arcade game!',
    intent: 'play'
  },
  asteroids: {
    primaryKeyword: 'asteroids game',
    secondaryKeywords: ['asteroids online', 'space shooter', 'vector game'],
    longTailKeywords: ['play asteroids free', 'classic space game', 'destroy asteroids', 'vector arcade'],
    titleTemplate: 'Asteroids Game Online Free - Space Shooter | {brand}',
    descriptionTemplate: 'Play Asteroids online free! Destroy asteroids and aliens. Classic vector arcade game!',
    intent: 'play'
  },
  centipede: {
    primaryKeyword: 'centipede game',
    secondaryKeywords: ['centipede online', 'bug shooter', 'arcade classic'],
    longTailKeywords: ['play centipede free', 'shoot bugs game', 'mushroom field', 'arcade insect game'],
    titleTemplate: 'Centipede Game Online Free - Bug Shooter | {brand}',
    descriptionTemplate: 'Play Centipede online free! Shoot the descending centipede. Classic arcade action!',
    intent: 'play'
  },
  pong: {
    primaryKeyword: 'pong game',
    secondaryKeywords: ['pong online', 'table tennis', 'two paddles'],
    longTailKeywords: ['play pong online free', 'classic pong game', 'paddle tennis', 'first video game'],
    titleTemplate: 'Pong Game Online Free - Classic Arcade | {brand}',
    descriptionTemplate: 'Play Pong online free! Classic two-paddle table tennis. The first video game!',
    intent: 'play'
  },
  'rubiks-cube': {
    primaryKeyword: 'rubiks cube online',
    secondaryKeywords: ['rubik cube', '3d puzzle', 'cube solver'],
    longTailKeywords: ['play rubiks cube free', 'solve rubik cube', '3d rotation puzzle', 'magic cube'],
    titleTemplate: 'Rubik\'s Cube Online Free - 3D Puzzle Game | {brand}',
    descriptionTemplate: 'Play Rubik\'s Cube online free! Solve the 3D color cube puzzle. Classic brain teaser!',
    intent: 'play'
  },
  'water-sort': {
    primaryKeyword: 'water sort puzzle',
    secondaryKeywords: ['water sort online', 'liquid sorting', 'color pour'],
    longTailKeywords: ['play water sort free', 'sort liquids game', 'pour water puzzle', 'color tube game'],
    titleTemplate: 'Water Sort Puzzle Online Free - Liquid Sorting | {brand}',
    descriptionTemplate: 'Play Water Sort puzzle online free! Pour liquids to sort by color. Addictive puzzle!',
    intent: 'play'
  },
  stack: {
    primaryKeyword: 'stack game',
    secondaryKeywords: ['stack online', 'tower stack', 'block stacking'],
    longTailKeywords: ['play stack game free', 'stack blocks game', 'build tower', 'timing stack'],
    titleTemplate: 'Stack Game Online Free - Tower Building | {brand}',
    descriptionTemplate: 'Play Stack online free! Stack blocks to build the tallest tower. Timing puzzle!',
    intent: 'play'
  },
  'geometry-dash': {
    primaryKeyword: 'geometry dash game',
    secondaryKeywords: ['geometry dash online', 'rhythm jump', 'platform runner'],
    longTailKeywords: ['play geometry dash free', 'jump rhythm game', 'geometric runner', 'music jump'],
    titleTemplate: 'Geometry Dash Game Online Free - Rhythm Jump | {brand}',
    descriptionTemplate: 'Play Geometry Dash online free! Jump to the rhythm through obstacles. Music platformer!',
    intent: 'play'
  },
  'temple-run': {
    primaryKeyword: 'temple run game',
    secondaryKeywords: ['temple run online', 'endless runner', 'running game'],
    longTailKeywords: ['play temple run free', 'endless running game', 'escape temple', 'runner browser'],
    titleTemplate: 'Temple Run Game Online Free - Endless Runner | {brand}',
    descriptionTemplate: 'Play Temple Run online free! Run, jump, and slide to escape. Endless runner!',
    intent: 'play'
  },
  'paper-io': {
    primaryKeyword: 'paper io game',
    secondaryKeywords: ['paper io online', 'territory capture', 'io game'],
    longTailKeywords: ['play paper io free', 'capture territory', 'draw area game', 'io browser game'],
    titleTemplate: 'Paper.io Game Online Free - Territory Capture | {brand}',
    descriptionTemplate: 'Play Paper.io online free! Capture territory by drawing paths. Multiplayer io game!',
    intent: 'play'
  },
  'agar-io': {
    primaryKeyword: 'agar io game',
    secondaryKeywords: ['agar io online', 'cell game', 'eat and grow'],
    longTailKeywords: ['play agar io free', 'eat cells game', 'grow bigger', 'multiplayer io'],
    titleTemplate: 'Agar.io Game Online Free - Cell Eating | {brand}',
    descriptionTemplate: 'Play Agar.io online free! Eat smaller cells to grow. Multiplayer io game!',
    intent: 'play'
  },
  'flow-free': {
    primaryKeyword: 'flow free game',
    secondaryKeywords: ['flow free online', 'pipe connect', 'flow puzzle'],
    longTailKeywords: ['play flow free online', 'connect pipes game', 'color flow puzzle', 'link dots'],
    titleTemplate: 'Flow Free Game Online Free - Connect Pipes | {brand}',
    descriptionTemplate: 'Play Flow Free online free! Connect matching colors with pipes. Logic puzzle!',
    intent: 'play'
  },
  'jewel-quest': {
    primaryKeyword: 'jewel quest game',
    secondaryKeywords: ['jewel quest online', 'gem match', 'match 3 adventure'],
    longTailKeywords: ['play jewel quest free', 'match gems game', 'jewel matching', 'quest puzzle'],
    titleTemplate: 'Jewel Quest Game Online Free - Gem Matching | {brand}',
    descriptionTemplate: 'Play Jewel Quest online free! Match gems to solve puzzles. Adventure match-3!',
    intent: 'play'
  },
  'block-puzzle': {
    primaryKeyword: 'block puzzle game',
    secondaryKeywords: ['block puzzle online', 'wood block', 'fit blocks'],
    longTailKeywords: ['play block puzzle free', 'fit blocks game', 'tetris style puzzle', 'block fitting'],
    titleTemplate: 'Block Puzzle Game Online Free - Fit Blocks | {brand}',
    descriptionTemplate: 'Play Block Puzzle online free! Fit blocks to complete rows. Addictive puzzle!',
    intent: 'play'
  },
  tangram: {
    primaryKeyword: 'tangram puzzle',
    secondaryKeywords: ['tangram online', 'shape puzzle', 'geometric puzzle'],
    longTailKeywords: ['play tangram online free', 'chinese puzzle', 'arrange shapes', 'seven pieces'],
    titleTemplate: 'Tangram Puzzle Online Free - Shape Game | {brand}',
    descriptionTemplate: 'Play Tangram online free! Arrange 7 pieces to form shapes. Classic Chinese puzzle!',
    intent: 'play'
  },
  'text-twist': {
    primaryKeyword: 'text twist game',
    secondaryKeywords: ['text twist online', 'word anagram', 'letter game'],
    longTailKeywords: ['play text twist free', 'unscramble words', 'make words game', 'letter scramble'],
    titleTemplate: 'Text Twist Game Online Free - Word Anagram | {brand}',
    descriptionTemplate: 'Play Text Twist online free! Make words from scrambled letters. Word puzzle!',
    intent: 'play'
  },
  'wordscapes': {
    primaryKeyword: 'wordscapes game',
    secondaryKeywords: ['wordscapes online', 'word search crossword', 'word puzzle'],
    longTailKeywords: ['play wordscapes free', 'word cross game', 'find words puzzle', 'letter wheel'],
    titleTemplate: 'Wordscapes Game Online Free - Word Puzzle | {brand}',
    descriptionTemplate: 'Play Wordscapes online free! Find words from letters. Crossword word search!',
    intent: 'play'
  },
  battleship: {
    primaryKeyword: 'battleship game',
    secondaryKeywords: ['battleship online', 'sink ships', 'naval battle'],
    longTailKeywords: ['play battleship online free', 'sink the fleet', 'guess position game', 'naval strategy'],
    titleTemplate: 'Battleship Game Online Free - Sink Ships | {brand}',
    descriptionTemplate: 'Play Battleship online free! Find and sink enemy ships. Classic naval strategy!',
    intent: 'play'
  },
  'minesweeper-flags': {
    primaryKeyword: 'minesweeper flags game',
    secondaryKeywords: ['minesweeper multiplayer', 'flag mines', 'vs minesweeper'],
    longTailKeywords: ['play minesweeper flags free', 'multiplayer minesweeper', 'flag all mines', 'competitive mines'],
    titleTemplate: 'Minesweeper Flags Game Online Free - Multiplayer | {brand}',
    descriptionTemplate: 'Play Minesweeper Flags online free! Multiplayer mine-finding action!',
    intent: 'play'
  },
  'sudoku-x': {
    primaryKeyword: 'sudoku x puzzle',
    secondaryKeywords: ['diagonal sudoku', 'sudoku x online', 'extreme sudoku'],
    longTailKeywords: ['play sudoku x free', 'diagonal sudoku online', 'x-wing sudoku', 'advanced sudoku'],
    titleTemplate: 'Sudoku X Puzzle Online Free - Diagonal Sudoku | {brand}',
    descriptionTemplate: 'Play Sudoku X online free! Diagonal constraints add challenge. Advanced sudoku!',
    intent: 'play'
  },
  'kenken': {
    primaryKeyword: 'kenken puzzle',
    secondaryKeywords: ['kenken online', 'math sudoku', 'calcudoku style'],
    longTailKeywords: ['play kenken online free', 'math grid puzzle', 'arithmetic sudoku', 'cage math puzzle'],
    titleTemplate: 'KenKen Puzzle Online Free - Math Sudoku | {brand}',
    descriptionTemplate: 'Play KenKen online free! Solve math cages to fill the grid. Arithmetic puzzle!',
    intent: 'play'
  },
  kakurasu: {
    primaryKeyword: 'kakurasu puzzle',
    secondaryKeywords: ['kakurasu online', 'cross sum', 'japanese math'],
    longTailKeywords: ['play kakurasu free', 'cross sums puzzle', 'grid math game', 'japanese number puzzle'],
    titleTemplate: 'Kakurasu Puzzle Online Free - Cross Sum Game | {brand}',
    descriptionTemplate: 'Play Kakurasu online free! Use cross sums to fill the grid. Japanese math puzzle!',
    intent: 'play'
  },
  'sudoku-x': {
    primaryKeyword: 'sudoku x',
    secondaryKeywords: ['diagonal sudoku', 'sudoku variant'],
    longTailKeywords: ['play sudoku x online free', 'extreme sudoku', 'diagonal constraint'],
    titleTemplate: 'Sudoku X Online Free - Diagonal Sudoku | {brand}',
    descriptionTemplate: 'Play Sudoku X online free! Diagonal lines must also contain 1-9. Advanced sudoku variant!',
    intent: 'play'
  },
  threes: {
    primaryKeyword: 'threes game',
    secondaryKeywords: ['threes online', 'number merge', 'sliding numbers'],
    longTailKeywords: ['play threes online free', 'merge numbers game', '2048 predecessor', 'slide and merge'],
    titleTemplate: 'Threes Game Online Free - Number Merge | {brand}',
    descriptionTemplate: 'Play Threes online free! Slide and merge numbers. The original 2048 predecessor!',
    intent: 'play'
  },
  '2048-cupcakes': {
    primaryKeyword: '2048 cupcakes game',
    secondaryKeywords: ['2048 cupcakes online', 'cupcake 2048', 'sweet merge'],
    longTailKeywords: ['play 2048 cupcakes free', 'cupcake merging', 'candy 2048', 'dessert puzzle'],
    titleTemplate: '2048 Cupcakes Game Online Free - Sweet Merge | {brand}',
    descriptionTemplate: 'Play 2048 Cupcakes online free! Merge cupcakes to reach the mega cupcake!',
    intent: 'play'
  },
  'simon-game': {
    primaryKeyword: 'simon game',
    secondaryKeywords: ['simon online', 'color sequence', 'memory game'],
    longTailKeywords: ['play simon game free', 'color memory', 'follow sequence', 'remember pattern'],
    titleTemplate: 'Simon Game Online Free - Color Memory | {brand}',
    descriptionTemplate: 'Play Simon game online free! Remember and repeat color sequences. Memory training!',
    intent: 'play'
  },
  'memory-matrix': {
    primaryKeyword: 'memory matrix game',
    secondaryKeywords: ['memory matrix online', 'pattern recall', 'grid memory'],
    longTailKeywords: ['play memory matrix free', 'remember pattern', 'grid recall', 'visual memory'],
    titleTemplate: 'Memory Matrix Game Online Free - Pattern Recall | {brand}',
    descriptionTemplate: 'Play Memory Matrix online free! Remember grid patterns. Visual memory training!',
    intent: 'play'
  },
  'solitaire-tripeaks': {
    primaryKeyword: 'tripeaks solitaire',
    secondaryKeywords: ['tripeaks online', 'solitaire variant', 'card game'],
    longTailKeywords: ['play tripeaks solitaire free', 'three peaks cards', 'pyramid solitaire', 'card clearing'],
    titleTemplate: 'TriPeaks Solitaire Online Free - Card Game | {brand}',
    descriptionTemplate: 'Play TriPeaks Solitaire online free! Clear cards from three peaks. Fun card game!',
    intent: 'play'
  },
  'shisen-sho': {
    primaryKeyword: 'shisen sho game',
    secondaryKeywords: ['shisen sho online', 'mahjong connect', 'tile matching'],
    longTailKeywords: ['play shisen sho free', 'japanese mahjong', 'connect tiles', 'sichuan mahjong'],
    titleTemplate: 'Shisen Sho Game Online Free - Tile Connect | {brand}',
    descriptionTemplate: 'Play Shisen Sho online free! Connect matching tiles. Japanese mahjong variant!',
    intent: 'play'
  },
  'arrow-puzzle': {
    primaryKeyword: 'arrow puzzle game',
    secondaryKeywords: ['arrow puzzle online', 'direction puzzle', 'arrow sliding'],
    longTailKeywords: ['play arrow puzzle free', 'slide arrows', 'direction logic', 'arrow grid'],
    titleTemplate: 'Arrow Puzzle Game Online Free - Direction Logic | {brand}',
    descriptionTemplate: 'Play Arrow Puzzle online free! Slide arrows to solve the grid. Logic puzzle!',
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
  title: 'Play Wordle, Sudoku, 2048 Online Free - 100+ Puzzle Games | Free Games Hub',
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
    title: 'Free Word Games Online - Play Wordle, Spelling Bee & More | Free Games Hub',
    description: 'Play free word games online: Wordle, Spelling Bee, Word Search, Boggle, Crosswordle and more! Test your vocabulary and word skills. No download required.',
    keywords: 'word games, wordle online, spelling bee, word search, boggle game, crossword puzzle, vocabulary games, free word games'
  },
  logic: {
    title: 'Free Logic & Number Puzzle Games - Sudoku, 2048, Nonogram | Free Games Hub',
    description: 'Play free logic puzzle games: Sudoku, 2048, Nonogram, Minesweeper, KenKen and more! Train your brain with number puzzles. No download required.',
    keywords: 'logic games, sudoku online, 2048 game, nonogram puzzle, minesweeper, number puzzles, brain training, free puzzle games'
  },
  strategy: {
    title: 'Free Strategy Games Online - Chess, Mastermind, Gomoku | Free Games Hub',
    description: 'Play free strategy games: Chess, Mastermind, Gomoku, Reversi, Checkers and more! Test your strategic thinking. No download required.',
    keywords: 'strategy games, chess online, mastermind game, gomoku, reversi, board games, tactical games, free strategy games'
  },
  arcade: {
    title: 'Free Arcade Games Online - Tetris, Snake, Pac-Man | Free Games Hub',
    description: 'Play free classic arcade games: Tetris, Snake, Pac-Man, Space Invaders, Pong and more! Retro gaming fun. No download required.',
    keywords: 'arcade games, tetris online, snake game, pacman, space invaders, classic games, retro games, free arcade games'
  },
  memory: {
    title: 'Free Memory & Brain Training Games Online | Free Games Hub',
    description: 'Play free memory games: Memory Match, Simon Says, Number Memory, Reaction Test and more! Train your brain and improve memory. No download.',
    keywords: 'memory games, brain training, memory test, reaction test, cognitive games, brain games, free memory games'
  },
  skill: {
    title: 'Free Skill Games - Typing Test, Aim Trainer & More | Free Games Hub',
    description: 'Play free skill games: Typing Test, Aim Trainer, Reaction Time, Color Match and more! Test and improve your skills. No download required.',
    keywords: 'skill games, typing test, aim trainer, reaction test, typing speed, mouse accuracy, free skill games'
  },
  puzzle: {
    title: 'Free Puzzle Games Online - Mahjong, Match-3, Solitaire | Free Games Hub',
    description: 'Play free puzzle games: Mahjong Solitaire, Match-3, Solitaire, Jigsaw and more! Relaxing puzzle fun. No download required.',
    keywords: 'puzzle games, mahjong solitaire, match 3 game, solitaire, jigsaw puzzle, relaxing games, free puzzle games'
  }
}
