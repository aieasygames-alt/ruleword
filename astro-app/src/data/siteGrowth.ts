export type GrowthGameSlug =
  | 'boggle'
  | 'reaction-time'
  | 'typing-test'
  | 'sudoku'
  | '2048'
  | 'checkers'
  | 'chess'

export type GameSeoUpgrade = {
  slug: GrowthGameSlug
  intentLabel: string
  searchIntent: string
  playabilityUpgrade: string
  contentUpgrade: string
  nextGameIdeas: string[]
  faq: Array<{ question: string; answer: string }>
  internalLinks: Array<{ href: string; label: string }>
}

export const opportunityGameSlugs: GrowthGameSlug[] = [
  'boggle',
  'reaction-time',
  'typing-test',
  'sudoku',
  '2048',
  'checkers',
  'chess',
]

export const newAndUpdatedGameSlugs = [
  'boggle',
  'crosswordle',
  'queens',
  'police-escape',
  'reaction-time',
  'typing-test',
  'checkers',
  'shakashaka',
  'star-battle',
  'binary',
  'tapa',
  'flow-free',
]

export const gameSeoUpgrades: Record<string, GameSeoUpgrade> = {
  'reaction-time': {
    slug: 'reaction-time',
    intentLabel: 'Reflex benchmark',
    searchIntent: 'Players want a fast reaction time test with an instant score, a simple explanation of what the number means, and a reason to retry.',
    playabilityUpgrade: 'Track best and average reaction speed, explain result ranges, and encourage 3-5 repeat attempts for a stable benchmark.',
    contentUpgrade: 'Pair the playable test with definitions, average reaction time ranges, improvement tips, and links to typing, aim, and Stroop tests.',
    nextGameIdeas: ['CPS Test', 'Spacebar Counter', 'Visual Reflex Test'],
    internalLinks: [
      { href: '/games/typing-test/', label: 'Typing Test' },
      { href: '/games/chimp-test/', label: 'Chimp Test' },
      { href: '/games/stroop-test/', label: 'Stroop Test' },
      { href: '/hubs/brain-training/', label: 'Brain Training Hub' },
    ],
    faq: [
      {
        question: 'What is a good reaction time?',
        answer: 'A typical visual reaction time is often around 200-250 ms. Scores below 200 ms are strong, and very low scores should be averaged across several attempts.',
      },
      {
        question: 'Why should I play multiple rounds?',
        answer: 'Reaction speed varies with focus, device latency, fatigue, and anticipation. Several rounds give a more reliable benchmark than a single click.',
      },
    ],
  },
  'typing-test': {
    slug: 'typing-test',
    intentLabel: 'WPM benchmark',
    searchIntent: 'Players want a quick typing speed test that reports WPM, accuracy, and a practical way to improve.',
    playabilityUpgrade: 'Show WPM, accuracy, recent attempts, and replay options for 1-minute and 3-minute tests.',
    contentUpgrade: 'Explain WPM, accuracy, consistency, and link typing practice to reaction and focus tests.',
    nextGameIdeas: ['Typing Practice Quotes', 'Keyboard Accuracy Drill', 'Typing Race'],
    internalLinks: [
      { href: '/games/reaction-time/', label: 'Reaction Time Test' },
      { href: '/games/stroop-test/', label: 'Stroop Test' },
      { href: '/hubs/brain-training/', label: 'Brain Training Hub' },
      { href: '/guides/typing-test/', label: 'Typing Test Guide' },
    ],
    faq: [
      {
        question: 'What does WPM mean?',
        answer: 'WPM means words per minute. It estimates typing speed using standardized word length, usually while also measuring accuracy.',
      },
      {
        question: 'Is accuracy more important than speed?',
        answer: 'For real typing improvement, accuracy should come first. Once mistakes drop, speed usually improves more sustainably.',
      },
    ],
  },
  sudoku: {
    slug: 'sudoku',
    intentLabel: 'Daily logic puzzle',
    searchIntent: 'Players want instant Sudoku with difficulty choices, clear rules, and solving help when they get stuck.',
    playabilityUpgrade: 'Emphasize difficulty modes, notes, mistake recovery, and daily practice loops.',
    contentUpgrade: 'Add solving technique explanations, beginner progression, and links to 2048, Killer Sudoku, and Kakuro.',
    nextGameIdeas: ['Daily Sudoku Archive', 'Killer Sudoku Trainer', 'Sudoku X Practice'],
    internalLinks: [
      { href: '/games/2048/', label: '2048' },
      { href: '/games/killer-sudoku/', label: 'Killer Sudoku' },
      { href: '/games/kakuro/', label: 'Kakuro' },
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
    ],
    faq: [
      {
        question: 'Do I need math to play Sudoku?',
        answer: 'No. Sudoku uses digits, but the puzzle is about logic, placement, and elimination rather than arithmetic.',
      },
      {
        question: 'What is the best way to improve at Sudoku?',
        answer: 'Start with easy boards, scan rows and boxes systematically, use notes, and learn pairs, triples, and hidden singles before advanced patterns.',
      },
    ],
  },
  '2048': {
    slug: '2048',
    intentLabel: 'Number merge strategy',
    searchIntent: 'Players want a quick 2048 game plus the corner strategy that helps them reach higher tiles.',
    playabilityUpgrade: 'Highlight restart speed, score chasing, variant modes, and simple replay loops.',
    contentUpgrade: 'Explain the corner method, board control, common mistakes, and alternatives like Threes and 2048 Cupcakes.',
    nextGameIdeas: ['2048 Undo Practice', '2048 Challenge Board', 'Threes Strategy Trainer'],
    internalLinks: [
      { href: '/guides/2048/', label: '2048 Strategy Guide' },
      { href: '/games/threes/', label: 'Threes' },
      { href: '/games/2048-cupcakes/', label: '2048 Cupcakes' },
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
    ],
    faq: [
      {
        question: 'What is the best 2048 strategy?',
        answer: 'Keep your largest tile in one corner, build a descending chain next to it, and avoid moves that break the corner structure.',
      },
      {
        question: 'Is 2048 luck or skill?',
        answer: 'Tile spawns add randomness, but consistent board control and corner discipline make a large difference over many games.',
      },
    ],
  },
  checkers: {
    slug: 'checkers',
    intentLabel: 'Classic strategy game',
    searchIntent: 'Players want to play checkers online against the computer and quickly understand captures, kings, and tactics.',
    playabilityUpgrade: 'Clarify opponent mode, legal captures, multi-jumps, kinging, and replay after a loss.',
    contentUpgrade: 'Add basic tactics, opening principles, endgame tips, and links to Chess, Connect Four, and Gomoku.',
    nextGameIdeas: ['Checkers Puzzle Trainer', 'Checkers Endgame Practice', 'Draughts Variant'],
    internalLinks: [
      { href: '/games/chess/', label: 'Chess' },
      { href: '/games/connect-four/', label: 'Connect Four' },
      { href: '/games/gomoku/', label: 'Gomoku' },
      { href: '/hubs/strategy-games/', label: 'Strategy Games Hub' },
    ],
    faq: [
      {
        question: 'What is the main goal in Checkers?',
        answer: 'Capture all opposing pieces or block them so they have no legal move.',
      },
      {
        question: 'How do you get better at Checkers?',
        answer: 'Control the center, look for forced captures, protect your back row early, and plan multi-jump sequences before moving.',
      },
    ],
  },
  chess: {
    slug: 'chess',
    intentLabel: 'Board strategy anchor',
    searchIntent: 'Players want a quick chess board, beginner-friendly context, and nearby classic strategy alternatives.',
    playabilityUpgrade: 'Clarify AI difficulty, legal move help, restart flow, and beginner practice paths.',
    contentUpgrade: 'Link chess to checkers, Gomoku, Connect Four, and beginner guide content for broader strategy intent.',
    nextGameIdeas: ['Chess Puzzle Trainer', 'Opening Practice', 'Endgame Basics'],
    internalLinks: [
      { href: '/games/checkers/', label: 'Checkers' },
      { href: '/games/gomoku/', label: 'Gomoku' },
      { href: '/games/connect-four/', label: 'Connect Four' },
      { href: '/hubs/strategy-games/', label: 'Strategy Games Hub' },
    ],
    faq: [
      {
        question: 'Is this chess game good for beginners?',
        answer: 'Yes. The page is designed for quick browser play and links to simpler strategy games if you want to build tactical habits gradually.',
      },
      {
        question: 'What should beginners practice first?',
        answer: 'Start with piece movement, checks, captures, and simple mating patterns before memorizing long openings.',
      },
    ],
  },
}

