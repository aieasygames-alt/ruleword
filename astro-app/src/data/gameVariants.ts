// Game Variants for Programmatic SEO
// Each variant targets specific long-tail keywords

export type VariantType = 'difficulty' | 'mode' | 'size'

export interface GameVariant {
  gameId: string
  variant: string
  variantType: VariantType
  title: string
  description: string
  keywords: string[]
  h1: string
  tips?: string[]
}

// Difficulty variants for puzzle games
export const difficultyVariants: GameVariant[] = [
  // Sudoku variants
  {
    gameId: 'sudoku',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Sudoku Online Free - Play Beginner Puzzles',
    description: 'Play easy Sudoku puzzles online for free. Perfect for beginners to learn the basics. Simple 9x9 grids with more given numbers to help you get started.',
    keywords: ['easy sudoku', 'sudoku for beginners', 'simple sudoku', 'sudoku easy online', 'beginner sudoku free'],
    h1: 'Easy Sudoku - Play Free Beginner Puzzles',
    tips: [
      'Start by scanning rows and columns for missing numbers',
      'Look for 3x3 boxes that only need one or two numbers',
      'Use pencil marks to track possible candidates'
    ]
  },
  {
    gameId: 'sudoku',
    variant: 'medium',
    variantType: 'difficulty',
    title: 'Medium Sudoku Online Free - Intermediate Puzzles',
    description: 'Challenge yourself with medium difficulty Sudoku puzzles. Perfect for players who have mastered easy puzzles and want more of a challenge.',
    keywords: ['medium sudoku', 'intermediate sudoku', 'sudoku medium difficulty', 'standard sudoku'],
    h1: 'Medium Sudoku - Free Intermediate Puzzles',
    tips: [
      'Look for naked pairs and hidden singles',
      'Use scanning techniques across multiple rows/columns',
      'Practice pencil marks to track candidates efficiently'
    ]
  },
  {
    gameId: 'sudoku',
    variant: 'hard',
    variantType: 'difficulty',
    title: 'Hard Sudoku Online Free - Expert Level Puzzles',
    description: 'Test your skills with hard Sudoku puzzles. These expert-level grids require advanced techniques like X-Wing and Swordfish patterns.',
    keywords: ['hard sudoku', 'expert sudoku', 'difficult sudoku', 'sudoku hard online', 'challenging sudoku'],
    h1: 'Hard Sudoku - Free Expert Puzzles',
    tips: [
      'Master X-Wing and Swordfish patterns',
      'Look for naked triples and hidden quads',
      'Never guess - there\'s always a logical path'
    ]
  },

  // Nonogram variants
  {
    gameId: 'nonogram',
    variant: '5x5',
    variantType: 'size',
    title: '5x5 Nonogram (Picross) - Small Picture Puzzles',
    description: 'Play 5x5 Nonogram puzzles online. Small grid size perfect for beginners and quick breaks. Reveal hidden pictures by following the clues.',
    keywords: ['5x5 nonogram', 'small picross', 'mini nonogram', 'tiny picross', 'beginner nonogram'],
    h1: '5x5 Nonogram - Small Picture Puzzles',
    tips: [
      'Start with rows/columns that have the largest numbers',
      'Look for complete lines (5 means all cells filled)',
      'Mark cells you know are empty with X'
    ]
  },
  {
    gameId: 'nonogram',
    variant: '10x10',
    variantType: 'size',
    title: '10x10 Nonogram (Picross) Online Free - Medium Puzzles',
    description: 'Play 10x10 Nonogram puzzles online. Medium-sized grids offer a balanced challenge. Reveal beautiful pixel art pictures.',
    keywords: ['10x10 nonogram', 'medium picross', 'nonogram 10x10', 'picross puzzle online'],
    h1: '10x10 Nonogram - Medium Picture Puzzles',
    tips: [
      'Work from the edges inward',
      'Cross-reference row and column clues',
      'Use the process of elimination'
    ]
  },
  {
    gameId: 'nonogram',
    variant: '15x15',
    variantType: 'size',
    title: '15x15 Nonogram (Picross) - Large Picture Puzzles',
    description: 'Challenge yourself with 15x15 Nonogram puzzles. Large grids reveal detailed pixel art. Perfect for experienced players.',
    keywords: ['15x15 nonogram', 'large picross', 'big nonogram', 'advanced picross'],
    h1: '15x15 Nonogram - Large Picture Puzzles',
    tips: [
      'Take notes on possible patterns',
      'Work systematically row by row',
      'Look for overlapping clues between rows and columns'
    ]
  },

  // Minesweeper variants
  {
    gameId: 'minesweeper',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Minesweeper Online - 9x9 Beginner Mode',
    description: 'Play easy Minesweeper online. 9x9 grid with 10 mines. Perfect for learning the classic puzzle game mechanics.',
    keywords: ['easy minesweeper', 'minesweeper beginner', '9x9 minesweeper', 'simple minesweeper'],
    h1: 'Easy Minesweeper - 9x9 Beginner Mode',
    tips: [
      'Start by clicking in the center of the grid',
      'Numbers show how many mines are adjacent',
      'Right-click to flag suspected mines'
    ]
  },
  {
    gameId: 'minesweeper',
    variant: 'medium',
    variantType: 'difficulty',
    title: 'Medium Minesweeper Online - 16x16 Intermediate Mode',
    description: 'Play medium Minesweeper online. 16x16 grid with 40 mines. A balanced challenge for intermediate players.',
    keywords: ['medium minesweeper', '16x16 minesweeper', 'intermediate minesweeper', 'minesweeper classic'],
    h1: 'Medium Minesweeper - 16x16 Mode',
    tips: [
      'Look for patterns like 1-2-1 that indicate mine positions',
      'Use probability when unsure',
      'Clear obvious safe cells first'
    ]
  },
  {
    gameId: 'minesweeper',
    variant: 'hard',
    variantType: 'difficulty',
    title: 'Hard Minesweeper Online - 30x16 Expert Mode',
    description: 'Play expert Minesweeper online. 30x16 grid with 99 mines. The ultimate challenge for Minesweeper masters.',
    keywords: ['hard minesweeper', 'expert minesweeper', '30x16 minesweeper', 'difficult minesweeper'],
    h1: 'Hard Minesweeper - 30x16 Expert Mode',
    tips: [
      'Master advanced patterns like 1-2-2-1',
      'Count remaining mines to deduce positions',
      'Stay calm under pressure'
    ]
  },

  // 2048 variants
  {
    gameId: '2048',
    variant: '5x5',
    variantType: 'size',
    title: '2048 5x5 - Larger Grid Version Online Free',
    description: 'Play 2048 on a 5x5 grid. More space means bigger numbers! Reach 2048, 4096, or even 8192 tiles.',
    keywords: ['2048 5x5', '2048 large grid', '2048 bigger board', '2048 extended'],
    h1: '2048 5x5 - Larger Grid Version',
    tips: [
      'The extra space allows for recovery from mistakes',
      'You can reach much higher tiles on 5x5',
      'Same corner strategy applies'
    ]
  },
  {
    gameId: '2048',
    variant: 'timed',
    variantType: 'mode',
    title: '2048 Timed Mode - Beat the Clock Online',
    description: 'Play 2048 against the clock. Race to reach 2048 before time runs out. Fast-paced puzzle action.',
    keywords: ['2048 timed', '2048 against clock', '2048 speed run', 'timed 2048'],
    h1: '2048 Timed Mode - Beat the Clock',
    tips: [
      'Plan moves quickly but don\'t rush',
      'Focus on efficiency over high scores',
      'Practice makes perfect'
    ]
  },

  // Wordle variants
  {
    gameId: 'wordle',
    variant: 'unlimited',
    variantType: 'mode',
    title: 'Wordle Unlimited - Play Endless Word Puzzles',
    description: 'Play Wordle unlimited times. No daily limit - practice as much as you want. Same great word guessing game.',
    keywords: ['wordle unlimited', 'unlimited wordle', 'wordle practice', 'play wordle free', 'wordle no limit'],
    h1: 'Wordle Unlimited - Endless Puzzles',
    tips: [
      'Practice with different starting words',
      'Try hard mode for an extra challenge',
      'Track your statistics over time'
    ]
  },
  {
    gameId: 'wordle',
    variant: 'daily',
    variantType: 'mode',
    title: 'Daily Wordle - Today\'s Word Puzzle Challenge',
    description: 'Play today\'s daily Wordle puzzle. One new word every day. Share your results with friends.',
    keywords: ['daily wordle', 'wordle today', 'wordle of the day', 'today\'s wordle'],
    h1: 'Daily Wordle - Today\'s Puzzle',
    tips: [
      'Start with CRANE or SLATE for best results',
      'Share your result grid after solving',
      'Come back tomorrow for a new puzzle'
    ]
  },

  // Memory games variants
  {
    gameId: 'memory-match',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Memory Match - 4x4 Card Game for Beginners',
    description: 'Play easy Memory Match with 4x4 grid. 8 pairs to match. Perfect for kids and beginners.',
    keywords: ['easy memory game', 'memory match 4x4', 'simple memory game', 'kids memory game'],
    h1: 'Easy Memory Match - 4x4 Cards',
    tips: [
      'Start from the corners',
      'Say the card positions out loud',
      'Take your time - there\'s no rush'
    ]
  },
  {
    gameId: 'memory-match',
    variant: 'hard',
    variantType: 'difficulty',
    title: 'Hard Memory Match - 6x6 Expert Card Game',
    description: 'Challenge yourself with hard Memory Match. 6x6 grid with 18 pairs. Test your memory limits.',
    keywords: ['hard memory game', 'memory match 6x6', 'difficult memory game', 'expert memory match'],
    h1: 'Hard Memory Match - 6x6 Cards',
    tips: [
      'Use memory palace technique',
      'Group cards by theme or color',
      'Practice regularly to improve'
    ]
  },

  // Typing test variants
  {
    gameId: 'typing-test',
    variant: '1-minute',
    variantType: 'mode',
    title: '1 Minute Typing Test - Speed Test Online Free',
    description: 'Test your typing speed in just 1 minute. Quick and accurate results. Measure your WPM and accuracy.',
    keywords: ['1 minute typing test', 'typing speed test', 'quick typing test', 'WPM test'],
    h1: '1 Minute Typing Test',
    tips: [
      'Focus on accuracy first, speed will follow',
      'Keep your eyes on the screen, not the keyboard',
      'Use all fingers for touch typing'
    ]
  },
  {
    gameId: 'typing-test',
    variant: '3-minute',
    variantType: 'mode',
    title: '3 Minute Typing Test - Extended Speed Test',
    description: 'Extended 3-minute typing test. More accurate measure of your sustained typing speed and endurance.',
    keywords: ['3 minute typing test', 'extended typing test', 'typing endurance', 'long typing test'],
    h1: '3 Minute Typing Test',
    tips: [
      'Pace yourself for the longer duration',
      'Maintain consistent speed throughout',
      'Short breaks between sentences help'
    ]
  },

  // Reaction time variants
  {
    gameId: 'reaction-time',
    variant: 'visual',
    variantType: 'mode',
    title: 'Visual Reaction Time Test - Test Your Reflexes',
    description: 'Test your visual reaction time. Click when you see the color change. Measure your reflexes in milliseconds.',
    keywords: ['visual reaction test', 'reaction time test', 'reflex test', 'click speed test'],
    h1: 'Visual Reaction Time Test',
    tips: [
      'Focus on the screen without distractions',
      'Don\'t anticipate - wait for the signal',
      'Average of 5 tries gives best result'
    ]
  },

  // Chess variants
  {
    gameId: 'chess',
    variant: 'beginner',
    variantType: 'difficulty',
    title: 'Beginner Chess - Play Against Easy AI',
    description: 'Play chess against beginner-level AI. Perfect for learning the basics. Helpful hints available.',
    keywords: ['beginner chess', 'chess for beginners', 'easy chess', 'learn chess online'],
    h1: 'Beginner Chess - Easy AI Opponent',
    tips: [
      'Control the center of the board',
      'Develop your pieces early',
      'Castle to protect your king'
    ]
  },
  {
    gameId: 'chess',
    variant: 'daily',
    variantType: 'mode',
    title: 'Daily Chess Puzzle - Today\'s Tactical Challenge',
    description: 'Solve today\'s daily chess puzzle. New tactical challenge every day. Improve your chess skills.',
    keywords: ['daily chess puzzle', 'chess puzzle today', 'chess tactic', 'daily chess problem'],
    h1: 'Daily Chess Puzzle',
    tips: [
      'Look for forcing moves first',
      'Consider all checks and captures',
      'Think about your opponent\'s best response'
    ]
  },

  // Kakuro variants
  {
    gameId: 'kakuro',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Kakuro - Beginner Number Crossword',
    description: 'Play easy Kakuro puzzles. Simple grids for beginners to learn this Japanese number puzzle.',
    keywords: ['easy kakuro', 'kakuro for beginners', 'simple kakuro', 'kakuro easy online'],
    h1: 'Easy Kakuro - Beginner Puzzles',
    tips: [
      'Start with small sum combinations',
      'Learn common sum patterns',
      'Use pencil marks for candidates'
    ]
  },

  // Killer Sudoku variants
  {
    gameId: 'killer-sudoku',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Killer Sudoku - Beginner Sum Puzzles',
    description: 'Play easy Killer Sudoku online. Cages with sums instead of given numbers. Perfect introduction to this variant.',
    keywords: ['easy killer sudoku', 'killer sudoku beginner', 'sum sudoku easy', 'killer sudoku for beginners'],
    h1: 'Easy Killer Sudoku',
    tips: [
      'Start with small cages (sum of 2-3 cells)',
      'Learn common cage combinations',
      'Combine Sudoku logic with arithmetic'
    ]
  },

  // Slitherlink variants
  {
    gameId: 'slitherlink',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Slitherlink - Beginner Loop Puzzles',
    description: 'Play easy Slitherlink puzzles online. Draw a single loop following the number clues. Perfect for beginners.',
    keywords: ['easy slitherlink', 'slitherlink beginner', 'loop puzzle easy', 'slitherlink online'],
    h1: 'Easy Slitherlink - Beginner Puzzles',
    tips: [
      'Start with 0 and 3 clues',
      '0 means no edges around that cell',
      '3 means three edges around that cell'
    ]
  },

  // Hitori variants
  {
    gameId: 'hitori',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Hitori - Beginner Shading Puzzle',
    description: 'Play easy Hitori puzzles. Shade cells so no number repeats in any row or column.',
    keywords: ['easy hitori', 'hitori beginner', 'hitori puzzle online', 'simple hitori'],
    h1: 'Easy Hitori - Beginner Puzzles',
    tips: [
      'Look for numbers that appear 3+ times',
      'Shaded cells cannot touch',
      'Unshaded cells must connect'
    ]
  },

  // Number Memory variants
  {
    gameId: 'number-memory',
    variant: 'easy',
    variantType: 'difficulty',
    title: 'Easy Number Memory - 4 Digit Memory Test',
    description: 'Test your digit memory with 4-digit sequences. Perfect starting point for memory training.',
    keywords: ['number memory test', 'digit span test', 'memory test easy', 'number recall'],
    h1: 'Easy Number Memory - 4 Digits',
    tips: [
      'Chunk digits into pairs',
      'Create a story with the numbers',
      'Practice daily to improve'
    ]
  }
]

// Get variants for a specific game
export function getVariantsForGame(gameId: string): GameVariant[] {
  return difficultyVariants.filter(v => v.gameId === gameId)
}

// Get all unique game IDs that have variants
export function getGamesWithVariants(): string[] {
  return [...new Set(difficultyVariants.map(v => v.gameId))]
}

// Get variant by game and variant name
export function getVariant(gameId: string, variant: string): GameVariant | undefined {
  return difficultyVariants.find(v => v.gameId === gameId && v.variant === variant)
}

// Get all variants (for static path generation)
export function getAllVariants(): GameVariant[] {
  return difficultyVariants
}
