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
  // AI Story Games
  'ai-dating-simulator': {
    primaryKeyword: 'AI dating simulator',
    secondaryKeywords: ['dating sim online', 'AI dating game', 'virtual dating', 'interactive romance', 'AI love story'],
    longTailKeywords: ['play AI dating simulator free', 'AI dating sim no download', 'interactive dating story game', 'AI romance game online free'],
    titleTemplate: 'AI Dating Simulator - Play Interactive Romance Game Online Free | {brand}',
    descriptionTemplate: 'Play AI Dating Simulator free! Make choices that shape your love story with AI characters. 3 love interests, 4 endings. No download!',
    intent: 'play'
  },
  'ai-murder-mystery': {
    primaryKeyword: 'AI murder mystery game',
    secondaryKeywords: ['murder mystery online', 'detective game', 'AI detective', 'whodunit game', 'interactive mystery'],
    longTailKeywords: ['play AI murder mystery free', 'online detective game no download', 'interactive murder mystery AI', 'free whodunit puzzle game'],
    titleTemplate: 'AI Murder Mystery - Play Detective Game Online Free | {brand}',
    descriptionTemplate: 'Play AI Murder Mystery free! Interrogate 4 suspects, find clues, and crack the case before dawn. AI-powered detective game with unique killer each time!',
    intent: 'play'
  },
  'ai-escape-room': {
    primaryKeyword: 'AI escape room',
    secondaryKeywords: ['escape room online', 'virtual escape room', 'puzzle room game', 'AI puzzle game'],
    longTailKeywords: ['play escape room online free', 'AI escape room no download', 'virtual puzzle room browser game', 'free online escape game'],
    titleTemplate: 'AI Escape Room - Solve Puzzles & Escape Online Free | {brand}',
    descriptionTemplate: 'Play AI Escape Room free! Solve 5 unique puzzle rooms — ciphers, mirrors, logic grids, and more. AI Game Master adapts to your skill. No download!',
    intent: 'play'
  },
  'ai-convince': {
    primaryKeyword: 'convince the AI game',
    secondaryKeywords: ['AI persuasion game', 'convince AI not to launch', 'AI negotiation', 'AI chat game', 'persuasion puzzle'],
    longTailKeywords: ['play convince the AI free', 'AI persuasion game online', 'convince AI game no download', 'can you change AI mind game'],
    titleTemplate: 'Convince the AI - 5 Messages to Stop Disaster | {brand}',
    descriptionTemplate: 'Play Convince the AI free! You have 5 messages to persuade an AI not to launch nuclear missiles. A viral persuasion challenge. No download required!',
    intent: 'play'
  },
  'ai-fantasy-adventure': {
    primaryKeyword: 'AI fantasy RPG',
    secondaryKeywords: ['AI dungeon master', 'fantasy adventure game', 'AI RPG online', 'text adventure AI', 'fantasy quest game'],
    longTailKeywords: ['play AI fantasy RPG free', 'AI dungeon master game online', 'free fantasy text adventure AI', 'AI RPG no download browser'],
    titleTemplate: 'AI Fantasy Adventure - Play AI RPG Quest Online Free | {brand}',
    descriptionTemplate: 'Play AI Fantasy Adventure free! Epic RPG quest with AI dungeon master. Battle monsters, find relics, save the kingdom. 4 unique endings. No download!',
    intent: 'play'
  },
  'ai-youtube-tycoon': {
    primaryKeyword: 'YouTube simulator',
    secondaryKeywords: ['YouTube tycoon game', 'content creator simulator', 'vlogger game', 'streamer simulator', 'YouTube channel game'],
    longTailKeywords: ['play YouTube simulator free', 'content creator game online', 'YouTube tycoon no download', 'vlogger simulator browser game'],
    titleTemplate: 'YouTube Tycoon - Build Your Channel Simulator Game | {brand}',
    descriptionTemplate: 'Play YouTube Tycoon free! Start a channel, go viral, land brand deals, and build your creator empire. AI-powered content creator simulator with multiple endings!',
    intent: 'play'
  },
  'startup-simulator': {
    primaryKeyword: 'startup simulator',
    secondaryKeywords: ['business simulator game', 'entrepreneur game', 'startup tycoon', 'Silicon Valley game', 'founder simulator'],
    longTailKeywords: ['play startup simulator free', 'business tycoon game online', 'entrepreneur simulator no download', 'Silicon Valley startup game browser'],
    titleTemplate: 'Startup Simulator - Build Your Tech Empire Game | {brand}',
    descriptionTemplate: 'Play Startup Simulator free! Pitch investors, build your MVP, hire talent, and take your startup from garage to IPO. AI-powered business simulator with 4+ endings!',
    intent: 'play'
  },
  'ai-zombie-survival': {
    primaryKeyword: 'zombie survival game',
    secondaryKeywords: ['zombie apocalypse game', 'survival horror online', 'zombie story game', 'AI zombie game', 'text adventure zombie'],
    longTailKeywords: ['play zombie survival game free', 'zombie apocalypse simulator online', 'AI zombie horror story game', 'survival text adventure browser'],
    titleTemplate: 'AI Zombie Survival - Post-Apocalypse Story Game | {brand}',
    descriptionTemplate: 'Play AI Zombie Survival free! Lead survivors through the apocalypse. Scavenge, make tough choices, fight the undead. AI survival horror, 4 endings. No download!',
    intent: 'play'
  },
  'ai-crypto-trader': {
    primaryKeyword: 'crypto trading simulator',
    secondaryKeywords: ['cryptocurrency game', 'Bitcoin simulator', 'crypto tycoon', 'trading game online', 'crypto trader game'],
    longTailKeywords: ['play crypto trading simulator free', 'Bitcoin trading game online', 'cryptocurrency simulator no download', 'crypto tycoon browser game'],
    titleTemplate: 'Crypto Trader Simulator - Bitcoin Trading Game | {brand}',
    descriptionTemplate: 'Play Crypto Trader Simulator free! Trade Bitcoin, spot rug pulls, ride bull runs, and build your crypto empire. AI-powered trading game with 4+ endings. No download!',
    intent: 'play'
  },
  'ai-personality-quiz': {
    primaryKeyword: 'AI personality test',
    secondaryKeywords: ['personality quiz online', 'AI personality quiz', 'personality test free', 'who am I quiz', 'personality type test'],
    longTailKeywords: ['take AI personality test free', 'online personality quiz no download', 'AI personality quiz game', 'free personality test accurate'],
    titleTemplate: 'AI Personality Quiz - Discover Your True Type Free | {brand}',
    descriptionTemplate: 'Take our free AI Personality Quiz! 8 vivid scenarios reveal your true personality type across 4 dimensions. 8 unique results. AI-adapted questions. Share with friends!',
    intent: 'play'
  },
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
    primaryKeyword: 'boggle online free',
    secondaryKeywords: ['boggle game', 'play boggle free', 'boggle word game', 'boggle no download', '4x4 boggle', '5x5 boggle'],
    longTailKeywords: ['boggle online free no download', 'play boggle word game', 'free boggle game online', '4x4 word puzzle', 'boggle word finder', 'boggle rules and scoring', 'boggle strategy tips'],
    titleTemplate: 'Play Boggle Online Free - Classic Word Game in Your Browser | {brand}',
    descriptionTemplate: 'Play Boggle free in your browser — no download required! Find words in a 4x4 letter grid, race against time. Classic word search game with scoring, strategy tips, and unlimited plays.',
    intent: 'play'
  },
  crosswordle: {
    primaryKeyword: 'crosswordle',
    secondaryKeywords: ['crosswordle game', 'crossword wordle', 'word grid puzzle', 'letter swap game'],
    longTailKeywords: ['play crosswordle online free', 'crosswordle game rules', 'word grid puzzle online', 'crosswordle strategy tips', 'how to play crosswordle'],
    titleTemplate: 'Crosswordle - Crossword Meets Wordle (Free Online Puzzle)',
    descriptionTemplate: 'Wordle + Crossword = Crosswordle! Swap letters to build valid words in both directions. Daily puzzles + unlimited mode. Brain-training word game — free, no download!',
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
    secondaryKeywords: ['2048 online', 'number puzzle', 'sliding puzzle', '2048 strategy', 'how to win 2048'],
    longTailKeywords: ['play 2048 online free', '2048 tile game', 'merge numbers game', '2048 strategy guide', 'how to win 2048', '2048 tips and tricks', 'best 2048 strategy'],
    titleTemplate: '2048 Game - Slide, Merge & Win! (Free + Strategy Guide)',
    descriptionTemplate: 'The original 2048 number puzzle! Slide tiles to merge them — reach 2048 to win. Includes built-in strategy guide with the corner technique. Free, no download!',
    intent: 'play'
  },
  minesweeper: {
    primaryKeyword: 'minesweeper online',
    secondaryKeywords: ['minesweeper game', 'mine sweeper', 'classic puzzle', 'minesweeper free'],
    longTailKeywords: ['play minesweeper free', 'minesweeper classic game', 'avoid mines puzzle', 'windows minesweeper', 'minesweeper online free game'],
    titleTemplate: 'Minesweeper - Classic Puzzle Game (Free, 3 Difficulty Levels)',
    descriptionTemplate: 'The classic Minesweeper you remember! Right-click to flag mines, uncover safe squares. Easy, Medium & Hard modes. Free in browser — no download, start playing!',
    intent: 'play'
  },
  nonogram: {
    primaryKeyword: 'nonogram puzzle',
    secondaryKeywords: ['picross', 'picture puzzle', 'grid puzzle', 'paint by numbers'],
    longTailKeywords: ['play nonogram online free', 'picross puzzle game', 'picture cross puzzle', 'paint by numbers game'],
    titleTemplate: 'Nonogram (Picross) Puzzle - Play Online Free | {brand}',
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
    primaryKeyword: 'mastermind game online free',
    secondaryKeywords: ['mastermind online', 'code breaking game', 'mastermind puzzle', 'play mastermind free'],
    longTailKeywords: ['play mastermind online free', 'mastermind game rules', 'code breaking puzzle', 'logic deduction game'],
    titleTemplate: 'Mastermind Game Online Free - Play Code Breaking | {brand}',
    descriptionTemplate: 'Play Mastermind game online free! Crack the secret color code using logic and deduction. Classic board game, multiple difficulty levels. No download, play instantly!',
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

  // Note: nonogram SEO is defined earlier in the file with picross keyword
  slitherlink: {
    primaryKeyword: 'slitherlink puzzle',
    secondaryKeywords: ['slitherlink online', 'loop puzzle', 'fences puzzle', 'suraromu', 'logic loop game'],
    longTailKeywords: ['play slitherlink online free', 'slitherlink rules explained', 'how to solve slitherlink', 'slitherlink tips and strategy', 'single loop puzzle guide'],
    titleTemplate: 'Slitherlink Puzzle Online Free - Play Loop Logic Game | {brand}',
    descriptionTemplate: 'Play Slitherlink free in your browser! Draw a single loop through the grid using number clues. Japanese logic puzzle — no download, 100+ levels. Play now!',
    intent: 'play'
  },
  suguru: {
    primaryKeyword: 'suguru game',
    secondaryKeywords: ['suguru puzzle', 'suguru online', 'number regions', 'japanese number puzzle'],
    longTailKeywords: ['play suguru online free', 'suguru puzzle rules', 'how to solve suguru', 'suguru strategy tips', 'number region puzzle game'],
    titleTemplate: 'Suguru Puzzle Online Free - Play Japanese Number Game | {brand}',
    descriptionTemplate: 'Play Suguru free in your browser! Fill regions with numbers so no adjacent cells share the same value. Pure logic Japanese puzzle — no download, no guessing. Play now!',
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
    titleTemplate: 'Star Battle Puzzle - Place Stars Without Touching (Free)',
    descriptionTemplate: 'Place stars so no two touch — even diagonally! Each row, column & region gets exactly 2. 50+ logic puzzles from easy to expert. Free, instant play!',
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
    primaryKeyword: 'skyscrapers game',
    secondaryKeywords: ['skyscrapers puzzle online', 'skyscrapers puzzle', 'building puzzle', 'visibility puzzle'],
    longTailKeywords: ['play skyscrapers game online free', 'skyscrapers puzzle rules', 'how to solve skyscrapers', 'skyscrapers strategy tips', 'building visibility puzzle guide'],
    titleTemplate: 'Skyscrapers Puzzle Game - Play Online Free | {brand}',
    descriptionTemplate: 'Play Skyscrapers puzzle free in your browser! Place buildings so the visible count from each side matches clues. Sudoku-style 3D logic puzzle — no download, play now!',
    intent: 'play'
  },
  hitori: {
    primaryKeyword: 'hitori puzzle',
    secondaryKeywords: ['hitori online', 'shade cells', 'japanese elimination', 'nikoli puzzle'],
    longTailKeywords: ['hitori puzzle online free', 'play hitori game', 'hitori rules', 'shade duplicate numbers'],
    titleTemplate: 'Hitori Puzzle - Play Online Free (No Download) | {brand}',
    descriptionTemplate: 'Play Hitori online free! Shade duplicate numbers so no row/column has repeats — unshaded cells must stay connected. Japanese Nikoli puzzle, 100+ levels!',
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
    descriptionTemplate: '佛系消消消在线免费玩！超解压的逻辑消消乐游戏，根据数字提示画出矩形区域。无需下载即可在线畅玩，轻松又治愈！',
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
    primaryKeyword: 'heyawake',
    secondaryKeywords: ['heyawake puzzle', 'heyawake online', 'japanese room puzzle', 'shade cells puzzle'],
    longTailKeywords: ['play heyawake online free', 'heyawake rules explained', 'how to solve heyawake', 'heyawake strategy tips', 'japanese room shading puzzle guide'],
    titleTemplate: 'Heyawake Puzzle - Play Online Free (No Download) | {brand}',
    descriptionTemplate: 'Play Heyawake free in your browser! Shade cells in rooms using number clues — no 3-in-a-row, all whites connected. Japanese Nikoli logic puzzle, 100+ levels. Play now!',
    intent: 'play'
  },
  aqre: {
    primaryKeyword: 'aqre puzzle',
    secondaryKeywords: ['aqre game', 'aqre online', 'shade region puzzle', 'japanese shading puzzle'],
    longTailKeywords: ['play aqre online free', 'aqre rules explained', 'how to solve aqre', 'aqre strategy guide', 'japanese shade puzzle tips'],
    titleTemplate: 'Aqre Puzzle - Play Online Free (No Download) | {brand}',
    descriptionTemplate: 'Play Aqre puzzle free in your browser! Shade cells so each region has the right count — no 3 shaded in a row, all whites connected. Japanese Nikoli logic puzzle. Play now!',
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
    primaryKeyword: 'shakashaka',
    secondaryKeywords: ['shakashaka puzzle', 'shakashaka online', 'triangle puzzle', 'rectangle puzzle', 'nikoli puzzle'],
    longTailKeywords: ['play shakashaka online free', 'shakashaka rules explained', 'how to solve shakashaka', 'shakashaka strategy tips', 'japanese triangle puzzle guide'],
    titleTemplate: 'Shakashaka - 100+ Triangle Logic Puzzles (Free, No Download)',
    descriptionTemplate: 'Can you place triangles to form perfect rectangles? 100+ Nikoli logic puzzles from easy to expert. Unique Japanese brain teaser — start solving Shakashaka now!',
    intent: 'play'
  },
  tapa: {
    primaryKeyword: 'tapa puzzle',
    secondaryKeywords: ['tapa online', 'tapa games', 'shade cells puzzle'],
    longTailKeywords: ['play tapa online free', 'tapa puzzle rules', 'tapa logic puzzle', 'how to play tapa'],
    titleTemplate: 'Tapa Puzzle - Shade Cells, Build Walls (100+ Free Puzzles)',
    descriptionTemplate: 'Shade cells to build a continuous wall using number clues — sounds easy? 100+ Tapa puzzles from beginner to expert. Free, instant play, no download!',
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
    secondaryKeywords: ['cut the rope online', 'om nom', 'rope cutting', 'cut the rope free'],
    longTailKeywords: ['play cut the rope free', 'cut rope puzzle', 'feed candy monster', 'physics rope game', 'cut the rope unblocked'],
    titleTemplate: 'Cut the Rope - Feed Om Nom! Free Physics Puzzle Game',
    descriptionTemplate: 'Swipe to cut ropes and swing candy into Om Nom\'s mouth! 25 physics puzzles with bubbles, air cushions & stars to collect. The classic game — free in browser!',
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
    titleTemplate: 'Memory Grid - Remember & Recreate Patterns (Brain Training)',
    descriptionTemplate: 'See it. Remember it. Recreate it. Grid patterns grow larger as you level up. Tracks your visual memory score — can you beat level 10? Free brain training game!',
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
    secondaryKeywords: ['color matching', 'stroop effect', 'stroop test', 'color test'],
    longTailKeywords: ['play color match free', 'stroop effect game', 'color perception test', 'color word challenge'],
    titleTemplate: 'Color Match Game Online Free - Stroop Effect Challenge | {brand}',
    descriptionTemplate: 'Play Color Match online free! Test your brain with the classic Stroop Effect challenge. Can you name the color, not read the word? Track your speed and accuracy!',
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
    primaryKeyword: 'free chinese chess',
    secondaryKeywords: ['xiangqi', 'chinese chess online', 'chinese chess game', 'play chinese chess free'],
    longTailKeywords: ['play chinese chess online free', 'xiangqi vs ai', 'chinese chess rules', 'learn xiangqi'],
    titleTemplate: 'Free Chinese Chess Online - Play Xiangqi vs AI | {brand}',
    descriptionTemplate: 'Play Chinese Chess (Xiangqi) online free! Battle our smart AI opponent. Learn piece movements, opening strategies and checkmate patterns. No download required!',
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

  // Note: space-invaders SEO is defined earlier in the file
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
    secondaryKeywords: ['flow free online', 'connect dots', 'pipe puzzle', 'flow puzzle'],
    longTailKeywords: ['play flow free online', 'connect matching dots', 'color flow puzzle', 'pipe connect game'],
    titleTemplate: 'Flow Free - Connect Colored Dots Puzzle (Free Online)',
    descriptionTemplate: 'Connect matching dots with pipes — but they can\'t cross! 200+ levels from warm-up to brain-buster. The #1 pipe connect puzzle. Free, no download, play now!',
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
  // Note: sudoku-x SEO is defined earlier (line 836) with more keywords
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
    titleTemplate: 'Memory Matrix - Flash & Recall Pattern Game (Free)',
    descriptionTemplate: 'Tiles flash, then disappear — can you remember which ones? Levels get harder as your score climbs. Scientific brain training that\'s actually fun. Free, instant play!',
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
    primaryKeyword: 'shisen sho',
    secondaryKeywords: ['shisen sho online free', 'shisen sho mahjong solitaire', 'mahjong connect', 'sichuan mahjong'],
    longTailKeywords: ['play shisen sho free', 'shisen sho mahjong solitaire free', 'japanese mahjong connect', 'tile matching game'],
    titleTemplate: 'Shisen Sho Mahjong Solitaire - Play Online Free | {brand}',
    descriptionTemplate: 'Play Shisen Sho (Mahjong Solitaire) online free! Match identical tiles connected by a path with at most 2 turns. No download, play instantly in browser!',
    intent: 'play'
  },
  'arrow-puzzle': {
    primaryKeyword: 'arrow puzzle game',
    secondaryKeywords: ['arrow puzzle online', 'direction puzzle', 'arrow sliding'],
    longTailKeywords: ['play arrow puzzle free', 'slide arrows', 'direction logic', 'arrow grid'],
    titleTemplate: 'Arrow Puzzle Game Online Free - Direction Logic | {brand}',
    descriptionTemplate: 'Play Arrow Puzzle online free! Slide arrows to solve the grid. Logic puzzle!',
    intent: 'play'
  },
  binary: {
    primaryKeyword: 'binary puzzle',
    secondaryKeywords: ['binary puzzle online', 'takuzu', 'binairo', '0 1 puzzle'],
    longTailKeywords: ['play binary puzzle free', 'takuzu rules', 'binairo online', '0 and 1 logic game'],
    titleTemplate: 'Binary Puzzle (Takuzu) - Play Online Free | {brand}',
    descriptionTemplate: 'Play Binary Puzzle (Takuzu/Binairo) online free! Fill the grid with 0s and 1s — no three in a row, equal counts per row/column. Pure logic, no math!',
    intent: 'play'
  },
  frogger: {
    primaryKeyword: 'frogger game',
    secondaryKeywords: ['frogger online', 'frog crossing game', 'retro arcade'],
    longTailKeywords: ['play frogger online free', 'classic frogger game', 'frog crossing road', 'retro arcade game'],
    titleTemplate: 'Frogger Game Online Free - Classic Arcade | {brand}',
    descriptionTemplate: 'Play Frogger online free! Help the frog cross busy roads and rivers. Classic 80s arcade game!',
    intent: 'play'
  },
  'among-us': {
    primaryKeyword: 'among us game',
    secondaryKeywords: ['among us online', 'impostor game', 'social deduction'],
    longTailKeywords: ['play among us online free', 'impostor browser game', 'crewmate game', 'space social game'],
    titleTemplate: 'Among Us Game Online Free - Space Impostor | {brand}',
    descriptionTemplate: 'Play Among Us online free! Control your crewmate, complete tasks, and find the impostor!',
    intent: 'play'
  },
  'reaction-time': {
    primaryKeyword: 'reaction time test',
    secondaryKeywords: ['reaction speed test', 'reflex test online', 'click speed'],
    longTailKeywords: ['reaction time test free', 'test reaction speed online', 'fast click test', 'human reaction time test'],
    titleTemplate: 'Reaction Time Test Online Free - Speed Test | {brand}',
    descriptionTemplate: 'Test your reaction time online free! Measure your reflex speed in milliseconds. Free, no download!',
    intent: 'play'
  },
  sokoban: {
    primaryKeyword: 'sokoban game',
    secondaryKeywords: ['sokoban online', 'warehouse puzzle', 'push box game'],
    longTailKeywords: ['play sokoban online free', 'box pushing puzzle', 'warehouse keeper game', 'logic push game'],
    titleTemplate: 'Sokoban Game Online Free - Warehouse Puzzle | {brand}',
    descriptionTemplate: 'Play Sokoban online free! Push boxes onto target spots. Classic warehouse logic puzzle!',
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