export const plannedGameClusters = [
  {
    title: 'Word Games',
    description: 'Build from Boggle into more grid, anagram, and daily word discovery games.',
    games: ['Word Hunt', 'Word Ladder', 'Letter Boxed-style puzzle', 'Mini Daily Boggle'],
    href: '/hubs/word-games/',
  },
  {
    title: 'Brain Tests',
    description: 'Expand reaction, typing, memory, and focus tests into a measurable training suite.',
    games: ['CPS Test', 'Spacebar Counter', 'Visual Memory', 'Verbal Memory'],
    href: '/hubs/brain-training/',
  },
  {
    title: 'Classic Strategy',
    description: 'Deepen replay around board games that support tactics, AI difficulty, and guides.',
    games: ['Checkers Trainer', 'Gomoku AI Levels', 'Connect Four Puzzles', 'Chess Basics'],
    href: '/hubs/strategy-games/',
  },
  {
    title: 'AI Story Games',
    description: 'Turn stories into a stronger product line with genres, variants, and shareable endings.',
    games: ['AI Courtroom', 'AI Negotiation', 'AI Detective Cases', 'AI Survival Choices'],
    href: '/hubs/ai-games/',
  },
]

export type CategoryGrowthPlan = {
  title: string
  searchIntent: string
  playabilityFocus: string
  contentFocus: string
  priorityGames: string[]
  contentGaps: string[]
  nextAdditions: string[]
  links: Array<{ href: string; label: string }>
}

