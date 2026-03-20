// Static game guide content for SEO - rendered directly in HTML
import type { Language } from './i18n'

type GameGuideContent = {
  name: string
  intro: string
  howToPlay: string
  tips: string[]
}

type GameGuides = Record<string, GameGuideContent>

// Game guides in English (used as base for SEO)
const gameGuidesEn: GameGuides = {
  sudoku: {
    name: 'Sudoku',
    intro: 'Sudoku is the classic 9x9 number logic puzzle that has captivated millions worldwide. Fill in the grid so that every row, column, and 3x3 box contains the digits 1-9. No math required - just pure logical deduction!',
    howToPlay: 'Click on an empty cell and enter a number from 1-9. Each row, column, and 3x3 box must contain all digits 1-9 exactly once. Use the notes feature to pencil in possible candidates. Wrong entries are highlighted in red.',
    tips: [
      'Start with rows, columns, or boxes that have the most filled cells',
      'Use the process of elimination - if a number can only go in one cell, place it',
      'Look for "naked pairs" - two cells that can only contain the same two numbers',
      'Use notes to track all possible candidates for each cell',
    ],
  },
  game2048: {
    name: '2048',
    intro: '2048 is the addictive sliding tile puzzle game. Slide numbered tiles in any direction to merge matching numbers. When two tiles with the same number collide, they merge into one with double the value. Reach 2048 to win!',
    howToPlay: 'Use arrow keys (or swipe on mobile) to slide all tiles in that direction. Tiles with the same value merge when they collide. A new tile (2 or 4) appears after each move. The game ends when no more moves are possible.',
    tips: [
      'Keep your highest tile in a corner and build around it',
      'Never move your highest tile away from its corner',
      'Try to keep tiles in descending order along one edge',
      'Plan ahead - each move affects the entire board',
    ],
  },
  mastermind: {
    name: 'Mastermind',
    intro: 'Mastermind is the classic code-breaking puzzle game. Guess the secret 4-color code within 8 attempts using logical deduction and the feedback clues provided after each guess.',
    howToPlay: 'Select 4 colors to make your guess. After submitting, you\'ll see feedback: green dots mean correct color in correct position, white dots mean correct color in wrong position. Use this feedback to deduce the secret code.',
    tips: [
      'Start with 4 different colors to maximize information',
      'Pay attention to which colors are completely absent',
      'Remember that colors can repeat in the code',
      'Systematically test color positions based on feedback',
    ],
  },
  minesweeper: {
    name: 'Minesweeper',
    intro: 'Minesweeper is the classic single-player puzzle game. Uncover all cells without mines using the numbers that indicate how many mines are adjacent to each cell.',
    howToPlay: 'Click to reveal a cell. Numbers show how many mines are in the 8 adjacent cells. Right-click to flag cells you think contain mines. Clear all non-mine cells to win.',
    tips: [
      'The first click is always safe',
      'If a number equals its adjacent unrevealed cells, all are mines',
      'If a number equals its adjacent flags, all other adjacent cells are safe',
      'Start from corners and edges for easier deductions',
    ],
  },
  tetris: {
    name: 'Tetris',
    intro: 'Tetris is the iconic falling block puzzle game. Rotate and move falling tetrominoes to create complete horizontal lines. Clear lines to score points and prevent the stack from reaching the top.',
    howToPlay: 'Use arrow keys to move and rotate falling blocks. Left/Right to move, Up to rotate, Down to soft drop. Complete horizontal lines are cleared. The game speeds up as you progress.',
    tips: [
      'Leave space for the long I-piece on one side',
      'Avoid creating holes that can\'t be filled',
      'Think ahead about where each piece will fit best',
      'Use hard drop for faster placement when certain',
    ],
  },
  crosswordle: {
    name: 'Crosswordle',
    intro: 'Crosswordle combines word guessing with crossword puzzles. Swap letters between columns to form valid words in each row. Solve all words before running out of swaps!',
    howToPlay: 'Click on a letter, then click another letter in a different column to swap them. Each row must form a valid word. Use hints wisely as swaps are limited.',
    tips: [
      'Look for common letter patterns first',
      'Check which letters could start or end words',
      'Use the word list as a reference for valid words',
      'Plan multiple swaps ahead before executing',
    ],
  },
  wordsearch: {
    name: 'Word Search',
    intro: 'Word Search is the classic word-finding puzzle game. Hidden words are placed horizontally, vertically, or diagonally within a grid of letters. Find all the words to win!',
    howToPlay: 'Click and drag to select letters that form a word. Words can be horizontal, vertical, diagonal, and even backwards. Found words are crossed off the list.',
    tips: [
      'Scan for less common letters like Q, X, Z first',
      'Look for the first letter of each target word',
      'Check all directions including diagonals',
      'Work systematically from top to bottom',
    ],
  },
  nonogram: {
    name: 'Nonogram',
    intro: 'Nonogram (also called Picross or Griddlers) is a picture logic puzzle. Use the number clues on the rows and columns to reveal a hidden pixel art image.',
    howToPlay: 'Numbers indicate consecutive filled cells in that row/column. Multiple numbers mean separate groups with at least one empty cell between them. Click to fill or X to mark empty cells.',
    tips: [
      'Start with the largest numbers that nearly fill a row/column',
      'Look for rows/columns where only one arrangement is possible',
      'Mark definitely empty cells with X to help visualize',
      'Cross-reference between rows and columns',
    ],
  },
  bullpen: {
    name: 'Bullpen',
    intro: 'Bullpen is a unique puzzle combining Sudoku and Minesweeper logic. Place bulls in the grid following Sudoku rules while avoiding the hidden cows!',
    howToPlay: 'Each row, column, and region must contain a specific number of bulls. Numbers show how many bulls are in adjacent cells. Use logic to deduce safe cells from mine-like clues.',
    tips: [
      'Start with regions that have the most constraints',
      'Use the number clues like Minesweeper to find patterns',
      'Remember: you\'re placing bulls, not avoiding them',
      'Cross-reference Sudoku rules with adjacency clues',
    ],
  },
  skyscrapers: {
    name: 'Skyscrapers',
    intro: 'Skyscrapers is a logic puzzle where you place buildings of different heights in a grid. The numbers outside indicate how many buildings are visible from that direction.',
    howToPlay: 'Place buildings 1-N in each row and column (like Sudoku). Clues show how many buildings are visible when looking from that direction. Taller buildings hide shorter ones behind them.',
    tips: [
      'The highest building (N) is always visible',
      'A clue of 1 means the tallest building is first',
      'A clue of N means buildings are in ascending order',
      'Start with the most restrictive clues',
    ],
  },
  memory: {
    name: 'Memory',
    intro: 'Memory is the classic card-matching game. Flip cards to find matching pairs. Train your memory while having fun with this timeless brain exercise!',
    howToPlay: 'Click cards to flip them. Find all matching pairs to win. The fewer moves you make, the better your score. Challenge yourself to remember card positions!',
    tips: [
      'Pay attention to every card flip, even matches',
      'Start by revealing a few cards to establish positions',
      'Create mental groups or stories to remember positions',
      'Practice regularly to improve memory skills',
    ],
  },
  snake: {
    name: 'Snake',
    intro: 'Snake is the beloved arcade classic. Guide the snake to eat food and grow longer. Avoid hitting walls or your own tail in this simple but addictive game!',
    howToPlay: 'Use arrow keys or WASD to control direction. Eat the food to grow longer and score points. The game ends if you hit a wall or your own body.',
    tips: [
      'Plan your path ahead, especially as you grow longer',
      'Avoid getting trapped in your own coils',
      'Stay near the center when possible for more escape routes',
      'Use smooth, flowing movements rather than sharp turns',
    ],
  },
  tictactoe: {
    name: 'Tic-Tac-Toe',
    intro: 'Tic-Tac-Toe (Noughts and Crosses) is the timeless two-player strategy game. Get three in a row to win! Play against the computer or a friend.',
    howToPlay: 'Players take turns placing X or O in empty cells. First to get three in a row (horizontally, vertically, or diagonally) wins. If all cells fill with no winner, it\'s a draw.',
    tips: [
      'Always take the center if available',
      'Block opponent\'s winning moves immediately',
      'Create "forks" - two winning threats at once',
      'Corners are more valuable than edges',
    ],
  },
  connectfour: {
    name: 'Connect Four',
    intro: 'Connect Four is the classic vertical strategy game. Drop discs into columns to connect four of your color horizontally, vertically, or diagonally!',
    howToPlay: 'Click a column to drop your disc. Discs fall to the lowest available position. First player to connect four in a row wins. Block your opponent while building your own line!',
    tips: [
      'Control the center column when possible',
      'Look for "double threats" - two ways to win',
      'Block opponent\'s potential connections early',
      'Build from the bottom up strategically',
    ],
  },
  whackamole: {
    name: 'Whack-a-Mole',
    intro: 'Whack-a-Mole is the fast-paced reflex game. Moles pop up randomly - tap them quickly before they disappear! Test your reaction speed and hand-eye coordination.',
    howToPlay: 'Click or tap moles as they pop up from their holes. You score points for each mole you hit. Miss too many and the game ends. Speed increases as you progress!',
    tips: [
      'Keep your eyes moving across all holes',
      'Don\'t fixate on one area',
      'Use quick, light taps rather than firm clicks',
      'Stay relaxed for faster reactions',
    ],
  },
  simonsays: {
    name: 'Simon Says',
    intro: 'Simon Says is the classic memory sequence game. Watch the color pattern and repeat it exactly. How long can you remember the growing sequence?',
    howToPlay: 'Watch the sequence of colors light up. Then repeat the pattern by clicking the colors in the same order. Each round adds one more color to the sequence.',
    tips: [
      'Say the colors out loud as you see them',
      'Create mental associations for longer sequences',
      'Break long sequences into smaller chunks',
      'Stay calm and focused as speed increases',
    ],
  },
  fifteenpuzzle: {
    name: '15 Puzzle',
    intro: '15 Puzzle (Sliding Puzzle) is the classic tile-sliding game. Arrange numbered tiles 1-15 in order by sliding them into the empty space.',
    howToPlay: 'Click a tile adjacent to the empty space to slide it. Arrange all tiles in numerical order from 1-15, with the empty space in the bottom right.',
    tips: [
      'Solve the top row first, then work down',
      'Don\'t worry about the last two numbers in a row until the end',
      'Learn the "rotation" technique for moving tiles',
      'Practice the final 2x3 section repeatedly',
    ],
  },
  lightsout: {
    name: 'Lights Out',
    intro: 'Lights Out is the engaging toggle puzzle. Turn off all lights by clicking on them. But be careful - each click toggles adjacent lights too!',
    howToPlay: 'Click a cell to toggle it and its adjacent neighbors (up, down, left, right). The goal is to turn all lights off. Each puzzle has a solution!',
    tips: [
      'Work from top to bottom systematically',
      'Never click the same cell twice',
      'The bottom row is determined by the rows above',
      'Some patterns require specific sequences',
    ],
  },
  brickbreaker: {
    name: 'Brick Breaker',
    intro: 'Brick Breaker (Breakout) is the classic arcade game. Use the paddle to bounce the ball and destroy all bricks. Don\'t let the ball fall!',
    howToPlay: 'Move the paddle with mouse or arrow keys. Bounce the ball to break bricks. Clear all bricks to advance. Catch power-ups for special abilities!',
    tips: [
      'Aim for corners to break through to the top',
      'Don\'t chase the ball - anticipate where it will land',
      'Catch falling power-ups when safe to do so',
      'Use angled shots to reach difficult bricks',
    ],
  },
  kakuro: {
    name: 'Kakuro',
    intro: 'Kakuro is like a crossword puzzle with numbers. Fill in cells so that each "word" adds up to the clue number. No digit can repeat in a single sum.',
    howToPlay: 'Fill empty cells with digits 1-9. The numbers above/left indicate the sum of consecutive cells. Each digit can only appear once in each sum.',
    tips: [
      'Learn common sum combinations (e.g., 4 cells summing to 10)',
      'Look for sums with limited possibilities',
      'Cross-reference between horizontal and vertical sums',
      'Start with cells that appear in multiple sums',
    ],
  },
  hitori: {
    name: 'Hitori',
    intro: 'Hitori is a Japanese logic puzzle. Black out cells so that no number appears more than once in any row or column. Black cells cannot touch horizontally or vertically.',
    howToPlay: 'Click cells to black them out. Ensure: 1) No number repeats in any row/column, 2) Black cells never touch (diagonal is OK), 3) All white cells connect.',
    tips: [
      'If a number appears twice, one must be blacked out',
      'If a number appears three times, the middle one stays white',
      'Black cells can\'t touch - use this to mark neighbors white',
      'Check that white cells stay connected',
    ],
  },
  kenken: {
    name: 'KenKen',
    intro: 'KenKen (Calcudoku) combines Sudoku with math operations. Fill the grid so each row and column contains unique numbers, while satisfying the cage math operations.',
    howToPlay: 'Fill each cell with digits 1-N (N = grid size). Numbers cannot repeat in rows or columns. Each "cage" must equal the target number using the specified operation.',
    tips: [
      'Start with cages that have only one solution',
      'Look for cages with unique digit combinations',
      'Use Sudoku logic for rows and columns',
      'Division and subtraction can be in any order',
    ],
  },
  threes: {
    name: 'Threes',
    intro: 'Threes is the sliding number puzzle that inspired 2048. Slide tiles to combine 1+2 into 3, then merge matching numbers. Strategy matters more than luck!',
    howToPlay: 'Swipe to slide all tiles. Combine 1 and 2 to make 3. Match same numbers (3+3, 6+6, etc.) to merge. New tiles appear after each move.',
    tips: [
      'Always keep 1s and 2s adjacent to combine them',
      'Build high numbers in corners',
      'Plan moves to avoid trapping small numbers',
      'The next tile preview helps you plan',
    ],
  },
  suguru: {
    name: 'Suguru',
    intro: 'Suguru (Number Blocks) is a logic puzzle where you fill regions with numbers. Each region of N cells must contain digits 1-N. Same numbers cannot touch.',
    howToPlay: 'Fill each region with numbers 1 through its size. Identical numbers cannot be adjacent (including diagonally). Use logic to deduce each cell\'s value.',
    tips: [
      'Start with small regions (size 1-2)',
      'Look for cells that can only be one number',
      'Use elimination based on adjacent numbers',
      'Check all 8 neighbors when placing numbers',
    ],
  },
  hashiwokakero: {
    name: 'Bridges',
    intro: 'Bridges (Hashiwokakero) is a bridge-building puzzle. Connect islands with bridges so that all islands connect. Each island shows how many bridges connect to it.',
    howToPlay: 'Click between islands to build bridges. Each island\'s number shows required bridge connections. Bridges run horizontally/vertically and cannot cross.',
    tips: [
      'Islands with 8 need 4 bridges in each direction',
      'Corner 4s need 2 bridges in each available direction',
      'Plan routes to avoid bridge crossings',
      'All islands must be connected in one network',
    ],
  },
  slitherlink: {
    name: 'Slitherlink',
    intro: 'Slitherlink is a loop-forming puzzle. Draw a single continuous loop using the number clues. Each number indicates how many of its four sides are used.',
    howToPlay: 'Click edges to include them in the loop. Numbers 0-3 indicate how many edges around that cell are used. Create one continuous loop with no crossings or branches.',
    tips: [
      '0 means no edges around that cell',
      '3 in a corner forces two edges',
      'Diagonal 3s create a specific pattern',
      'The loop must be continuous - avoid creating branches',
    ],
  },
  binary: {
    name: 'Binary',
    intro: 'Binary (Takuzu) is a pure logic puzzle. Fill the grid with 0s and 1s so that no more than two same digits are adjacent and each row/column is unique.',
    howToPlay: 'Fill cells with 0 or 1. Rules: 1) No more than two same digits adjacent, 2) Each row and column has equal 0s and 1s, 3) No two rows or columns are identical.',
    tips: [
      'If two same digits appear, the next must be opposite',
      'Count remaining 0s and 1s in each row/column',
      'Look for rows/columns that are nearly complete',
      'Compare partial rows to find unique patterns',
    ],
  },
  dictionary: {
    name: 'Dictionary',
    intro: 'Dictionary is your comprehensive word reference tool. Look up word definitions, synonyms, and more. Perfect for word game enthusiasts and language learners!',
    howToPlay: 'Type a word in the search box to see its definition, part of speech, and example usage. Supports both English and Chinese word lookups.',
    tips: [
      'Use wildcards (*) to find word patterns',
      'Check related words for vocabulary building',
      'Save interesting words for later reference',
      'Explore word origins for deeper understanding',
    ],
  },
  nurikabe: {
    name: 'Nurikabe',
    intro: 'Nurikabe is a Japanese logic puzzle where you create white "islands" surrounded by black "walls". Each numbered cell indicates the size of its island.',
    howToPlay: 'Click cells to toggle between empty (gray), black (wall), or white (island). Each number shows its island\'s size. Islands can\'t touch. All walls must connect. No 2x2 black blocks.',
    tips: [
      'Start with small numbers (1, 2) - they have limited options',
      'Islands can\'t touch, so mark boundaries with black',
      'Keep walls connected to avoid isolated areas',
      'Never create 2x2 black blocks',
    ],
  },
  reversi: {
    name: 'Reversi',
    intro: 'Reversi (Othello) is a classic strategy board game. Place your disc to flip opponent pieces between your discs. The player with more discs at the end wins!',
    howToPlay: 'Click on a valid cell to place your disc. You must flip at least one opponent disc. Discs are flipped when sandwiched between your discs. Game ends when no moves remain.',
    tips: [
      'Control corners - they can never be flipped',
      'Avoid spaces next to corners early in the game',
      'Focus on stable discs that can\'t be flipped',
      'Mobility matters - keep your move options open',
    ],
  },
  gomoku: {
    name: 'Gomoku',
    intro: 'Gomoku (Five in a Row) is a classic strategy board game played on a 15×15 grid. Be the first to place five stones in a row to win!',
    howToPlay: 'Click on any intersection to place your stone. The first player to get five in a row (horizontal, vertical, or diagonal) wins. You play black against the AI.',
    tips: [
      'Control the center for more winning opportunities',
      'Create "open fours" - four in a row with both ends open',
      'Block opponent threats immediately',
      'Build multiple threats simultaneously',
    ],
  },
  numbermemory: {
    name: 'Number Memory',
    intro: 'Number Memory tests your short-term memory with increasingly long digit sequences. How many digits can you remember?',
    howToPlay: 'Watch the number displayed on screen. When it disappears, type the exact sequence. Each correct answer adds one more digit. You have 3 attempts per level.',
    tips: [
      'Chunk numbers into groups of 2-3 digits',
      'Create patterns or stories to remember sequences',
      'Stay focused and eliminate distractions',
      'Practice regularly to improve memory capacity',
    ],
  },
  hangman: {
    name: 'Hangman',
    intro: 'Hangman is the classic word guessing game. Guess the hidden word one letter at a time before the hangman is complete. Only 6 wrong guesses allowed!',
    howToPlay: 'Click letters on the keyboard or type to guess. Correct letters appear in the word. Wrong guesses add to the hangman. Win by guessing all letters before 6 mistakes.',
    tips: [
      'Start with common vowels (E, A, O, I)',
      'Try common consonants (R, S, T, L, N)',
      'Look for common letter patterns',
      'Use word length to narrow possibilities',
    ],
  },
  starbattle: {
    name: 'Star Battle',
    intro: 'Star Battle is a logic puzzle where you place stars in a grid. Each region must contain exactly 2 stars, and no two stars can touch (even diagonally).',
    howToPlay: 'Click cells to place stars. Each colored region needs 2 stars. Stars cannot be adjacent horizontally, vertically, or diagonally. Use logic to deduce valid positions.',
    tips: [
      'Start with small regions - they have fewer options',
      'If a star is placed, mark all adjacent cells as empty',
      'Regions with 2 stars in 3 cells are constrained',
      'Work systematically through constraints',
    ],
  },
  checkers: {
    name: 'Checkers',
    intro: 'Checkers (Draughts) is the classic strategy board game. Capture opponent pieces by jumping over them. Reach the opposite end to become a King!',
    howToPlay: 'Click a piece to select, then click a valid square to move. Regular pieces move diagonally forward. Jump over opponent pieces to capture them. Kings can move backward.',
    tips: [
      'Control the center of the board',
      'Protect your back row to prevent opponent Kings',
      'Look for double and triple jump opportunities',
      'Advance pieces together rather than isolated',
    ],
  },
  dotsandboxes: {
    name: 'Dots and Boxes',
    intro: 'Dots and Boxes is a classic paper-and-pencil strategy game. Connect dots to form boxes. Complete a box to score and get an extra turn!',
    howToPlay: 'Click on lines between dots to draw them. When you complete a box, you score a point and get another turn. The player with most boxes wins.',
    tips: [
      'Avoid creating the third side of a box for your opponent',
      'Try to create chains of boxes you can complete',
      'The double-cross strategy: sacrifice 2 boxes to win the chain',
      'Count boxes carefully in the endgame',
    ],
  },
  patternmemory: {
    name: 'Pattern Memory',
    intro: 'Pattern Memory challenges you to remember increasingly complex colored patterns. Study the pattern, then recreate it from memory!',
    howToPlay: 'Watch the colored pattern appear on the grid. When it disappears, click cells to recreate the exact pattern. Each level adds more complexity.',
    tips: [
      'Use mnemonic devices like creating shapes or stories',
      'Remember colors by position groups',
      'Focus on one area at a time',
      'Practice spatial memory exercises',
    ],
  },
  anagrams: {
    name: 'Anagrams',
    intro: 'Anagrams challenges you to unscramble jumbled letters to form real words. Test your vocabulary and pattern recognition skills!',
    howToPlay: 'Look at the shuffled letters and type the correct word. Use the hint if stuck. You have 3 attempts per word. Longer streaks earn bonus points!',
    tips: [
      'Look for common prefixes and suffixes',
      'Try arranging letters in different orders',
      'Common letter combinations like TH, CH, ING',
      'Say the letters out loud to hear possibilities',
    ],
  },
  boggle: {
    name: 'Boggle',
    intro: 'Boggle is the classic word search game. Find as many words as possible by connecting adjacent letters in the 4x4 grid within 2 minutes!',
    howToPlay: 'Click adjacent letters (horizontal, vertical, diagonal) to form words of 3+ letters. Each letter can only be used once per word. Longer words score more points.',
    tips: [
      'Start with common letter patterns and prefixes',
      'Look for plural forms ending in S',
      'Scan systematically through starting letters',
      'Practice finding longer words for higher scores',
    ],
  },
  nim: {
    name: 'Nim',
    intro: 'Nim is an ancient mathematical strategy game. Remove stones from rows, but the player who takes the last stone loses! Master the XOR strategy.',
    howToPlay: 'Select a row, then choose how many stones to remove. You must take at least 1 stone. The player forced to take the last stone loses the game.',
    tips: [
      'In Hard mode, the AI uses optimal XOR strategy',
      'Try to leave your opponent with equal rows',
      'Control the total stone count',
      'Learn the mathematical theory for perfect play',
    ],
  },
  simongame: {
    name: 'Simon Game',
    intro: 'Simon Game is the classic electronic memory game. Watch the color sequence and repeat it exactly. How long can you go?',
    howToPlay: 'Watch the colored buttons light up in sequence. When it\'s your turn, click the colors in the same order. Each round adds one more color to remember.',
    tips: [
      'Say the colors out loud as they appear',
      'Create mental stories or associations',
      'Break long sequences into chunks of 3-4',
      'Stay calm and focused as speed increases',
    ],
  },
  reactiontest: {
    name: 'Reaction Test',
    intro: 'Reaction Test measures your reflex speed. Wait for green and click as fast as possible! The average human reaction time is about 250ms.',
    howToPlay: 'Click Start, then wait for the screen to turn from red to green. Click immediately when you see green. Don\'t click too early or you\'ll have to restart.',
    tips: [
      'Stay relaxed - tension slows reactions',
      'Focus on the center of the screen',
      'Don\'t anticipate - wait for the actual signal',
      'Practice regularly to improve your baseline',
    ],
  },
  heyawake: {
    name: 'Heyawake',
    intro: 'Heyawake is a Japanese logic puzzle where you fill cells black or white in a grid divided into rooms. Each room has a target number of black cells!',
    howToPlay: 'Click cells to cycle through empty, black, or white. Each room must have exactly its target number of black cells. No three black cells can be consecutive, and all white cells must be connected.',
    tips: [
      'Start with rooms that have 0 black cells - mark all white',
      'Look for rooms where the target forces specific placements',
      'Avoid creating 3+ consecutive blacks when marking cells',
      'Use white connectivity to eliminate impossible black placements',
    ],
  },
  masyu: {
    name: 'Masyu',
    intro: 'Masyu is a loop-drawing puzzle played on a grid with black and white pearls. Draw a single continuous loop that passes through all pearls!',
    howToPlay: 'Click on edges between dots to draw line segments. The loop must pass through all pearls. At white pearls, go straight through. At black pearls, make a turn.',
    tips: [
      'Black pearls must turn - plan corners around them',
      'White pearls need straight paths - avoid blocking both directions',
      'Look for pearls near edges - they constrain the loop',
      'Build the loop section by section, connecting as you go',
    ],
  },
  fillomino: {
    name: 'Fillomino',
    intro: 'Fillomino is a region-filling puzzle. Fill the grid with numbers so that each number forms a connected region of exactly that size!',
    howToPlay: 'Click a cell and enter a number (1-9). Same numbers must form connected regions. Each region size must equal its number. Different regions with the same number cannot touch.',
    tips: [
      'Given numbers are anchors - regions must match their value',
      'Small regions (1, 2) are easiest to place first',
      'Watch for conflicts where same-numbered regions would touch',
      'Count cells carefully - each region needs exactly its number of cells',
    ],
  },
  pong: {
    name: 'Pong',
    intro: 'Pong is the classic arcade game that started it all! Use your paddle to bounce the ball past your opponent. First to 7 wins!',
    howToPlay: 'Use arrow keys or W/S to move your paddle up and down. Hit the ball to send it back. Score when the ball passes your opponent\'s paddle. Choose difficulty for AI challenge level.',
    tips: [
      'Position yourself based on ball trajectory early',
      'Hit the ball with different paddle positions to angle shots',
      'In harder modes, anticipate ball bounces',
      'Control the pace - don\'t just react',
    ],
  },
  frogger: {
    name: 'Frogger',
    intro: 'Frogger is the classic arcade game where you guide a frog across busy roads and dangerous rivers. Fill all 5 goal zones to advance!',
    howToPlay: 'Use arrow keys or WASD to hop. Cross roads avoiding cars and trucks. Cross rivers by jumping on logs and turtles. Reach the goal zones at the top to score!',
    tips: [
      'Time your road crossings between vehicles',
      'On logs and turtles, you move with them',
      'Watch for gaps in traffic and log patterns',
      'Don\'t stay on turtles too long - some dive!',
    ],
  },
  yajilin: {
    name: 'Yajilin',
    intro: 'Yajilin is a Japanese logic puzzle where you shade cells and draw a single continuous loop through all remaining cells!',
    howToPlay: 'Shade some cells black so that no two black cells touch. Draw a single loop through all non-shaded, non-clue cells. Clues show how many black cells are in the indicated direction.',
    tips: [
      'Start with clue cells - they tell you where black cells must be',
      'Black cells cannot touch each other orthogonally',
      'The loop must visit every white cell exactly once',
      'Use process of elimination for cells that cannot be black',
    ],
  },
  castlewall: {
    name: 'Castle Wall',
    intro: 'Castle Wall is a logic puzzle where you draw walls to form a single closed loop. Clues indicate how many wall segments are visible in each direction!',
    howToPlay: 'Click cells to cycle between wall, no-wall, and unknown. Draw a single closed loop of walls. Clues show the number of visible wall segments in that direction.',
    tips: [
      'Start with 0 clues - they mean no walls in that direction',
      'Walls must connect to form a single loop',
      'Use the clue numbers to limit possibilities',
      'Mark cells that definitely cannot be walls',
    ],
  },
  shakashaka: {
    name: 'Shakashaka',
    intro: 'Shakashaka is a puzzle where you place triangles to form rectangles. Fill the white areas with black triangles so all white regions become rectangles!',
    howToPlay: 'Click cells to place triangles in corners. Each white area must form a perfect rectangle. Black clue cells show how many adjacent triangles surround them.',
    tips: [
      'Look for areas that can only be one shape',
      'Use clue cells to determine triangle placements',
      'Rectangles can be any size, including 1x1',
      'Check that white areas don\'t form L-shapes',
    ],
  },
  aqre: {
    name: 'Aqre',
    intro: 'Aqre is a shading puzzle where you blacken cells. No row or column can have more than 2 consecutive black cells!',
    howToPlay: 'Click cells to shade them black or mark them as white. No two black cells can touch diagonally. Each row and column can have at most 2 consecutive black cells.',
    tips: [
      'Use clues to determine how many blacks are visible',
      'Avoid creating runs of 3+ consecutive blacks',
      'White cells must be connected',
      'Start with constrained areas near clues',
    ],
  },
  tapa: {
    name: 'Tapa',
    intro: 'Tapa is a shading puzzle where you create a connected wall of black cells. Clues show lengths of consecutive black cell runs in the 8 surrounding cells!',
    howToPlay: 'Click cells to shade them black. All black cells must be connected. Clue numbers show lengths of consecutive black runs around that cell.',
    tips: [
      'All black cells must connect to form a single wall',
      'No 2x2 area can be completely black',
      'Multiple numbers mean separate runs with gaps',
      '0 clues mean all surrounding cells are white',
    ],
  },
  spaceinvaders: {
    name: 'Space Invaders',
    intro: 'Space Invaders is the classic arcade shooter! Destroy all alien invaders before they reach Earth. Watch out for their bombs!',
    howToPlay: 'Use arrow keys to move left/right and Space to shoot. Destroy all aliens to advance. Aliens move faster as their numbers decrease. You have 3 lives.',
    tips: [
      'Stay under the invaders for easier shots',
      'Shoot from edges when possible',
      'Watch for the speeding up as enemies decrease',
      'Use predictable movement patterns to aim',
    ],
  },
  asteroids: {
    name: 'Asteroids',
    intro: 'Asteroids is the classic vector arcade game! Pilot your ship, destroy asteroids, and survive as long as possible in deep space!',
    howToPlay: 'Use arrow keys: Left/Right to rotate, Up to thrust, Space to shoot. Large asteroids split into smaller ones. Don\'t get hit by any asteroid!',
    tips: [
      'Keep moving - staying still is dangerous',
      'Clear small asteroids first - they\'re harder to hit',
      'Use momentum to drift and shoot',
      'The ship wraps around screen edges',
    ],
  },
  pacman: {
    name: 'Pac-Man',
    intro: 'Pac-Man is the legendary maze game! Eat all dots while avoiding ghosts. Power pellets let you eat ghosts for bonus points!',
    howToPlay: 'Use arrow keys to guide Pac-Man through the maze. Eat all dots to win. Avoid ghosts unless powered up. Power pellets make ghosts vulnerable temporarily.',
    tips: [
      'Learn ghost patterns - each has unique behavior',
      'Save power pellets for emergencies',
      'Clear one side of the maze at a time',
      'Use tunnels to escape ghosts',
    ],
  },
  breakoutgame: {
    name: 'Breakout',
    intro: 'Breakout is the classic brick-breaking game! Use your paddle to bounce the ball and destroy all bricks. Don\'t let the ball fall!',
    howToPlay: 'Use arrow keys to move the paddle. Bounce the ball to break bricks. Clear all bricks to win. You have 3 lives - lose one when ball falls below paddle.',
    tips: [
      'Angle your shots to hit more bricks',
      'Aim for the top to cascade through rows',
      'Keep the ball near center for control',
      'Speed increases as you progress',
    ],
  },
  chess: {
    name: 'Chess',
    intro: 'Chess is the world\'s most popular strategy game. Capture the opponent\'s king by outmaneuvering their pieces in this battle of wits!',
    howToPlay: 'Click a piece to select it, then click a valid square to move. Green dots show valid moves. Capture the enemy king to win. Each piece has unique movement rules.',
    tips: [
      'Control the center of the board early',
      'Develop your pieces (knights, bishops) before attacks',
      'Castle early to protect your king',
      'Think several moves ahead',
    ],
  },
  chinesechess: {
    name: 'Chinese Chess',
    intro: 'Chinese Chess (Xiangqi) is the classic strategy game of China. Capture the enemy general using unique pieces with specialized movements!',
    howToPlay: 'Click a piece to select it, then click a valid square to move. Pieces include General, Advisors, Elephants, Horses, Chariots, Cannons, and Soldiers.',
    tips: [
      'The General cannot leave the palace',
      'Cannons need a screen piece to capture',
      'Horses can be blocked by adjacent pieces',
      'Control the river crossing points',
    ],
  },
  sudokux: {
    name: 'Sudoku X',
    intro: 'Sudoku X adds diagonal constraints to classic Sudoku. Each row, column, 3x3 box, AND both main diagonals must contain 1-9!',
    howToPlay: 'Click a cell and enter 1-9. Each row, column, 3x3 box, and both diagonals must contain all digits 1-9 exactly once. Blue cells highlight diagonal constraints.',
    tips: [
      'Use diagonals as additional constraints',
      'Diagonal cells have fewer possible values',
      'Start with diagonal intersections',
      'Classic Sudoku strategies still apply',
    ],
  },
  killersudoku: {
    name: 'Killer Sudoku',
    intro: 'Killer Sudoku combines Sudoku with sum cages. Fill the grid so rows, columns, and boxes have 1-9, while cage sums match their clues!',
    howToPlay: 'Each cage shows a sum in the corner. Numbers in each cage must add up to that sum. No number can repeat within a cage. Standard Sudoku rules also apply.',
    tips: [
      'Look for cages with only one possible combination',
      'Small cages (sum 3, 4) are easiest to solve first',
      'Use Sudoku elimination with cage constraints',
      'Track which numbers are used in each cage',
    ],
  },
  battleship: {
    name: 'Battleship',
    intro: 'Battleship is the classic naval combat game! Place your fleet, then find and destroy enemy ships before they sink yours!',
    howToPlay: 'First place your ships on your board (click to place, button to rotate). Then click enemy board to fire. Red = hit, Blue = miss. Sink all enemy ships to win!',
    tips: [
      'Spread out your shots initially',
      'After a hit, fire adjacent cells to find ship direction',
      'Place ships in unpredictable patterns',
      'Remember the ship sizes to track what\'s left',
    ],
  },
  wordle: {
    name: 'Wordle',
    intro: 'Wordle is the viral word-guessing game! Guess the 5-letter word in 6 tries. Green = correct, Yellow = wrong position, Gray = not in word.',
    howToPlay: 'Type a 5-letter word and press Enter. Green letters are correct in the right spot. Yellow letters are in the word but wrong position. Gray letters are not in the word.',
    tips: [
      'Start with words containing common letters (R, S, T, L, N)',
      'Use different letters each guess initially',
      'Yellow letters help narrow positions',
      'Think about common word patterns',
    ],
  },
  spellingbee: {
    name: 'Spelling Bee',
    intro: 'Spelling Bee challenges you to make words using 7 letters. Every word must include the center letter. Find long words and pangrams for bonus points!',
    howToPlay: 'Make words of 4+ letters using the honeycomb letters. Every word must contain the center letter. Pangrams (using all 7 letters) earn bonus points!',
    tips: [
      'Always include the center letter',
      'Look for plural forms of words',
      'Find the pangram for big points',
      'Common endings: -ING, -ED, -ER',
    ],
  },
  connections: {
    name: 'Connections',
    intro: 'Connections challenges you to group 16 words into 4 categories of 4. Find the hidden connections between words!',
    howToPlay: 'Select 4 words you think belong together, then submit. If correct, the category is revealed. You have 4 mistakes allowed. Solve all 4 groups to win!',
    tips: [
      'Look for words that could fit multiple categories',
      'Start with the most obvious connections',
      'Be careful with tricky words that seem related',
      'Yellow is easiest, purple is hardest',
    ],
  },
}

