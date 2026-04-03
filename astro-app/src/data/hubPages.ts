// Topic Hub Pages - Content aggregation for internal linking
// Each hub targets a broad keyword category and links to related games/guides

export interface HubPage {
  slug: string
  title: string
  description: string
  heroDescription: string
  keywords: string[]
  categoryIds: string[] // Game categories to include
  featuredGames: string[] // Specific game slugs to feature
  featuredGuides: string[] // Guide slugs to feature
  content: {
    whatIsSection: string
    benefitsSection: string
    gettingStarted: string
  }
  faq: {
    question: string
    answer: string
  }[]
}

export const hubPages: Record<string, HubPage> = {
  'word-games': {
    slug: 'word-games',
    title: 'Word Games Online Free - Play 20+ Vocabulary & Spelling Games',
    description: 'Play the best free word games online: Wordle, Crossword, Spelling Bee, Anagrams, and more. Improve vocabulary, spelling, and verbal skills with daily puzzles.',
    heroDescription: 'Challenge your vocabulary and verbal skills with our collection of 20+ free word games. From daily Wordle puzzles to classic crosswords, find your perfect word challenge.',
    keywords: ['word games online', 'free word games', 'vocabulary games', 'spelling games', 'word puzzles', 'wordle alternatives', 'online crossword'],
    categoryIds: ['word'],
    featuredGames: ['wordle', 'crossword', 'anagrams', 'word-scramble', 'hangman', 'spelling-bee', 'connections', 'word-search'],
    featuredGuides: ['wordle'],
    content: {
      whatIsSection: `Word games are puzzles that test your vocabulary, spelling, and verbal reasoning skills. They range from simple spelling challenges to complex word association puzzles that require lateral thinking.

Classic word games like Crossword and Hangman have been popular for over a century, while modern games like Wordle have created entirely new genres of daily puzzle challenges.`,
      benefitsSection: `Playing word games regularly offers significant cognitive benefits:

**Vocabulary Expansion**: Encounter new words and reinforce spelling patterns
**Mental Sharpness**: Keep your brain active and engaged
**Stress Relief**: Word puzzles provide a meditative, focused activity
**Social Connection**: Share daily puzzle results with friends and family
**Language Learning**: Excellent for ESL learners to practice English`,
      gettingStarted: `New to word games? We recommend this progression:

1. **Start with Wordle** - 5 minutes daily, perfect difficulty curve
2. **Try Word Scramble** - Practice unscrambling common words
3. **Progress to Crossword** - Build general knowledge and vocabulary
4. **Challenge yourself with Anagrams** - Advanced word manipulation
5. **Explore Connections** - Test categorical thinking`
    },
    faq: [
      {
        question: 'What is the best free word game online?',
        answer: 'Wordle is currently the most popular free word game, offering a perfect balance of challenge and accessibility. For vocabulary building, Spelling Bee and Crossword are excellent choices.'
      },
      {
        question: 'Are word games good for your brain?',
        answer: 'Yes! Research shows that word games improve vocabulary, spelling, and verbal fluency. They also help maintain cognitive function and may delay age-related decline.'
      },
      {
        question: 'How can I improve at word games?',
        answer: 'Practice regularly, learn common word patterns, expand your vocabulary through reading, and study letter frequency in English. Starting words like CRANE or SLATE are optimal for Wordle.'
      }
    ]
  },

  'number-puzzles': {
    slug: 'number-puzzles',
    title: 'Number Puzzles Online Free - Sudoku, 2048, Math Games',
    description: 'Play free number puzzles: Sudoku, 2048, Killer Sudoku, Kakuro, and more. Train your logical thinking and mathematical skills with daily challenges.',
    heroDescription: 'Exercise your logical mind with our collection of number puzzles. From classic Sudoku to addictive 2048, these games train mathematical thinking and pattern recognition.',
    keywords: ['number puzzles', 'sudoku online', '2048 game', 'math puzzles', 'logic puzzles', 'number games', 'sudoku free'],
    categoryIds: ['logic'],
    featuredGames: ['sudoku', '2048', 'killer-sudoku', 'sudoku-x', 'kakuro', 'calcudoku', 'minesweeper', 'number-memory'],
    featuredGuides: ['sudoku', '2048', 'killer-sudoku', 'kakuro'],
    content: {
      whatIsSection: `Number puzzles use mathematics, logic, and pattern recognition to create engaging challenges. Unlike word games, they transcend language barriers and appeal to logical thinkers worldwide.

The most famous number puzzle, Sudoku, became a global phenomenon in the 2000s and remains one of the most-played puzzle games ever.`,
      benefitsSection: `Number puzzles offer unique cognitive benefits:

**Logical Reasoning**: Develop systematic problem-solving skills
**Pattern Recognition**: Train your brain to spot numerical patterns
**Concentration**: Maintain focus through extended problem-solving
**Mental Math**: Improve arithmetic speed and accuracy
**Memory**: Working memory training through multi-step reasoning`,
      gettingStarted: `Recommended progression for number puzzle beginners:

1. **Start with 2048** - Simple rules, teaches tile strategy
2. **Learn basic Sudoku** - Master scanning and elimination
3. **Try Minesweeper** - Probability and risk assessment
4. **Progress to Killer Sudoku** - Combines Sudoku with arithmetic
5. **Challenge yourself with Kakuro** - Crossword meets math`
    },
    faq: [
      {
        question: 'Which number puzzle is best for beginners?',
        answer: '2048 is the most beginner-friendly with simple swipe controls. For Sudoku, start with "easy" difficulty puzzles and learn basic scanning techniques before advancing.'
      },
      {
        question: 'Do I need to be good at math for number puzzles?',
        answer: 'Most number puzzles require logic rather than math skills. Sudoku uses no arithmetic at all. Kakuro and Killer Sudoku involve basic addition, but the focus remains on logical deduction.'
      },
      {
        question: 'What is the hardest number puzzle?',
        answer: 'Expert-level Sudoku variants (Killer Sudoku, Sudoku X) and Kakuro with large grids are among the most challenging. Difficulty depends on the specific puzzle, not just the game type.'
      }
    ]
  },

  'japanese-logic': {
    slug: 'japanese-logic',
    title: 'Japanese Logic Puzzles - Nonogram, Slitherlink, Nurikabe',
    description: 'Discover authentic Japanese logic puzzles: Nonogram (Picross), Slitherlink, Nurikabe, Hitori, Masyu, and more. Pure logic, no guessing required.',
    heroDescription: 'Experience the elegant world of Japanese logic puzzles. Created by puzzle masters at Nikoli and other Japanese publishers, these games feature simple rules but deep complexity.',
    keywords: ['japanese logic puzzles', 'nonogram online', 'picross puzzle', 'slitherlink', 'nurikabe', 'hitori', 'japanese puzzles', 'logic grid puzzles'],
    categoryIds: ['logic'],
    featuredGames: ['nonogram', 'slitherlink', 'nurikabe', 'hitori', 'masyu', 'kakuro', 'sudoku', 'fillomino'],
    featuredGuides: ['nonogram', 'slitherlink', 'kakuro'],
    content: {
      whatIsSection: `Japanese logic puzzles emerged from Japan's rich puzzle culture, pioneered by publishers like Nikoli. These puzzles share a common philosophy: simple rules that create elegant, challenging problems.

What makes Japanese puzzles special is that they never require guessing. Every well-constructed puzzle can be solved through pure logical deduction.`,
      benefitsSection: `Japanese puzzles offer unique advantages:

**Pure Logic**: No cultural or language knowledge required
**No Guessing**: Every puzzle has a logical solution path
**Aesthetic Beauty**: Many puzzles (like Nonograms) reveal pictures
**Progressive Difficulty**: Start simple, master complexity
**Meditative Focus**: Enter a flow state while solving`,
      gettingStarted: `Best entry points into Japanese logic puzzles:

1. **Start with Sudoku** - The most accessible Japanese puzzle
2. **Try Nonogram (Picross)** - Visual feedback makes learning fun
3. **Progress to Slitherlink** - Learn loop-based logic
4. **Explore Kakuro** - Combines Sudoku with arithmetic
5. **Challenge yourself with Nurikabe** - Wall-building logic`
    },
    faq: [
      {
        question: 'What is the most popular Japanese logic puzzle?',
        answer: 'Sudoku is by far the most popular, becoming a global phenomenon. Nonogram (Picross) is second, popular in video game form. Kakuro and Slitherlink have dedicated followings.'
      },
      {
        question: 'Are Japanese puzzles harder than Western puzzles?',
        answer: 'Not necessarily. Japanese puzzles emphasize elegant logical paths, while Western puzzles may include trivia or cultural knowledge. Difficulty varies by individual puzzle, not origin.'
      },
      {
        question: 'Where did Japanese puzzles originate?',
        answer: 'Most originated in Japanese puzzle magazines, particularly Nikoli. Sudoku was actually based on an American puzzle but was refined and popularized in Japan.'
      }
    ]
  },

  'brain-training': {
    slug: 'brain-training',
    title: 'Brain Training Games - Memory, Focus, Reaction Time Tests',
    description: 'Train your brain with free cognitive tests and games: Memory tests, Reaction time, Chimp test, Stroop test, and more. Track your mental performance.',
    heroDescription: 'Measure and improve your cognitive abilities with our brain training games. Test your memory, reaction time, and attention while tracking your progress over time.',
    keywords: ['brain training games', 'cognitive training', 'memory test', 'reaction time test', 'chimp test', 'stroop test', 'brain games free'],
    categoryIds: ['memory', 'skill'],
    featuredGames: ['chimp-test', 'stroop-test', 'reaction-time', 'number-memory', 'memory-grid', 'pattern-memory', 'typing-test', 'aim-trainer'],
    featuredGuides: ['chimp-test', 'stroop-test', 'reaction-time-test', 'number-memory'],
    content: {
      whatIsSection: `Brain training games are designed to measure and improve specific cognitive abilities: memory, attention, processing speed, and executive function.

Unlike entertainment-focused games, brain trainers often include performance metrics, progress tracking, and scientifically-designed challenges.`,
      benefitsSection: `Regular brain training offers measurable benefits:

**Working Memory**: Hold and manipulate more information
**Processing Speed**: React faster to stimuli
**Attention Control**: Maintain focus longer
**Cognitive Reserve**: Build resilience against age-related decline
**Self-Awareness**: Understand your cognitive strengths and weaknesses`,
      gettingStarted: `Recommended brain training routine:

1. **Establish Baseline** - Take each test 3 times to find your average
2. **Daily Practice** - 15-20 minutes, mixing different cognitive domains
3. **Track Progress** - Record scores weekly to see improvement
4. **Target Weaknesses** - Focus more on tests where you score lower
5. **Stay Consistent** - Regular practice matters more than marathon sessions`
    },
    faq: [
      {
        question: 'Do brain training games actually work?',
        answer: 'Research shows brain training can improve specific cognitive skills. However, benefits are typically task-specific - playing memory games improves memory more than general intelligence. Variety and consistency are key.'
      },
      {
        question: 'How often should I do brain training?',
        answer: '15-30 minutes daily is optimal. Studies show consistent daily practice provides more benefit than occasional long sessions. Mix different types of challenges for comprehensive training.'
      },
      {
        question: 'What is a good reaction time?',
        answer: 'Average visual reaction time is 200-250ms. Gamers often achieve 150-200ms. Under 150ms is excellent. Your reaction time naturally varies based on age, time of day, and alertness.'
      }
    ]
  },

  'memory-games': {
    slug: 'memory-games',
    title: 'Memory Games Online Free - Card Match, Pattern Memory, Simon',
    description: 'Play free memory games: Memory Match, Simon Says, Pattern Memory, Number Memory, and more. Improve your working memory and recall ability.',
    heroDescription: 'Strengthen your memory with our collection of recall and pattern recognition games. From classic card matching to challenging number sequences, train your brain to remember more.',
    keywords: ['memory games', 'memory test online', 'card match game', 'simon says game', 'pattern memory', 'working memory training', 'memory exercises'],
    categoryIds: ['memory'],
    featuredGames: ['memory-match', 'simon-says', 'pattern-memory', 'number-memory', 'memory-grid', 'audio-memory', 'word-memory', 'sequence-memory'],
    featuredGuides: ['simon-says', 'number-memory'],
    content: {
      whatIsSection: `Memory games train your ability to encode, store, and retrieve information. They target different aspects of memory: visual, auditory, sequential, and working memory.

Working memory - your brain's "scratchpad" - is particularly important for problem-solving and learning new information.`,
      benefitsSection: `Memory training provides practical benefits:

**Better Recall**: Remember names, numbers, and details more easily
**Improved Learning**: Faster acquisition of new skills and knowledge
**Daily Function**: Reduce forgetfulness in everyday tasks
**Confidence**: Feel sharper and more mentally capable
**Long-term Health**: May help maintain memory as you age`,
      gettingStarted: `Memory game progression for beginners:

1. **Start with Memory Match** - Visual recognition, adjustable difficulty
2. **Try Simon Says** - Sequential memory with audio-visual cues
3. **Progress to Pattern Memory** - Remember visual patterns
4. **Challenge yourself with Number Memory** - Digit span training
5. **Mix different types** - Train various memory systems`
    },
    faq: [
      {
        question: 'How can I improve my memory?',
        answer: 'Regular memory game practice, adequate sleep, stress management, and physical exercise all improve memory. Start with 10-15 minutes of memory games daily and gradually increase difficulty.'
      },
      {
        question: 'What is the average number memory span?',
        answer: 'Most people can remember 7±2 digits (the "magic number 7"). With practice, many can reach 10-15 digits. Memory champions use techniques like chunking to remember 50+ digits.'
      },
      {
        question: 'Are memory games good for seniors?',
        answer: 'Yes! Memory games can help seniors maintain cognitive function and may slow age-related memory decline. They\'re also social when played with family members.'
      }
    ]
  },

  'strategy-games': {
    slug: 'strategy-games',
    title: 'Strategy Games Online Free - Chess, Checkers, Connect Four',
    description: 'Play free strategy games: Chess, Checkers, Connect Four, Tic Tac Toe, and more. Develop tactical thinking and outsmart your opponents.',
    heroDescription: 'Test your strategic thinking with classic board games and modern strategy challenges. Plan ahead, anticipate your opponent, and develop winning tactics.',
    keywords: ['strategy games online', 'free chess game', 'checkers online', 'connect four', 'tic tac toe', 'board games online', 'tactical games'],
    categoryIds: ['strategy'],
    featuredGames: ['chess', 'checkers', 'connect-four', 'tic-tac-toe', 'dots-and-boxes', 'gomoku', 'reversi', 'battleship'],
    featuredGuides: ['chess', 'connect-four', 'tic-tac-toe'],
    content: {
      whatIsSection: `Strategy games require planning, tactical thinking, and anticipating your opponent's moves. They range from simple games like Tic Tac Toe to the profound complexity of Chess.

These games have been played for centuries, with Chess alone having over 1,500 years of history and theory.`,
      benefitsSection: `Strategy games develop valuable skills:

**Critical Thinking**: Analyze situations and make better decisions
**Planning**: Think multiple steps ahead
**Pattern Recognition**: Spot tactical opportunities
**Resilience**: Learn from losses and improve
**Patience**: Wait for the right moment to strike`,
      gettingStarted: `Strategy game learning path:

1. **Master Tic Tac Toe** - Perfect play leads to draw, teaches basics
2. **Learn Connect Four** - Simple rules, deeper strategy
3. **Progress to Checkers** - Forced captures create tactical complexity
4. **Study Chess basics** - Learn piece values, basic checkmates
5. **Explore game-specific theory** - Each game has deep strategy`
    },
    faq: [
      {
        question: 'Which strategy game is best for beginners?',
        answer: 'Tic Tac Toe teaches fundamental concepts in a simple format. Connect Four offers more complexity with accessible rules. Chess has the most depth but requires more study to play well.'
      },
      {
        question: 'Can strategy games make you smarter?',
        answer: 'Strategy games improve specific cognitive skills: planning, pattern recognition, and working memory. They also teach valuable lessons about thinking ahead and learning from mistakes.'
      },
      {
        question: 'Is Go harder than Chess?',
        answer: 'Go has simpler rules but more possible board positions, making it computationally more complex. Both games offer lifetime depth - "easy to learn, hard to master."'
      }
    ]
  }
}

export function getHubPage(slug: string): HubPage | undefined {
  return hubPages[slug]
}

export function getAllHubSlugs(): string[] {
  return Object.keys(hubPages)
}
