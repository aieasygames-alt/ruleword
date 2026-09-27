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

export type StoryGrowthPlan = {
  title: string
  intentLabel: string
  searchIntent: string
  playabilityFocus: string
  contentFocus: string
  priorityStories: string[]
  contentGaps: string[]
  nextAdditions: string[]
  links: Array<{ href: string; label: string }>
}

export type GuideGrowthCluster = {
  title: string
  description: string
  primaryGuides: string[]
  supportingGuides: string[]
  searchIntents: string[]
  links: Array<{ href: string; label: string }>
}

export type BlogGrowthPath = {
  title: string
  description: string
  primaryLinks: Array<{ href: string; label: string }>
  guideLinks: Array<{ href: string; label: string }>
  gameLinks: Array<{ href: string; label: string }>
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

export const storyGrowthPlans: Record<string, StoryGrowthPlan> = {
  'romance-relationships': {
    title: 'AI Dating Simulator Growth Plan',
    intentLabel: 'Romance and relationship choices',
    searchIntent: 'Players want free AI dating simulator games with character chemistry, relationship stats, replayable routes, and multiple endings.',
    playabilityFocus: 'Prioritize visible relationship stats, route variety, date scenarios, replay prompts, and ending checklists.',
    contentFocus: 'Build comparison and guide content around free AI dating simulators, romance story games, and interactive relationship choices.',
    priorityStories: ['ai-dating-simulator'],
    contentGaps: ['Best free AI dating simulator games', 'How romance routes work in AI story games', 'Dating sim endings checklist'],
    nextAdditions: ['AI Roommate Romance', 'AI High School Reunion', 'AI Blind Date Challenge'],
    links: [
      { href: '/stories/ai-dating-simulator/', label: 'AI Dating Simulator' },
      { href: '/stories/ai-dating-simulator/valentine/', label: 'Valentine Dating Story' },
      { href: '/hubs/ai-games/', label: 'AI Games Hub' },
    ],
  },
  'mystery-detective': {
    title: 'AI Mystery Games Growth Plan',
    intentLabel: 'Clues, suspects, and persuasion',
    searchIntent: 'Players want AI murder mystery and detective games where clues, accusations, and conversation choices affect the reveal.',
    playabilityFocus: 'Prioritize clue logs, suspect status, accusation moments, red herrings, and replayable case outcomes.',
    contentFocus: 'Create pages for AI murder mystery, AI detective game, escape room story, and persuasion story searches.',
    priorityStories: ['ai-murder-mystery', 'ai-escape-room', 'ai-convince'],
    contentGaps: ['AI murder mystery games list', 'Detective story game tips', 'Escape room vs detective story comparison'],
    nextAdditions: ['AI Courtroom Drama', 'AI Cold Case Files', 'AI Interrogation Room'],
    links: [
      { href: '/stories/ai-murder-mystery/', label: 'AI Murder Mystery' },
      { href: '/stories/ai-escape-room/', label: 'AI Escape Room' },
      { href: '/blog/what-are-ai-story-games/', label: 'AI Story Games Guide' },
    ],
  },
  'survival-horror': {
    title: 'AI Survival Story Growth Plan',
    intentLabel: 'Risk, resources, and horror choices',
    searchIntent: 'Players want zombie survival and horror story games with meaningful resource tradeoffs, tense choices, and dramatic endings.',
    playabilityFocus: 'Prioritize health, supplies, trust stats, danger escalation, and clear survival vs sacrifice outcomes.',
    contentFocus: 'Build content around AI zombie survival, interactive horror story games, survival choices, and no-download horror games.',
    priorityStories: ['ai-zombie-survival'],
    contentGaps: ['AI zombie survival games', 'Best interactive horror story games', 'Survival choice game endings'],
    nextAdditions: ['AI Haunted Hotel', 'AI Outbreak Shelter', 'AI Arctic Survival'],
    links: [
      { href: '/stories/ai-zombie-survival/', label: 'AI Zombie Survival' },
      { href: '/stories/ai-zombie-survival/halloween/', label: 'Halloween Zombie Story' },
      { href: '/games/tower-defense/', label: 'Tower Defense' },
    ],
  },
  'fantasy-adventure': {
    title: 'AI Fantasy RPG Growth Plan',
    intentLabel: 'Quests, companions, and branching adventures',
    searchIntent: 'Players want AI fantasy RPG and adventure stories where choices shape quests, companions, powers, and endings.',
    playabilityFocus: 'Prioritize quest goals, companion trust, inventory-like decisions, boss moments, and alternate adventure routes.',
    contentFocus: 'Create support pages for AI fantasy RPG, AI adventure story, text adventure AI, and browser RPG story searches.',
    priorityStories: ['ai-fantasy-adventure', 'time-traveler'],
    contentGaps: ['AI fantasy RPG games list', 'Text adventure AI examples', 'Fantasy story endings guide'],
    nextAdditions: ['AI Space Explorer', 'AI Pirate Adventure', 'AI Mythology Quest'],
    links: [
      { href: '/stories/ai-fantasy-adventure/', label: 'AI Fantasy Adventure' },
      { href: '/stories/time-traveler/', label: 'Time Traveler' },
      { href: '/hubs/ai-games/', label: 'AI Games Hub' },
    ],
  },
  'strategy-simulation': {
    title: 'AI Simulation Story Growth Plan',
    intentLabel: 'Business, social, and decision simulations',
    searchIntent: 'Players want AI simulation games where strategic choices change money, reputation, influence, and final outcomes.',
    playabilityFocus: 'Prioritize visible stats, tradeoff-heavy choices, scenario variants, success/failure endings, and replay goals.',
    contentFocus: 'Build pages for startup simulator, business sim, AI personality quiz, negotiation story, and AI tycoon searches.',
    priorityStories: ['startup-simulator', 'ai-crypto-trader', 'ai-youtube-tycoon', 'ai-personality-quiz'],
    contentGaps: ['Best AI simulation games', 'Startup simulator strategy', 'AI personality quiz games'],
    nextAdditions: ['AI Courtroom Negotiation', 'AI City Mayor', 'AI Stock Market Crisis'],
    links: [
      { href: '/stories/startup-simulator/', label: 'Startup Simulator' },
      { href: '/stories/ai-crypto-trader/', label: 'AI Crypto Trader' },
      { href: '/stories/ai-personality-quiz/', label: 'AI Personality Quiz' },
    ],
  },
}

export const guideGrowthClusters: GuideGrowthCluster[] = [
  {
    title: 'Word Game Strategy',
    description: 'Rules, scoring, and pattern-finding guides for Boggle, Wordle, Spelling Bee, Crossword, and word search players.',
    primaryGuides: ['boggle', 'wordle', 'spelling-bee'],
    supportingGuides: ['word-search', 'crossword', 'hangman'],
    searchIntents: ['boggle strategy', 'wordle tips', 'spelling bee rules'],
    links: [
      { href: '/hubs/word-games/', label: 'Word Games Hub' },
      { href: '/games/boggle/', label: 'Play Boggle' },
      { href: '/blog/boggle-strategy-guide/', label: 'Boggle Strategy Article' },
    ],
  },
  {
    title: 'Number and Logic Puzzle Guides',
    description: 'Solving techniques for Sudoku, 2048, Killer Sudoku, Kakuro, Nonogram, Slitherlink, and Japanese logic puzzles.',
    primaryGuides: ['sudoku', '2048', 'killer-sudoku', 'kakuro'],
    supportingGuides: ['nonogram', 'slitherlink', 'heyawake', 'suguru'],
    searchIntents: ['sudoku strategy', 'how to beat 2048', 'kakuro rules'],
    links: [
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
      { href: '/hubs/japanese-logic/', label: 'Japanese Logic Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
    ],
  },
  {
    title: 'Brain Training and Skill Tests',
    description: 'Benchmark and improvement guides for reaction time, typing speed, memory, aim, focus, and cognitive-control tests.',
    primaryGuides: ['reaction-time', 'typing-test', 'number-memory'],
    supportingGuides: ['chimp-test', 'stroop-test', 'aim-trainer', 'memory'],
    searchIntents: ['reaction time average', 'typing WPM benchmark', 'memory test score'],
    links: [
      { href: '/hubs/brain-training/', label: 'Brain Training Hub' },
      { href: '/hubs/memory-games/', label: 'Memory Games Hub' },
      { href: '/category/skill/', label: 'Skill Games Category' },
    ],
  },
  {
    title: 'Classic Strategy Guides',
    description: 'Beginner tactics and decision guides for Chess, Checkers, Connect Four, Reversi, Gomoku, and board strategy games.',
    primaryGuides: ['chess', 'checkers', 'connect-four'],
    supportingGuides: ['reversi', 'gomoku', 'tic-tac-toe', 'dots-and-boxes'],
    searchIntents: ['checkers strategy', 'chess for beginners', 'connect four tactics'],
    links: [
      { href: '/hubs/strategy-games/', label: 'Strategy Games Hub' },
      { href: '/category/strategy/', label: 'Strategy Category' },
      { href: '/games/checkers/', label: 'Play Checkers' },
    ],
  },
  {
    title: 'Classic Arcade Guides',
    description: 'High-score tips and control basics for Tetris, Snake, Pac-Man, Pong, Space Invaders, and retro browser games.',
    primaryGuides: ['tetris', 'snake', 'pac-man'],
    supportingGuides: ['pong', 'space-invaders', 'frogger', 'whack-a-mole'],
    searchIntents: ['tetris strategy', 'snake high score tips', 'pac-man ghost patterns'],
    links: [
      { href: '/category/arcade/', label: 'Arcade Category' },
      { href: '/popular/', label: 'Popular Games' },
      { href: '/games/tetris/', label: 'Play Tetris' },
    ],
  },
  {
    title: 'Relaxing Puzzle Guides',
    description: 'Rules and solving paths for Mahjong Solitaire, Jigsaw, Sokoban, Match-3, Flow Free, and casual puzzle games.',
    primaryGuides: ['mahjong-solitaire', 'jigsaw', 'sokoban'],
    supportingGuides: ['match-three', 'flow-free', '15-puzzle', 'color-match'],
    searchIntents: ['mahjong solitaire rules', 'sokoban tips', 'flow free strategy'],
    links: [
      { href: '/category/puzzle/', label: 'Puzzle Category' },
      { href: '/games/mahjong-solitaire/', label: 'Play Mahjong Solitaire' },
      { href: '/new/', label: 'New Puzzle Updates' },
    ],
  },
]

export const blogGrowthPaths: Record<string, BlogGrowthPath> = {
  'best-brain-training-games-2026': {
    title: 'Build a Brain Training Routine',
    description: 'Move from the overview into measurable tests, memory games, and practical score guides.',
    primaryLinks: [
      { href: '/hubs/brain-training/', label: 'Brain Training Hub' },
      { href: '/hubs/memory-games/', label: 'Memory Games Hub' },
      { href: '/category/skill/', label: 'Skill Games' },
    ],
    guideLinks: [
      { href: '/guides/reaction-time/', label: 'Reaction Time Guide' },
      { href: '/guides/typing-test/', label: 'Typing Test Guide' },
      { href: '/guides/number-memory/', label: 'Number Memory Guide' },
    ],
    gameLinks: [
      { href: '/games/reaction-time/', label: 'Reaction Time Test' },
      { href: '/games/chimp-test/', label: 'Chimp Test' },
      { href: '/games/memory-grid/', label: 'Sequence Memory' },
    ],
  },
  'wordle-vs-connections-vs-spelling-bee': {
    title: 'Explore More Word Game Paths',
    description: 'Compare the daily word games, then jump into guides, Boggle, and the wider word games collection.',
    primaryLinks: [
      { href: '/hubs/word-games/', label: 'Word Games Hub' },
      { href: '/category/word/', label: 'Word Games Category' },
      { href: '/games/', label: 'All Games Directory' },
    ],
    guideLinks: [
      { href: '/guides/wordle/', label: 'Wordle Guide' },
      { href: '/guides/spelling-bee/', label: 'Spelling Bee Guide' },
      { href: '/guides/boggle/', label: 'Boggle Guide' },
    ],
    gameLinks: [
      { href: '/games/wordle/', label: 'Play Wordle' },
      { href: '/games/connections/', label: 'Play Connections' },
      { href: '/games/spelling-bee/', label: 'Play Spelling Bee' },
    ],
  },
  'japanese-logic-puzzles-guide': {
    title: 'Start a Japanese Logic Puzzle Path',
    description: 'Use the article as a chooser, then practice with playable puzzles and deeper solving guides.',
    primaryLinks: [
      { href: '/hubs/japanese-logic/', label: 'Japanese Logic Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
    ],
    guideLinks: [
      { href: '/guides/nonogram/', label: 'Nonogram Guide' },
      { href: '/guides/slitherlink/', label: 'Slitherlink Guide' },
      { href: '/guides/kakuro/', label: 'Kakuro Guide' },
    ],
    gameLinks: [
      { href: '/games/nonogram/', label: 'Play Nonogram' },
      { href: '/games/slitherlink/', label: 'Play Slitherlink' },
      { href: '/games/heyawake/', label: 'Play Heyawake' },
    ],
  },
  'how-to-win-at-sudoku-every-time': {
    title: 'Continue With Sudoku and Number Puzzles',
    description: 'Turn Sudoku technique into practice, variants, and adjacent number puzzle skills.',
    primaryLinks: [
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
      { href: '/guides/', label: 'All Strategy Guides' },
    ],
    guideLinks: [
      { href: '/guides/sudoku/', label: 'Sudoku Guide' },
      { href: '/guides/killer-sudoku/', label: 'Killer Sudoku Guide' },
      { href: '/guides/kakuro/', label: 'Kakuro Guide' },
    ],
    gameLinks: [
      { href: '/games/sudoku/', label: 'Play Sudoku' },
      { href: '/games/killer-sudoku/', label: 'Play Killer Sudoku' },
      { href: '/games/kakuro/', label: 'Play Kakuro' },
    ],
  },
  '2048-strategy-guide': {
    title: 'Practice 2048 and Number Merge Strategy',
    description: 'Apply the corner strategy, then explore adjacent number puzzle games and variants.',
    primaryLinks: [
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
      { href: '/popular/', label: 'Popular Games' },
    ],
    guideLinks: [
      { href: '/guides/2048/', label: '2048 Guide' },
      { href: '/guides/sudoku/', label: 'Sudoku Guide' },
      { href: '/guides/tetris/', label: 'Tetris Guide' },
    ],
    gameLinks: [
      { href: '/games/2048/', label: 'Play 2048' },
      { href: '/games/2048-cupcakes/', label: '2048 Cupcakes' },
      { href: '/games/threes/', label: 'Play Threes' },
    ],
  },
  'best-number-puzzles-online': {
    title: 'Browse Number Puzzle Collections',
    description: 'Move from the list into number hubs, logic categories, and high-value guide pages.',
    primaryLinks: [
      { href: '/hubs/number-puzzles/', label: 'Number Puzzles Hub' },
      { href: '/hubs/japanese-logic/', label: 'Japanese Logic Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
    ],
    guideLinks: [
      { href: '/guides/sudoku/', label: 'Sudoku Guide' },
      { href: '/guides/2048/', label: '2048 Guide' },
      { href: '/guides/kakuro/', label: 'Kakuro Guide' },
    ],
    gameLinks: [
      { href: '/games/sudoku/', label: 'Play Sudoku' },
      { href: '/games/2048/', label: 'Play 2048' },
      { href: '/games/killer-sudoku/', label: 'Play Killer Sudoku' },
    ],
  },
  'how-to-solve-heyawake': {
    title: 'Deepen Japanese Logic Solving',
    description: 'Practice Heyawake, then compare adjacent shading and loop puzzles.',
    primaryLinks: [
      { href: '/hubs/japanese-logic/', label: 'Japanese Logic Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
      { href: '/blog/japanese-logic-puzzles-guide/', label: 'Japanese Logic Overview' },
    ],
    guideLinks: [
      { href: '/guides/heyawake/', label: 'Heyawake Guide' },
      { href: '/guides/slitherlink/', label: 'Slitherlink Guide' },
      { href: '/guides/binary/', label: 'Binary Guide' },
    ],
    gameLinks: [
      { href: '/games/heyawake/', label: 'Play Heyawake' },
      { href: '/games/aqre/', label: 'Play Aqre' },
      { href: '/games/tapa/', label: 'Play Tapa' },
    ],
  },
  'slitherlink-tips-techniques': {
    title: 'Practice Loop Puzzle Logic',
    description: 'Use Slitherlink techniques across loop, shading, and Japanese logic puzzles.',
    primaryLinks: [
      { href: '/hubs/japanese-logic/', label: 'Japanese Logic Hub' },
      { href: '/category/logic/', label: 'Logic Games Category' },
      { href: '/guides/', label: 'All Strategy Guides' },
    ],
    guideLinks: [
      { href: '/guides/slitherlink/', label: 'Slitherlink Guide' },
      { href: '/guides/heyawake/', label: 'Heyawake Guide' },
      { href: '/guides/nonogram/', label: 'Nonogram Guide' },
    ],
    gameLinks: [
      { href: '/games/slitherlink/', label: 'Play Slitherlink' },
      { href: '/games/masyu/', label: 'Play Masyu' },
      { href: '/games/yajilin/', label: 'Play Yajilin' },
    ],
  },
  'boggle-strategy-guide': {
    title: 'Continue With Word Hunt Games',
    description: 'Apply Boggle patterns, then move into word guides, daily word games, and vocabulary practice.',
    primaryLinks: [
      { href: '/hubs/word-games/', label: 'Word Games Hub' },
      { href: '/category/word/', label: 'Word Games Category' },
      { href: '/guides/boggle/', label: 'Boggle Guide' },
    ],
    guideLinks: [
      { href: '/guides/boggle/', label: 'Boggle Guide' },
      { href: '/guides/word-search/', label: 'Word Search Guide' },
      { href: '/guides/wordle/', label: 'Wordle Guide' },
    ],
    gameLinks: [
      { href: '/games/boggle/', label: 'Play Boggle' },
      { href: '/games/word-search/', label: 'Play Word Search' },
      { href: '/games/crosswordle/', label: 'Play Crosswordle' },
    ],
  },
  'what-are-ai-story-games': {
    title: 'Start Playing AI Story Games',
    description: 'Move from the explainer into AI story genres, variants, and replayable story experiences.',
    primaryLinks: [
      { href: '/stories/', label: 'All AI Stories' },
      { href: '/hubs/ai-games/', label: 'AI Games Hub' },
      { href: '/stories/genre/mystery-detective/', label: 'Mystery Stories' },
    ],
    guideLinks: [
      { href: '/stories/genre/romance-relationships/', label: 'Dating Simulator Stories' },
      { href: '/stories/genre/survival-horror/', label: 'Survival Stories' },
      { href: '/stories/genre/fantasy-adventure/', label: 'Fantasy Stories' },
    ],
    gameLinks: [
      { href: '/stories/ai-dating-simulator/', label: 'AI Dating Simulator' },
      { href: '/stories/ai-murder-mystery/', label: 'AI Murder Mystery' },
      { href: '/stories/ai-zombie-survival/', label: 'AI Zombie Survival' },
    ],
  },
}