// Game guides in Simplified Chinese
const gameGuidesZhCN: GameGuides = {
  sudoku: {
    name: '数独',
    intro: '数独是经典的9x9数字逻辑谜题，风靡全球。在网格中填入数字，使每行、每列和每个3x3宫格都包含1-9。不需要数学运算——只需纯粹的逻辑推理！',
    howToPlay: '点击空白单元格并输入1-9的数字。每行、每列和每个3x3宫格必须恰好包含1-9的所有数字。使用笔记功能标记可能的候选数字。错误的输入会以红色高亮显示。',
    tips: [
      '从填满单元格最多的行、列或宫格开始',
      '使用排除法——如果一个数字只能放在一个单元格，就填入它',
      '寻找"裸对"——两个只能包含相同两个数字的单元格',
      '使用笔记追踪每个单元格的所有可能候选数字',
    ],
  },
  game2048: {
    name: '2048',
    intro: '2048是令人上瘾的滑动数字拼图游戏。向任意方向滑动数字方块来合并相同的数字。当两个相同数字的方块碰撞时，它们会合并成两倍数值的方块。达到2048即可获胜！',
    howToPlay: '使用方向键（或在手机上滑动）向该方向滑动所有方块。相同数值的方块碰撞时会合并。每次移动后会出现一个新方块（2或4）。当无法再移动时游戏结束。',
    tips: [
      '将最大的方块保持在角落，并在周围构建',
      '永远不要将最大的方块移出角落',
      '尽量让方块沿一条边按降序排列',
      '提前规划——每一步都会影响整个棋盘',
    ],
  },
  mastermind: {
    name: '猜码大师',
    intro: '猜码大师是经典的密码破解谜题游戏。在8次尝试内猜出秘密的4色密码，利用每次猜测后提供的反馈线索进行逻辑推理。',
    howToPlay: '选择4种颜色进行猜测。提交后，你会看到反馈：绿色圆点表示颜色和位置都正确，白色圆点表示颜色正确但位置错误。利用这些反馈推断出秘密密码。',
    tips: [
      '首先使用4种不同的颜色以获取最多信息',
      '注意哪些颜色完全不出现',
      '记住颜色可以在密码中重复',
      '根据反馈系统地测试颜色位置',
    ],
  },
  minesweeper: {
    name: '扫雷',
    intro: '扫雷是经典的单人谜题游戏。使用指示每个单元格周围有多少地雷的数字，揭开所有不含地雷的单元格。',
    howToPlay: '点击揭开一个单元格。数字显示8个相邻单元格中有多少地雷。右键单击标记你认为含有地雷的单元格。清除所有非地雷单元格即可获胜。',
    tips: [
      '第一次点击总是安全的',
      '如果一个数字等于其相邻未揭开单元格数，则全部是地雷',
      '如果一个数字等于其相邻旗帜数，则其他相邻单元格都是安全的',
      '从角落和边缘开始更容易推理',
    ],
  },
  tetris: {
    name: '俄罗斯方块',
    intro: '俄罗斯方块是标志性的下落方块拼图游戏。旋转和移动下落的方块以创建完整的水平线。消除线条得分并防止方块堆到顶部。',
    howToPlay: '使用方向键移动和旋转下落的方块。左/右移动，上旋转，下加速下落。完成水平线会被消除。随着游戏进行速度会加快。',
    tips: [
      '在一边为长条I形方块留出空间',
      '避免创建无法填充的空洞',
      '提前思考每个方块最适合放在哪里',
      '确定后使用硬降加速放置',
    ],
  },
  wordle: {
    name: 'Wordle猜词',
    intro: 'Wordle是风靡全球的猜词游戏！在6次尝试内猜出5个字母的单词。绿色=正确，黄色=位置错误，灰色=不在单词中。',
    howToPlay: '输入一个5字母单词并按回车。绿色字母表示位置正确。黄色字母表示在单词中但位置错误。灰色字母表示不在单词中。',
    tips: [
      '从包含常用字母的单词开始（R, S, T, L, N）',
      '最初的猜测尽量使用不同的字母',
      '黄色字母帮助缩小位置范围',
      '思考常见的单词模式',
    ],
  },
  crosswordle: {
    name: '纵横猜词',
    intro: '纵横猜词结合了猜词和填字游戏。在列之间交换字母，使每行形成有效的单词。在交换次数用完之前解决所有单词！',
    howToPlay: '点击一个字母，然后点击另一列中的另一个字母来交换它们。每行必须形成一个有效的单词。明智地使用提示，因为交换次数有限。',
    tips: [
      '首先寻找常见的字母模式',
      '检查哪些字母可以开头或结尾单词',
      '使用单词列表作为有效单词的参考',
      '在执行之前提前规划多次交换',
    ],
  },
  nonogram: {
    name: '数织',
    intro: '数织（也叫方块拼图）是一种图片逻辑谜题。使用行和列上的数字线索来揭示隐藏的像素艺术图像。',
    howToPlay: '数字表示该行/列中连续填充的单元格。多个数字表示分开的组，组之间至少有一个空单元格。点击填充，X标记空单元格。',
    tips: [
      '从几乎填满一行/列的最大数字开始',
      '寻找只有一种排列可能的行/列',
      '用X标记确定空的单元格以帮助可视化',
      '在行和列之间交叉参考',
    ],
  },
  memory: {
    name: '记忆翻牌',
    intro: '记忆翻牌是经典的配对游戏。翻开卡片找到匹配的对子。训练你的记忆力，享受这款永恒的大脑锻炼游戏！',
    howToPlay: '点击卡片翻开它们。找到所有匹配的对子即可获胜。移动次数越少，分数越高。挑战自己记住卡片位置！',
    tips: [
      '注意每一次翻牌，即使是匹配的',
      '首先翻开几张卡片来建立位置记忆',
      '创建心理分组或故事来记住位置',
      '定期练习以提高记忆能力',
    ],
  },
  snake: {
    name: '贪吃蛇',
    intro: '贪吃蛇是深受喜爱的街机经典。引导蛇吃食物并变长。避免撞墙或自己的尾巴，这款简单但令人上瘾的游戏！',
    howToPlay: '使用方向键或WASD控制方向。吃食物来变长并得分。如果你撞到墙或自己的身体，游戏结束。',
    tips: [
      '提前规划路径，特别是当你变长时',
      '避免被困在自己的身体中',
      '尽可能保持在中心附近以获得更多逃生路线',
      '使用平滑、流畅的动作而不是急转弯',
    ],
  },
  tictactoe: {
    name: '井字棋',
    intro: '井字棋（圈叉棋）是永恒的双人策略游戏。三子连线即可获胜！与电脑或朋友对战。',
    howToPlay: '玩家轮流在空格中放置X或O。首先连成三个（水平、垂直或对角线）的获胜。如果所有格都填满但没有获胜者，就是平局。',
    tips: [
      '如果可能，总是占据中心',
      '立即阻止对手的获胜动作',
      '创造"叉子"——同时两个获胜威胁',
      '角比边更有价值',
    ],
  },
  connectfour: {
    name: '四子棋',
    intro: '四子棋是经典的垂直策略游戏。将圆盘投入列中，以水平、垂直或对角线连接四个同色圆盘！',
    howToPlay: '点击一列放下圆盘。圆盘会落到最低的可用位置。首先连成四个的玩家获胜。在建立自己的连线时阻止对手！',
    tips: [
      '尽可能控制中心列',
      '寻找"双重威胁"——两种获胜方式',
      '尽早阻止对手的潜在连线',
      '从底部向上策略性地构建',
    ],
  },
  chess: {
    name: '国际象棋',
    intro: '国际象棋是世界上最受欢迎的策略游戏。通过智胜对手的棋子来将死对方的国王！',
    howToPlay: '点击棋子选择它，然后点击有效位置移动。绿点显示有效移动。将死敌方国王即可获胜。每种棋子都有独特的移动规则。',
    tips: [
      '早期控制棋盘中心',
      '在进攻前先发展棋子（马、象）',
      '尽早王车易位以保护国王',
      '提前思考几步',
    ],
  },
  chinesechess: {
    name: '中国象棋',
    intro: '中国象棋是中国的经典策略游戏。使用具有特殊移动规则的独特棋子来将死敌方将帅！',
    howToPlay: '点击棋子选择它，然后点击有效位置移动。棋子包括将/帅、士、象、马、车、炮和兵/卒。',
    tips: [
      '将/帅不能离开九宫',
      '炮需要炮架才能吃子',
      '马可以被相邻的棋子蹩脚',
      '控制河界渡河点',
    ],
  },
  reversi: {
    name: '黑白棋',
    intro: '黑白棋（奥赛罗）是经典的策略棋盘游戏。放置你的棋子来翻转夹在你棋子之间的对手棋子。结束时棋子多的玩家获胜！',
    howToPlay: '点击有效位置放置棋子。你必须翻转至少一个对手棋子。当棋子被夹在你的棋子之间时会被翻转。当没有可走时游戏结束。',
    tips: [
      '控制角落——它们永远不能被翻转',
      '游戏早期避免靠近角落的位置',
      '专注于不能被翻转的稳定棋子',
      '机动性很重要——保持你的选择开放',
    ],
  },
  gomoku: {
    name: '五子棋',
    intro: '五子棋是在15×15棋盘上进行的经典策略棋盘游戏。首先连成五子的玩家获胜！',
    howToPlay: '点击任意交叉点放置棋子。首先连成五子（水平、垂直或对角线）的玩家获胜。你执黑棋与AI对战。',
    tips: [
      '控制中心以获得更多获胜机会',
      '创造"活四"——两端都开放的四子连线',
      '立即阻止对手的威胁',
      '同时建立多个威胁',
    ],
  },
  hangman: {
    name: '猜单词',
    intro: '猜单词是经典的猜词游戏。在绞刑架完成之前逐个字母猜出隐藏的单词。只允许6次错误猜测！',
    howToPlay: '点击键盘上的字母或输入来猜测。正确的字母会出现在单词中。错误的猜测会增加绞刑架。在6次错误之前猜出所有字母即可获胜。',
    tips: [
      '从常用元音开始（E, A, O, I）',
      '尝试常用辅音（R, S, T, L, N）',
      '寻找常见的字母模式',
      '使用单词长度缩小可能性',
    ],
  },
  wordsearch: {
    name: '找单词',
    intro: '找单词是经典的寻词谜题游戏。隐藏的单词水平、垂直或对角线放置在字母网格中。找到所有单词即可获胜！',
    howToPlay: '点击并拖动选择形成单词的字母。单词可以是水平、垂直、对角线，甚至反向。找到的单词会从列表中划掉。',
    tips: [
      '首先扫描较少见的字母，如Q, X, Z',
      '寻找每个目标单词的第一个字母',
      '检查所有方向，包括对角线',
      '从上到下系统地工作',
    ],
  },
  anagrams: {
    name: '字母重组',
    intro: '字母重组挑战你将打乱的字母重新排列成真正的单词。测试你的词汇量和模式识别能力！',
    howToPlay: '看打乱的字母并输入正确的单词。如果卡住可以使用提示。每个单词有3次尝试机会。连续答对可获得额外积分！',
    tips: [
      '寻找常见的前缀和后缀',
      '尝试以不同顺序排列字母',
      '常见的字母组合如TH, CH, ING',
      '大声说出字母来听出可能性',
    ],
  },
  boggle: {
    name: '摇骰子',
    intro: '摇骰子是经典的寻词游戏。在2分钟内在4x4网格中通过连接相邻字母找到尽可能多的单词！',
    howToPlay: '点击相邻字母（水平、垂直、对角线）形成3个以上字母的单词。每个字母在每个单词中只能使用一次。较长的单词得分更高。',
    tips: [
      '从常见的字母模式和前缀开始',
      '寻找以S结尾的复数形式',
      '系统地扫描起始字母',
      '练习找到更长的单词以获得更高的分数',
    ],
  },
  spellingbee: {
    name: '拼字蜜蜂',
    intro: '拼字蜜蜂挑战你使用7个字母组成单词。每个单词必须包含中心字母。找到长单词和使用所有字母的单词可获得额外积分！',
    howToPlay: '使用蜂窝字母组成4个以上字母的单词。每个单词必须包含中心字母。使用所有7个字母的单词可获得额外积分！',
    tips: [
      '始终包含中心字母',
      '寻找单词的复数形式',
      '找到使用所有字母的单词获得高分',
      '常见的结尾：-ING, -ED, -ER',
    ],
  },
  connections: {
    name: '词语连线',
    intro: '词语连线挑战你将16个单词分成4组，每组4个。找出单词之间隐藏的联系！',
    howToPlay: '选择你认为属于一组的4个单词，然后提交。如果正确，会显示类别名称。你有4次错误机会。解决所有4组即可获胜！',
    tips: [
      '寻找可能适合多个类别的单词',
      '从最明显的联系开始',
      '小心看起来相关但实际上不是的棘手单词',
      '黄色最简单，紫色最难',
    ],
  },
  aqre: {
    name: 'Aqre',
    intro: 'Aqre 是一款区域涂色逻辑谜题。将格子涂黑或留白，使每个区域内的黑色格子数量不超过该区域指示数字的连续数量！',
    howToPlay: '点击格子在黑色和白色之间切换。每个数字区域必须有相应数量的黑色格子。同一行/列中不能有3个或更多连续的黑色格子。',
    tips: [
      '从数字较小的区域开始',
      '注意避免3个或更多连续的黑色格子',
      '使用边界约束来推断格子状态',
    ],
  },
  asteroids: {
    name: '小行星',
    intro: '小行星是经典街机射击游戏！控制飞船在太空中摧毁小行星，同时避免被击中！',
    howToPlay: '使用方向键或WASD移动，空格键射击。击碎大号小行星会分裂成中小号。获得更高分数，但要注意不要撞到小行星！',
    tips: [
      '时刻保持移动以避免成为目标',
      '优先射击向你飞来的小行星',
      '注意屏幕边缘出现的小行星',
      '使用惯性和动量来控制飞船',
    ],
  },
  battleship: {
    name: '战舰',
    intro: '战舰是经典的海战游戏！放置你的舰队，然后在敌人击沉你的战舰之前找到并摧毁他们的战舰！',
    howToPlay: '首先在你的棋盘上放置战舰（点击放置，按钮旋转）。然后点击敌方棋盘开火。红色=命中，蓝色=未中。击沉所有敌方战舰获胜！',
    tips: [
      '起初分散你的射击',
      '命中后，向相邻格子开火以找出战舰方向',
      '以不可预测的模式放置战舰',
      '记住战舰大小以追踪剩余战舰',
    ],
  },
  binary: {
    name: '二进制谜题',
    intro: '二进制谜题是逻辑填充游戏。在网格中填入0和1，使每行每列的0和1数量相等，且没有三个相同的数字连续出现！',
    howToPlay: '点击格子在0和1之间切换。每行每列必须有相等数量的0和1。相同的数字（000或111）不能连续出现三次或更多。行/列数字提示匹配数量。',
    tips: [
      '从已经有较多数字的行或列开始',
      '寻找必须填入0或1以避免三连的格子',
      '使用交叉逻辑推理',
      '提示数字告诉你该行/列有多少个连续的相同数字',
    ],
  },
  breakoutgame: {
    name: '打砖块',
    intro: '打砖块是经典街机游戏！控制挡板反弹球体并击碎砖块。清除所有砖块获胜！',
    howToPlay: '使用左右方向键或鼠标移动挡板。让球保持反弹并击碎砖块。不要让球掉落！某些砖块需要多次击打或会掉落道具。',
    tips: [
      '瞄准砖块的薄弱点',
      '利用挡板的不同位置来控制反弹角度',
      '优先击碎难以到达区域的砖块',
      '利用道具获得额外球或其他加成',
    ],
  },
  brickbreaker: {
    name: '砖块破坏者',
    intro: '砖块破坏者是打砖块游戏的变体！使用球和挡板击碎所有砖块。每个砖块需要击打相应次数！',
    howToPlay: '移动挡板保持球反弹。砖块上的数字显示需要击打多少次。不同颜色的砖块需要不同次数。击碎所有砖块获胜！',
    tips: [
      '将球引导到高数字砖块区域',
      '等待合适的时机才击打敏感位置',
      '优先击碎容易到达的砖块',
      '注意球速随时间增加',
    ],
  },
  bullpen: {
    name: '牛栏',
    intro: '牛栏是区域划分逻辑谜题。将网格划分为每个区域指定数量的矩形子区域！',
    howToPlay: '点击和拖动创建矩形墙。每个数字区域必须被划分为恰好该数量的矩形。每个矩形恰好包含一个数字。矩形不能包含两个或更多数字。',
    tips: [
      '从约束最多的区域开始（大数字）',
      '每个矩形必须恰好包含一个数字',
      '矩形不能重叠或穿过区域边界',
      '使用排除法找到可能的矩形',
    ],
  },
  castlewall: {
    name: '城堡墙',
    intro: '城堡墙是日式围城逻辑谜题。在网格中画一条连续的墙，围住所有数字，并穿过所有带数字的格子！',
    howToPlay: '点击格子边缘来画墙。墙必须形成单一连续循环。数字表示从该格子能看到多少段墙（垂直和水平）。墙不能穿过自身或数字格子。',
    tips: [
      '从角落和边缘开始——它们有更多约束',
      '数字0表示没有墙连接到该格子',
      '墙必须围住每个数字的精确指示数量',
      '确保墙形成单一连续循环',
    ],
  },
  checkers: {
    name: '跳棋',
    intro: '跳棋是经典策略棋盘游戏！斜向移动你的棋子，跳过对方棋子来吃掉它们。将棋子升变为王！',
    howToPlay: '点击棋子选择，然后点击目标格子移动。斜向向前移动到空格子。跳过对方棋子吃掉它们（强制跳）。到达对方底线升变为王，可以向后移动。',
    tips: [
      '控制中心位置以获得更多移动选择',
      '保持你的棋子在一起形成防御',
      '优先升变棋子而不是吃子',
      '设置多重跳跃以获得更大收益',
    ],
  },
  dotsandboxes: {
    name: '点格棋',
    intro: '点格棋是经典的连接游戏！轮流连接相邻的点来完成盒子。完成最多的盒子者获胜！',
    howToPlay: '点击两点之间的水平或垂直线。完成一个盒子（四条边）获得一分并再走一步。小心不要过早为对手设置盒子！',
    tips: [
      '避免过早为对手完成第3条边',
      '试图迫使对手为你完成盒子',
      '游戏后期抢夺大部分区域',
      '使用长链策略控制游戏流程',
    ],
  },
  fifteenpuzzle: {
    name: '数字华容道',
    intro: '数字华容道是经典滑块谜题！滑动方块将数字按顺序排列。将方块1-15按顺序排列！',
    howToPlay: '点击与空格相邻的方块将其滑动到空格。将数字按从左到右、从上到下的顺序排列（1-15）。最后一个格子应该是空的。',
    tips: [
      '先解决第一行，然后第二行',
      '将方块移动到目标位置附近',
      '耐心规划——不要随意滑动',
      '使用标准算法解决最后两层',
    ],
  },
  fillomino: {
    name: '数织',
    intro: '数织是区域填充谜题。用数字填充网格，使每个数字形成恰好该大小的连通区域！',
    howToPlay: '点击单元格并输入数字（1-9）。相同数字必须形成连通区域。每个区域的大小必须等于其数字。不同区域不能有相同数字且相邻。',
    tips: [
      '给定数字是锚点——区域必须匹配其值',
      '小区域（1、2）最容易放置',
      '注意相同数字区域可能接触的冲突',
      '仔细计数——每个区域需要恰好其数字数量的格子',
    ],
  },
  frogger: {
    name: '青蛙过街',
    intro: '青蛙过街是经典街机游戏，你引导一只青蛙穿过繁忙的马路和危险的河流。填满所有5个目标区域以过关！',
    howToPlay: '使用方向键或WASD跳跃。穿过马路避开汽车和卡车。通过跳上圆木和乌龟穿过河流。到达顶部的目标区域得分！',
    tips: [
      '在车辆之间把握过马路时机',
      '在圆木和乌龟上，你会随它们移动',
      '注意交通和圆木模式的空隙',
      '不要在乌龟上停留太久——有些会潜水！',
    ],
  },
  hashiwokakero: {
    name: '桥',
    intro: '桥是连接岛屿的逻辑谜题。在岛屿之间画桥，使所有岛屿连通，且每座岛的桥数与岛上的数字相符！',
    howToPlay: '点击岛屿之间的格子来画桥。可以在两个岛之间画一到两座桥。所有岛屿必须连通。单个岛屿不能有超过两座桥连接到另一个岛屿。',
    tips: [
      '从角上的1开始——它们只有一种选择',
      '不能有超过两座桥的任何连接',
      '确保所有岛屿最终连通',
      '使用排除法找到必要的桥梁',
    ],
  },
  heyawake: {
    name: '部屋',
    intro: '部屋是区域划分逻辑谜题。将格子涂黑，使每个区域内有指定数量的黑色格子，且没有两个黑色格子相邻！',
    howToPlay: '点击格子将其涂黑或留白。每个区域必须恰好有指定数量的黑色格子。没有两个黑色格子可以共享边（斜向相邻可以）。所有白色格子必须连通。',
    tips: [
      '从0区域开始——将所有格子标记为白色',
      '从最大区域开始——它们约束最多',
      '避免创建三个连续的黑色格子',
      '确保所有白色格子保持连通',
    ],
  },
  hitori: {
    name: '数独消元',
    intro: '数独消元是逻辑消除游戏。涂黑格子，使每行每列中没有重复数字！',
    howToPlay: '点击格子将其涂黑。确保每行每列中没有重复数字。涂黑的格子不能相邻（斜向可以）。所有未涂黑格子必须连通。',
    tips: [
      '寻找多次出现的数字——其中必须被涂黑',
      '如果两个格子相邻且包含相同数字，其中一个必须被涂黑',
      '未涂黑的格子必须形成单一连通区域',
      '从有最多重复数字的行/列开始',
    ],
  },
  kakuro: {
    name: '数和',
    intro: '数和是数字交叉谜题。填入数字使横向和纵向的和与提示相符！',
    howToPlay: '在空白格子填入1-9的数字。横向或纵向连续格子内的数字之和必须等于提示数字。同一组内不能有重复数字。',
    tips: [
      '小格子数（和3、4）最容易解决',
      '使用数独排除法与格子约束',
      '追踪每个格子组中使用的数字',
      '寻找只有一个可能解的唯一组合',
    ],
  },
  kenken: {
    name: '算术数独',
    intro: '算术数独是带算术约束的网格谜题！填入数字使每行每列不重复，且满足算术运算！',
    howToPlay: '填入1-N的数字（N为网格大小）。每行每列必须恰好包含每个数字一次。粗线区域内的数字必须使用运算符（+、−、×、÷）产生目标数字。',
    tips: [
      '寻找约束最多的格子（最大/最小目标值）',
      '从单格子区域开始',
      '使用数独排除技巧',
      '注意运算顺序（对于−和÷）',
    ],
  },
  killersudoku: {
    name: '杀手数独',
    intro: '杀手数独结合数独规则与区域和！填入数字1-9，使每行每列每宫不重复，且区域和匹配目标值！',
    howToPlay: '填入1-9的数字。遵循数独规则（每行每列每宫恰好1-9一次）。虚线区域内数字之和必须等于角落的小数字。',
    tips: [
      '小格子数（和3、4）最容易解决',
      '使用数独排除法与格子约束',
      '追踪每个格子组中使用的数字',
      '寻找只有一个可能解的唯一组合',
    ],
  },
  lightsout: {
    name: '熄灯',
    intro: '熄灯是经典点击谜题！点击格子切换它的灯和相邻灯的状态。目标是关闭所有灯！',
    howToPlay: '点击格子来切换它和相邻格子（上下左右）的状态。亮灯变灭，灭灯变亮。当所有灯都关闭时获胜！',
    tips: [
      '逐行解决，从顶部开始',
      '记住点击顺序很重要',
      '某些格子是必须点击的关键格子',
      '如果你卡住了，重新考虑你的策略',
    ],
  },
  masyu: {
    name: '圆圈路径',
    intro: '圆圈路径是画圈逻辑谜题。在带有黑白圆圈的网格上画一条单一连续循环！',
    howToPlay: '点击点之间的边缘画线段。循环必须穿过所有圆圈。在白圈处直穿，在黑圈处转弯。循环必须回到起点。',
    tips: [
      '黑圈必须转弯——在它们周围规划角',
      '白圈需要直线路径——避免阻挡两个方向',
      '寻找靠近边缘的圆圈——它们约束循环',
      '一段接一段地建立循环',
    ],
  },
  nim: {
    name: '尼姆博弈',
    intro: '尼姆博弈是经典数学策略游戏！轮流从堆中拿取物品。拿走最后一个物品的玩家获胜！',
    howToPlay: '点击堆选择要拿取的物品数。每轮必须至少拿取一个，最多拿取堆中剩余物品数。谁拿走最后一个物品谁获胜。',
    tips: [
      '计算每堆的二进制表示',
      '关键策略是让对手处于必败位置',
      '在多堆游戏中，仔细规划你的移动',
      '小堆更容易控制',
    ],
  },
  numbermemory: {
    name: '数字记忆',
    intro: '数字记忆挑战你记住并重复数字序列！序列每回合增加一个数字。你能记多长？',
    howToPlay: '仔细观看显示的数字序列。输入相同的序列重复它。每个新回合增加一个数字。输入错误序列则游戏结束。',
    tips: [
      '使用分组技巧（如电话号码）记忆',
      '在心里默念数字',
      '将数字与图像或模式关联',
      '练习以提高你的记忆跨度',
    ],
  },
  nurikabe: {
    name: '数岛',
    intro: '数岛是岛屿划分逻辑谜题。涂黑格子形成"海"，留下未涂黑的"岛屿"，每个岛屿包含恰好一个数字！',
    howToPlay: '点击格子将其涂黑或留白。每个岛屿必须恰好包含一个数字。岛屿大小必须等于其数字。黑色格子（海）必须全部连通。没有两个岛屿可以相邻。',
    tips: [
      '从角上的大数字开始',
      '黑色格子不能形成2×2区域',
      '每个岛屿必须恰好包含一个数字',
      '所有黑色格子必须连通',
    ],
  },
  pacman: {
    name: '吃豆人',
    intro: '吃豆人是经典街机游戏！吃掉所有豆子，避开幽灵。吃掉能量球来反击！',
    howToPlay: '使用方向键移动吃豆人。吃掉豆子得分。避开幽灵——被碰到会失去一条命。吃掉能量球可以暂时反击幽灵。',
    tips: [
      '能量球时优先追逐幽灵',
      '学习每个幽灵的行为模式',
      '利用隧道穿越地图',
      '规划路线以最大化效率',
    ],
  },
  patternmemory: {
    name: '图案记忆',
    intro: '图案记忆挑战你记住并重复图案！显示高亮格子序列，然后按相同顺序重复它。',
    howToPlay: '观看高亮格子的序列。点击相同的格子重复序列。每个新回合增加一个格子。按错格子或顺序错误则游戏结束。',
    tips: [
      '在心里将图案分组记忆',
      '使用空间关联（如对角线、角落）',
      '大声说出来帮助记忆',
      '练习以提高你的视觉记忆',
    ],
  },
  pong: {
    name: 'Pong',
    intro: 'Pong是开启一切的经典街机游戏！使用挡板将球反弹过对手。先得7分获胜！',
    howToPlay: '使用方向键或W/S上下移动挡板。击球将其反弹回去。球穿过对手挡板得分。选择难度设置AI挑战级别。',
    tips: [
      '根据球的轨迹早期定位',
      '使用不同挡板位置击球来改变角度',
      '在困难模式下，预判球的反弹',
      '控制节奏——不要只是反应',
    ],
  },
  reactiontest: {
    name: '反应测试',
    intro: '反应测试测量你的反应速度！等待信号出现时尽快点击。多次尝试获得准确平均时间。',
    howToPlay: '等待屏幕变绿时立即点击。越快越好。反应时间以毫秒显示。尝试5次获得你的平均反应时间。',
    tips: [
      '保持专注和准备',
      '手放在鼠标/屏幕上准备',
      '避免预判——等待真正变化',
      '多次尝试获得准确结果',
    ],
  },
  shakashaka: {
    name: 'Shakashaka',
    intro: 'Shakashaka是三角形放置谜题。在格子中放置三角形形成矩形！',
    howToPlay: '点击格子在空白、右三角、下三角、左三角或上三角之间循环。白色区域必须形成矩形或正方形。三角形不能形成2×2全白区域。',
    tips: [
      '从大数字区域开始',
      '寻找可能形成矩形的三角形',
      '避免创建2×2白色区域',
      '使用约束来推断三角形位置',
    ],
  },
  simongame: {
    name: '西蒙游戏',
    intro: '西蒙游戏是经典记忆游戏！重复显示的颜色和声音序列。序列每回合增加！',
    howToPlay: '观看亮起的颜色序列。按相同顺序点击按钮。每个新回合增加一个新步骤。按错顺序则游戏结束。',
    tips: [
      '在心里将颜色分组记忆',
      '使用节奏和模式帮助记忆',
      '专注于上一个颜色添加',
      '练习提高你的记忆跨度',
    ],
  },
  simonsays: {
    name: '西蒙说',
    intro: '西蒙说是经典节奏记忆游戏！跟随模式尽可能快地重复。速度逐渐增加！',
    howToPlay: '观看颜色亮起的序列。按相同顺序点击按钮。每个新序列增加一个步骤。速度随时间增加。',
    tips: [
      '保持节奏和模式',
      '专注于视觉提示',
      '不要匆忙——准确比速度更重要',
      '练习提高反应时间',
    ],
  },
  skyscrapers: {
    name: '摩天楼',
    intro: '摩天楼是3D逻辑谜题！在网格中放置不同高度的建筑，使从各方向看到的建筑数量与提示相符！',
    howToPlay: '在格子中填入1-N的数字（N为网格大小）。每个数字代表建筑高度。从任何方向观看时，可见建筑数量必须等于提示数字。更高建筑遮挡较低建筑。',
    tips: [
      '从提示数字N开始——必须能看到所有建筑',
      '从提示数字1开始——最高建筑必须在该格子',
      '使用排除法推断建筑位置',
      '考虑两个方向的约束',
    ],
  },
  slitherlink: {
    name: '数回',
    intro: '数回是画回路逻辑谜题。在点之间画线，形成单一连续回路，使数字周围的线数匹配！',
    howToPlay: '点击点之间的水平或垂直边来画线。数字表示围绕它的线数（0-3）。没有数字的格子没有约束。回路不能交叉或接触自己。',
    tips: [
      '从角上的3开始——必须画两条边',
      '从0开始——周围不能有线',
      '从角落的1开始——必须远离角落',
      '寻找连接逻辑约束',
    ],
  },
  spaceinvaders: {
    name: '太空侵略者',
    intro: '太空侵略者是经典街机射击游戏！控制飞船击落外星入侵者。躲避他们的火力！',
    howToPlay: '使用左右方向键移动，空格键射击。外星人左右移动并逐渐下降。清除所有外星人获胜。他们可以躲进碉堡。',
    tips: [
      '优先瞄准最前面的外星人',
      '注意躲避外星人的子弹',
      '利用碉堡临时躲避',
      'UFO飞过时给予额外分数',
    ],
  },
  starbattle: {
    name: '星星之战',
    intro: '星星之战是放置逻辑谜题！在网格中放置星星，使每行每列和每个区域恰好有两颗星，且没有星可以相邻！',
    howToPlay: '点击格子放置星星。每行每列必须恰好有两颗星。每个区域必须恰好有两颗星。没有两颗星可以相邻（包括对角线）。',
    tips: [
      '从小区域开始——它们约束最多',
      '记住对角线相邻也禁止',
      '使用排除法找到可能的位置',
      '交叉约束揭示必要位置',
    ],
  },
  sudokux: {
    name: '对角线数独',
    intro: '对角线数独是数独变体！除了标准数独规则外，两条主对角线也必须包含1-9的所有数字！',
    howToPlay: '填入1-9的数字。每行每列每宫必须恰好包含1-9一次。两条主对角线也必须包含1-9的所有数字。',
    tips: [
      '对角线提供额外的约束',
      '先关注对角线交叉的格子',
      '使用标准数独技巧加对角线约束',
      '对角线有助于消除候选数',
    ],
  },
  suguru: {
    name: '数独组',
    intro: '数独组是区域填充谜题！在每个区域填入数字，使相邻格子不含相同数字。区域大小决定可使用的数字！',
    howToPlay: '在格子里填入数字。每个区域必须包含该区域大小的数字（例如，4格区域需要1-4）。相邻格子（包括对角线）不能有相同数字。',
    tips: [
      '从单格区域开始',
      '寻找填满最多数字的行或列',
      '对角线相邻也适用于此谜题',
      '使用排除法缩小可能数',
    ],
  },
  tapa: {
    name: 'Tapa',
    intro: 'Tapa是涂黑逻辑谜题。涂黑格子形成连续的墙，数字表示周围墙的长度！',
    howToPlay: '涂黑格子形成单一连续墙。数字表示周围涂黑格子的连续长度（多个数字表示多段墙）。墙不能形成2×2黑色区域。某些格子必须留白。',
    tips: [
      '从数字约束最多的格子开始',
      '墙必须是单一连续区域',
      '不能形成2×2全黑区域',
      '数字格子本身从不被涂黑',
    ],
  },
  threes: {
    name: '2048变体',
    intro: '2048变体是滑动合并谜题！滑动方块合并1和2形成3，然后合并3和3等！',
    howToPlay: '滑动方块合并相邻的相同数字。1和2合并成3。然后3+3=6，6+6=12等。最高数字优先保留在角落。',
    tips: [
      '优先合并1和2配对',
      '保持最高方块在角落',
      '避免填满棋盘',
      '规划你的移动以创建合并机会',
    ],
  },
  whackamole: {
    name: '打地鼠',
    intro: '打地鼠是经典反应游戏！地鼠从洞中探出，尽可能快地击打它们！',
    howToPlay: '点击探出的地鼠得分。有些地鼠是假的——不要击打！地鼠出现时间有限。反应越快得分越高。',
    tips: [
      '保持专注扫描所有洞',
      '不要击打友好地鼠',
      '优先击打高价值地鼠',
      '保持稳定节奏而非匆忙点击',
    ],
  },
  yajilin: {
    name: 'Yajilin',
    intro: 'Yajilin是日式逻辑谜题。涂黑格子并画一条穿过所有非涂黑、非数字格子的单一连续回路！',
    howToPlay: '涂黑一些格子使没有两个黑色格子相邻。画一条穿过所有非涂黑、非数字格子的单一回路。数字表示所指方向上的黑色格子数。',
    tips: [
      '从数字格子开始——它们告诉你黑色格子位置',
      '黑色格子不能彼此正交相邻',
      '回路必须恰好访问每个白色格子一次',
      '利用数字约束推断黑色格子',
    ],
  },
}

// Get guide for a specific game with language support
export function getGameGuide(gameId: string, lang: Language = 'en'): GameGuideContent | undefined {
  if (lang === 'zh-CN') {
    return gameGuidesZhCN[gameId] || gameGuidesEn[gameId]
  }
  if (lang === 'zh-TW') {
    // Use Simplified Chinese as base for Traditional (they share the same content mostly)
    return gameGuidesZhCN[gameId] || gameGuidesEn[gameId]
  }
  // For all other languages, return English
  return gameGuidesEn[gameId]
}

// Export English guides for SEO purposes
export { gameGuidesEn }
