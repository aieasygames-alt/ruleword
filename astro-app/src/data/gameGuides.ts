// Static game guide content for SEO - rendered directly in HTML
import type { Language } from './i18n'

type GameGuideContent = {
  name: string
  intro: string
  howToPlay: string
  tips: string[]
}

// Game guides in English (used as base for SEO)
export const gameGuidesEn: Record<string, GameGuideContent> = {
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

// Get guide for a specific game
export function getGameGuide(gameId: string): GameGuideContent | undefined {
  return gameGuidesEn[gameId]
}