export const categoryGrowthPlans: Record<string, CategoryGrowthPlan> = {
  word: {
    title: 'Word Games Growth Plan',
    searchIntent: 'Players want fast vocabulary games with clear rules, daily or repeatable rounds, and alternatives to Wordle, Boggle, Spelling Bee, and word search.',
    playabilityFocus: 'Prioritize replayable boards, daily word challenges, missed-word review, hints, and shareable results.',
    contentFocus: 'Build rules, scoring, strategy, and comparison content around Boggle, Crosswordle, Wordle, Spelling Bee, and Word Search.',
    priorityGames: ['boggle', 'crosswordle', 'wordle', 'spelling-bee'],
    contentGaps: ['Boggle variants comparison', 'Word games for vocabulary practice', 'Daily word games hub'],
    nextAdditions: ['Word Hunt', 'Word Ladder', 'Mini Daily Boggle'],
    links: [
      { href: '/hubs/word-games/', label: 'Word Games Hub' },
      { href: '/guides/boggle/', label: 'Boggle Guide' },
      { href: '/blog/boggle-strategy-guide/', label: 'Boggle Strategy Article' },
    ],
  },
  logic: {
    title: 'Logic and Number Puzzle Growth Plan',
    searchIntent: 'Players want Sudoku, 2048, and logic puzzles that load instantly, explain difficulty, and support repeat practice.',
    playabilityFocus: 'Prioritize difficulty filters, notes, hints, daily puzzles, quick restart, and strategy loops for number puzzles.',
    contentFocus: 'Deepen Sudoku, 2048, Killer Sudoku, Kakuro, and Japanese logic puzzle guides with rules and solving patterns.',
    priorityGames: ['sudoku', '2048', 'killer-sudoku', 'kakuro'],
    contentGaps: ['Sudoku difficulty guide', '2048 variants comparison', 'Japanese logic puzzle chooser'],
    nextAdditions: ['Daily Sudoku Archive', 'Killer Sudoku Trainer', '2048 Challenge Board'],
    links: [
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
      { href: '/hubs/japanese-logic/', label: 'Japanese Logic Hub' },
      { href: '/guides/2048/', label: '2048 Guide' },
    ],
  },
  strategy: {
    title: 'Strategy Games Growth Plan',
    searchIntent: 'Players want quick board games against the computer, clear rules, and tactical alternatives like Chess, Checkers, Connect Four, and Gomoku.',
    playabilityFocus: 'Prioritize AI difficulty, legal move clarity, rematch flow, and simple tactical explanations.',
    contentFocus: 'Add beginner-friendly strategy content, openings, capture rules, and related-game comparisons.',
    priorityGames: ['chess', 'checkers', 'connect-four', 'gomoku'],
    contentGaps: ['Checkers beginner tactics', 'Chess vs Checkers comparison', 'Connect Four strategy'],
    nextAdditions: ['Checkers Puzzle Trainer', 'Gomoku AI Levels', 'Chess Endgame Basics'],
    links: [
      { href: '/hubs/strategy-games/', label: 'Strategy Games Hub' },
      { href: '/games/checkers/', label: 'Play Checkers' },
      { href: '/guides/chess/', label: 'Chess Guide' },
    ],
  },
  skill: {
    title: 'Skill Games Growth Plan',
    searchIntent: 'Players want measurable browser tests such as reaction time, typing speed, aim, and cognitive control.',
    playabilityFocus: 'Prioritize instant results, score interpretation, history, averages, and replay prompts.',
    contentFocus: 'Explain score ranges, training routines, and related tests for reflexes, typing, focus, and accuracy.',
    priorityGames: ['reaction-time', 'typing-test', 'aim-trainer', 'stroop-test'],
    contentGaps: ['Reaction time score ranges', 'Typing WPM benchmarks', 'Best browser skill tests'],
    nextAdditions: ['CPS Test', 'Spacebar Counter', 'Keyboard Accuracy Drill'],
    links: [
      { href: '/hubs/brain-training/', label: 'Brain Training Hub' },
      { href: '/games/reaction-time/', label: 'Reaction Time Test' },
      { href: '/games/typing-test/', label: 'Typing Test' },
    ],
  },
  memory: {
    title: 'Memory Games Growth Plan',
    searchIntent: 'Players want memory tests and repeatable challenges that measure recall, pattern recognition, and sequence memory.',
    playabilityFocus: 'Prioritize streaks, level progression, best scores, and short repeatable sessions.',
    contentFocus: 'Explain memory types, score improvement, and links between number memory, pattern memory, and Simon-style games.',
    priorityGames: ['number-memory', 'pattern-memory', 'memory-grid', 'simon-says'],
    contentGaps: ['Visual memory test guide', 'Number memory benchmark', 'Memory games for daily training'],
    nextAdditions: ['Verbal Memory', 'Visual Memory', 'Sequence Recall'],
    links: [
      { href: '/hubs/memory-games/', label: 'Memory Games Hub' },
      { href: '/hubs/brain-training/', label: 'Brain Training Hub' },
      { href: '/games/number-memory/', label: 'Number Memory' },
    ],
  },
  arcade: {
    title: 'Arcade Games Growth Plan',
    searchIntent: 'Players want instant retro games like Tetris, Snake, Pac-Man, and Space Invaders with no download.',
    playabilityFocus: 'Prioritize fast restarts, high scores, mobile controls, and simple difficulty ramps.',
    contentFocus: 'Create classic arcade guides and comparison pages for evergreen searches.',
    priorityGames: ['tetris', 'snake', 'pac-man', 'space-invaders'],
    contentGaps: ['Best classic arcade games online', 'Tetris strategy basics', 'Snake high score tips'],
    nextAdditions: ['Asteroids challenge modes', 'Pac-Man maze tips', 'Snake daily score chase'],
    links: [
      { href: '/popular/', label: 'Popular Games' },
      { href: '/games/tetris/', label: 'Play Tetris' },
      { href: '/games/snake/', label: 'Play Snake' },
    ],
  },
  puzzle: {
    title: 'Puzzle Games Growth Plan',
    searchIntent: 'Players want relaxing puzzles, tile matching, path planning, and no-pressure games they can play in short sessions.',
    playabilityFocus: 'Prioritize clear level goals, undo/restart, progress tracking, and relaxed play.',
    contentFocus: 'Build guides around Mahjong Solitaire, Flow Free, Jigsaw, Sokoban, and matching puzzles.',
    priorityGames: ['mahjong-solitaire', 'flow-free', 'jigsaw', 'sokoban'],
    contentGaps: ['Relaxing puzzle games list', 'Mahjong Solitaire rules', 'Flow Free strategy tips'],
    nextAdditions: ['Daily Mahjong layout', 'Flow Free level packs', 'Jigsaw collections'],
    links: [
      { href: '/games/mahjong-solitaire/', label: 'Mahjong Solitaire' },
      { href: '/games/flow-free/', label: 'Flow Free' },
      { href: '/new/', label: 'New Puzzle Updates' },
    ],
  },
}
