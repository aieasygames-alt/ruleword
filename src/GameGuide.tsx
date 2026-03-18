import { useState } from 'react'

type GameType = 'wordle' | 'mastermind' | 'crosswordle' | 'sudoku' | 'minesweeper' | 'game2048' | 'snake' | 'memory' | 'tetris' | 'tictactoe' | 'connectfour' | 'whackamole' | 'simonsays' | 'fifteenpuzzle' | 'lightsout' | 'brickbreaker' | 'bullpen'

type GameGuideProps = {
  language: 'en' | 'zh'
  darkMode: boolean
  onClose: () => void
  initialGame?: GameType
}

export default function GameGuide({ language, darkMode, onClose, initialGame = 'wordle' }: GameGuideProps) {
  const [activeGame, setActiveGame] = useState<GameType>(initialGame)

  const bgClass = darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200'
  const subTextClass = darkMode ? 'text-gray-300' : 'text-gray-600'
  const subSubTextClass = darkMode ? 'text-gray-400' : 'text-gray-500'

  const translations = {
    en: {
      title: 'Game Guide',
      close: 'Close',
      games: {
        wordle: {
          name: 'Word Guess',
          intro: 'Word Guess is the free word puzzle game you\'ve been waiting for—especially if you enjoy Wordle and classic word guessing games. Guess the hidden word (5 letters in English, 4 characters for Chinese idioms) within 6 tries using color clues!',
          intro2: 'If you\'re looking for more challenges, you can do daily puzzles and practice endlessly right here for free! The game supports both English and Chinese, making it perfect for language learners and word game enthusiasts alike.',
          note: 'Wordle is a registered trademark of the New York Times and is not affiliated with RuleWord in any way.',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'To understand how to win the game, we first need to define what you see on the screen. It\'s a word-based puzzle where you have 6 attempts to guess the correct word. Unlike traditional crosswords, you don\'t fill in blanks based on hints—the colors of the letters will guide you instead!',
          greenTitle: 'Green letters',
          greenDesc: 'are in the exact right position. They act as your anchor points—don\'t change them in future guesses!',
          yellowTitle: 'Yellow letters',
          yellowDesc: 'are in the word but in the wrong position. You\'ll need to shift them to different spots in your next guess.',
          grayTitle: 'Gray letters',
          grayDesc: 'are not in the word at all. Avoid using these letters in future guesses.',
          submit: 'Each guess must be a valid word from our dictionary. The game won\'t accept random letter combinations, so think carefully before submitting!',
          controls: 'To make a guess, type letters using your keyboard (or tap the on-screen keyboard on mobile). Press ENTER to submit your guess. The letters will light up with colors, giving you clues for your next attempt. You win when all letters turn green before running out of tries!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily Mode',
          dailyDesc: 'offers one puzzle per day that everyone plays. Compete with friends and compare results! The daily word resets at midnight, and if you lose, you\'ll have to wait until tomorrow for a new challenge.',
          practiceMode: 'Practice Mode',
          practiceDesc: 'lets you play unlimited puzzles to hone your skills. Perfect for learning the game mechanics without pressure. While you can\'t retry the exact same puzzle, you can start a new game immediately after finishing!',
          stats: 'Both modes track your statistics: games played, win rate, current streak, and maximum streak. Share your results with friends and start a daily competition!',
          whyEntertaining: 'What Makes the Game So Entertaining?',
          whyDesc: 'It combines the vocabulary challenge of classic word games with the deductive reasoning of logic puzzles. Each guess narrows down the possibilities, creating a satisfying puzzle-solving experience.',
          whyDesc2: 'For language learners, the Chinese idiom mode offers a unique way to practice and discover new idioms (成语). The color-coded feedback helps reinforce correct characters and their positions.',
          tips: 'Gameplay Tips',
          tip1Title: 'Start with Common Letters',
          tip1Desc: 'Begin with words containing common letters (in English: E, A, R, I, O, T, N, S, L, C). This helps you quickly identify which letters are in the word.',
          tip2Title: 'Learn from Gray Letters',
          tip2Desc: 'Gray letters are just as valuable as green ones! Eliminating letters narrows down possibilities significantly.',
          tip3Title: 'Think About Letter Patterns',
          tip3Desc: 'Consider common letter combinations and patterns. In English, consonant blends like "TH", "CH", "SH" are common. In Chinese idioms, certain characters frequently appear together.',
          tip4Title: 'Don\'t Waste Guesses',
          tip4Desc: 'Every guess counts! Avoid random guessing—use the information from previous guesses to make educated attempts.',
        },
        mastermind: {
          name: 'Mastermind',
          intro: 'Mastermind is the classic code-breaking puzzle game that tests your logical deduction skills! Crack the secret 4-color code within 8 attempts using strategic thinking and color feedback.',
          intro2: 'If you enjoy logic puzzles and pattern recognition, this game is perfect for you. Practice endlessly and challenge yourself to solve codes in fewer attempts!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Your goal is to guess the secret 4-color code. The code is made up of 6 possible colors. Colors can repeat in the code!',
          colors: 'Available Colors: Red, Orange, Yellow, Green, Blue, Purple',
          greenTitle: 'Green indicators',
          greenDesc: 'show that a color is in the correct position—you\'re on the right track!',
          whiteTitle: 'White indicators',
          whiteDesc: 'show that a color exists in the code but is in the wrong position. You need to move it somewhere else.',
          redTitle: 'Red indicators',
          redDesc: 'show that a color is not in the code at all. Eliminate it from future guesses.',
          controls: 'To play, select 4 colors by tapping the color buttons at the bottom (or use keys 1-6 on your keyboard). Press Submit to check your guess. The feedback appears below each color, showing how close you are!',
          gameModes: 'Game Modes',
          practiceMode: 'Practice Mode',
          practiceDesc: 'offers unlimited puzzles. Each game generates a random code, so no two games are alike. Perfect for learning the deduction strategies! Track your performance with statistics showing games played, attempts used, and success rate.',
          whyEntertaining: 'What Makes the Game So Entertaining?',
          whyDesc: 'Mastermind combines pattern recognition with logical deduction. Each guess provides valuable feedback that narrows down the possibilities. It\'s a battle of wits between you and the code!',
          whyDesc2: 'The satisfaction of cracking a difficult code with minimal guesses is unmatched. As you play more, you\'ll develop strategies and become more efficient at eliminating possibilities.',
          tips: 'Gameplay Tips',
          tip1Title: 'Start with All Different Colors',
          tip1Desc: 'Your first guess should use 4 different colors to maximize information gathering. This helps identify which colors are in the code.',
          tip2Title: 'Use the Process of Elimination',
          tip2Desc: 'Pay attention to which colors are completely absent (red feedback). Eliminating colors is just as valuable as finding correct ones.',
          tip3Title: 'Think About Positions',
          tip3Desc: 'When you get white indicators, you know a color is in the code but wrong position. Try moving it systematically to find its correct spot.',
          tip4Title: 'Colors Can Repeat',
          tip4Desc: 'Don\'t forget that the secret code can have duplicate colors! If you see unexpected feedback, consider that the same color might appear multiple times.',
          tip5Title: 'Aim for Efficiency',
          tip5Desc: 'The best players solve codes in 4-5 guesses. Challenge yourself to improve your average!',
        },
        crosswordle: {
          name: 'Crosswordle',
          intro: 'Crosswordle is the free puzzle game you\'ve been waiting for—especially if you enjoy Wordle and classic crossword puzzles. Strategically swap letters to unlock each word without running out of moves.',
          intro2: 'If you\'re looking for more games and a boatload of puzzles, you can do daily challenges and practice endlessly right here for free!',
          note: 'Wordle is a registered trademark of the New York Times and is not affiliated with Crosswordle in any way.',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'To understand how to win the game, we have to first define the things you can see on the screen. It is a letter-based puzzle with multiple letterboxes or tiles intersecting with each other. However, unlike most online crossword puzzles and games, you don\'t have to enter characters or fill in the letterboxes with answers based on hints—the colors of the letters will provide the information you need and guide you instead!',
          greenTitle: 'Green letters',
          greenDesc: 'are in the exactly right position and don\'t need to be swapped or moved. They act as your primary clue for each word.',
          yellowTitle: 'Yellow letters',
          yellowDesc: 'are in the right horizontal or vertical word, but not in the right position to get the correct word. You\'ll have to shift them around until they change into green letters.',
          grayTitle: 'Gray letters',
          grayDesc: 'are in the wrong place, so you\'ll have to swap them into the right horizontal or vertical words to make them green.',
          goal: 'All in all, you need to get the right answers by swapping around the letters to make all of them turn green! However, you can\'t brute force the puzzle, as you only have a limited amount of letter swaps available. So you\'ll have to deduce the right word by looking at the green letters and swapping what letters you think are right.',
          controls: 'To swap a letter, you have to click or tap on the letter you want to move, then click on the letter you want to switch places with. The letter you\'re going to swap will become highlighted once you select it, and you can let go or deselect it by clicking it again. You\'ll automatically win if you get all the words correct before your swap stock runs out.',
          gameModes: 'Game Modes',
          modesIntro: 'Currently, there are three game modes available:',
          dailyMode: 'Daily',
          dailyDesc: 'puzzles can only be played once and get replaced by a new set each day. Keep in mind that if you lose on a Daily Mode game, you cannot redo it again and will have to wait for the new one the next day. Daily mode uses a 3×3 grid.',
          unlimitedMode: 'Unlimited',
          unlimitedDesc: 'Mode offers endless puzzles with larger grids (7×7 or 9×9). Perfect for players who want more challenging and complex word intersections!',
          practiceMode: 'Practice',
          practiceDesc: 'Mode lets you play with any grid size and can be done endlessly. They are meant to train your guessing skills and understand the mechanics of the game. While you can\'t retry the same set you failed in this mode, you can get a new game done right after it!',
          gridSizes: 'Grid Sizes',
          grid3x3: '3×3 Grid: Perfect for quick puzzles! 15 swaps available.',
          grid7x7: '7×7 Grid: More words to discover! 40 swaps available.',
          grid9x9: '9×9 Grid: The ultimate challenge! 60 swaps available.',
          stars: 'All game modes award you with stars based on the number of swaps you had left after completing the set: ⭐⭐⭐ (10+ remaining), ⭐⭐ (5-9 remaining), ⭐ (0-4 remaining).',
          whyEntertaining: 'What Makes the Game So Entertaining?',
          whyDesc: 'It is the perfect combination of the calculating challenge of your classic crossword and the modern fun of Wordle—a delightful daily logic word puzzle game. Crosswords rely more on word knowledge while Wordle is based more on guessing—both are brought together splendidly here!',
          whyDesc2: 'The Undo feature lets you experiment and learn from your mistakes. Made a wrong swap? Just undo it and try a different approach!',
          tips: 'Gameplay Tips',
          tip1Title: 'Start with Crossings',
          tip1Desc: 'Look for letters that appear in both horizontal and vertical words. These intersections are key to solving the puzzle efficiently.',
          tip2Title: 'Mind Your Swap Count',
          tip2Desc: 'This is one of the most important things to remember! After each swap, check your remaining swaps. The fewer swaps you use, the higher your star rating will be!',
          tip3Title: 'Use the Undo Button',
          tip3Desc: 'Don\'t be afraid to experiment! If a swap doesn\'t work out, use the undo button to try a different approach. Learning from trial and error is part of the fun.',
          tip4Title: 'Look for Word Patterns',
          tip4Desc: 'As you reveal green letters, try to identify common word patterns. If you see "_AT" with a green A and T, think of words like CAT, HAT, BAT, etc.',
          tip5Title: 'Practice Makes Perfect',
          tip5Desc: 'First-time players shouldn\'t go immediately into Daily Mode until they learn how the system and swapping mechanics work. Try Practice Mode first to understand the game without pressure!',
        },
        sudoku: {
          name: 'Sudoku',
          intro: 'Sudoku is the classic number logic puzzle that has captivated millions worldwide! Fill a 9×9 grid with digits 1-9 so that each row, column, and 3×3 box contains all digits without repetition.',
          intro2: 'If you enjoy logical deduction and brain training, this game is perfect for you. With multiple difficulty levels and daily challenges, there\'s always a new puzzle to solve!',
          note: 'Sudoku is a logic-based number placement puzzle. The objective is to fill the grid so each row, column, and 3×3 sub-grid contains all digits from 1 to 9.',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'The puzzle consists of a 9×9 grid divided into nine 3×3 boxes. Some cells already contain numbers (these are fixed and cannot be changed). Your goal is to fill in the empty cells with the correct numbers.',
          rule1Title: 'Rule 1: Rows',
          rule1Desc: 'Each row must contain the digits 1-9, with no repetition.',
          rule2Title: 'Rule 2: Columns',
          rule2Desc: 'Each column must contain the digits 1-9, with no repetition.',
          rule3Title: 'Rule 3: 3×3 Boxes',
          rule3Desc: 'Each of the nine 3×3 sub-grids must contain the digits 1-9, with no repetition.',
          controls: 'Select an empty cell by clicking on it, then enter a number (1-9) using the number pad or keyboard. If you make a mistake, you can clear the cell or enter a different number. Use the Notes feature to mark possible candidates!',
          features: 'Special Features',
          hintTitle: 'Hints',
          hintDesc: 'Stuck? Use the Hint button to reveal the correct number for a random empty cell. You get 3 hints per game, so use them wisely!',
          notesTitle: 'Notes Mode',
          notesDesc: 'Toggle Notes mode to mark multiple candidate numbers in a cell. This helps you track possibilities while solving. Click the Notes button to switch between number and notes input.',
          errorHighlight: 'Error Highlighting',
          errorHighlightDesc: 'If you enter a wrong number, it will be highlighted in red. This helps you identify mistakes quickly.',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'One puzzle per day per difficulty level. Compete with players worldwide! Your progress is saved automatically.',
          unlimitedMode: 'Unlimited',
          unlimitedDesc: 'Endless random puzzles! Perfect for practice and improving your skills.',
          practiceMode: 'Practice',
          practiceDesc: 'Choose any difficulty and play as many puzzles as you want. Great for learning!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: 35 cells removed. Great for beginners!',
          mediumDesc: 'Medium: 45 cells removed. A balanced challenge.',
          hardDesc: 'Hard: 52 cells removed. For experienced players.',
          expertDesc: 'Expert: 58 cells removed. The ultimate test!',
          stats: 'Statistics',
          statsDesc: 'Track your progress: games played, games won, and best time for each difficulty level.',
          tips: 'Gameplay Tips',
          tip1Title: 'Start with Singles',
          tip1Desc: 'Look for cells where only one number can fit. Scan rows, columns, and boxes to find these "naked singles".',
          tip2Title: 'Use Notes Wisely',
          tip2Desc: 'Mark candidate numbers in empty cells. This helps you spot patterns and eliminate possibilities.',
          tip3Title: 'Process of Elimination',
          tip3Desc: 'If a number can\'t go anywhere else in a row/column/box, it must go in the remaining cell.',
          tip4Title: 'Look for Hidden Singles',
          tip4Desc: 'Sometimes a number can only go in one cell within a row, column, or box, even if that cell has multiple candidates.',
          tip5Title: 'Take Your Time',
          tip5Desc: 'Sudoku is about logic, not speed. Think through each move carefully and enjoy the process!',
          whyEntertaining: 'Why is Sudoku So Entertaining?',
          whyDesc: 'Sudoku combines logical deduction with the satisfaction of puzzle-solving. Each number you place brings you closer to the solution, creating a rewarding experience.',
          whyDesc2: 'The game offers endless variety—no two puzzles are the same. Whether you have 5 minutes or an hour, Sudoku provides the perfect mental workout!',
        },
        minesweeper: {
          name: 'Minesweeper',
          intro: 'Minesweeper is the classic puzzle game that tests your logic and deduction skills! Clear the minefield without detonating any mines by using number clues.',
          intro2: 'If you enjoy strategic thinking and pattern recognition, this game is perfect for you. With three difficulty levels, challenge yourself to clear mines faster!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Your goal is to reveal all cells that don\'t contain mines. Use the numbers on revealed cells to determine which adjacent cells contain mines.',
          rule1Title: 'Numbers',
          rule1Desc: 'A number indicates how many mines are in the 8 adjacent cells (horizontally, vertically, and diagonally).',
          rule2Title: 'Left Click',
          rule2Desc: 'Click to reveal a cell. If it\'s a mine, game over!',
          rule3Title: 'Right Click',
          rule3Desc: 'Right-click (or long-press on mobile) to place a flag on cells you suspect contain mines.',
          controls: 'Left-click to reveal cells. Right-click (or long-press) to flag suspected mines. Clear all non-mine cells to win!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'One puzzle per day per difficulty level. Everyone plays the same puzzle—compete for the fastest time!',
          practiceMode: 'Practice',
          practiceDesc: 'Play unlimited random puzzles at any difficulty. Perfect for improving your skills!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: 9×9 grid with 10 mines. Great for learning!',
          mediumDesc: 'Medium: 16×16 grid with 40 mines. A balanced challenge.',
          hardDesc: 'Hard: 16×30 grid with 99 mines. For expert players!',
          tips: 'Gameplay Tips',
          tip1Title: 'Start with Corners',
          tip1Desc: 'Your first click is always safe. Start in a corner or open area to reveal more cells.',
          tip2Title: 'Use Number Logic',
          tip2Desc: 'If a "1" only has one unrevealed neighbor, that cell is definitely a mine!',
          tip3Title: 'Flag Strategically',
          tip3Desc: 'Don\'t over-flag. Only mark cells you\'re certain about to avoid confusion.',
          tip4Title: 'Learn Patterns',
          tip4Desc: 'Recognize common patterns like "1-2-1" on edges to quickly identify mine locations.',
          whyEntertaining: 'Why is Minesweeper So Entertaining?',
          whyDesc: 'Minesweeper combines pure logic with risk assessment. Every click is a calculated decision, and the satisfaction of clearing a difficult section is unmatched.',
          whyDesc2: 'The game improves your pattern recognition and logical thinking. As you play more, you\'ll develop intuition for mine placement!',
        },
        game2048: {
          name: '2048',
          intro: '2048 is the addictive puzzle game that took the world by storm! Slide numbered tiles to combine them, aiming to create the elusive 2048 tile.',
          intro2: 'If you enjoy number puzzles and strategic thinking, this game is perfect for you. Easy to learn, hard to master!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'The game is played on a 4×4 grid. Tiles with the same number merge into one when they touch. Your goal is to create a tile with the number 2048!',
          rule1Title: 'Sliding',
          rule1Desc: 'Use arrow keys (or swipe on mobile) to slide all tiles in that direction.',
          rule2Title: 'Merging',
          rule2Desc: 'When two tiles with the same number touch, they merge into one tile with double the value!',
          rule3Title: 'New Tiles',
          rule3Desc: 'After each move, a new tile (2 or 4) appears in a random empty spot.',
          controls: 'Use arrow keys or WASD to move tiles. On mobile, swipe in the direction you want to slide. Plan your moves carefully!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'A fixed puzzle each day. Everyone gets the same starting position—see who can reach the highest score!',
          practiceMode: 'Practice',
          practiceDesc: 'Random puzzles with endless gameplay. Try to beat your high score!',
          tips: 'Gameplay Tips',
          tip1Title: 'Keep High Tiles in Corner',
          tip1Desc: 'Pick a corner and keep your highest tile there. This strategy helps maintain organization.',
          tip2Title: 'Build Chains',
          tip2Desc: 'Try to create chains of increasing numbers. This makes merging more efficient.',
          tip3Title: 'Plan Ahead',
          tip3Desc: 'Think about where new tiles will appear. Don\'t box yourself into a corner!',
          tip4Title: 'Don\'t Chase 2048',
          tip4Desc: 'Focus on building a strong board first. 2048 will come naturally with good strategy.',
          whyEntertaining: 'Why is 2048 So Entertaining?',
          whyDesc: '2048 combines simple mechanics with deep strategy. Each move has consequences, and planning several moves ahead is key to success.',
          whyDesc2: 'The satisfaction of watching tiles merge and numbers grow is incredibly rewarding. It\'s a perfect blend of luck and skill!',
        },
        snake: {
          name: 'Snake',
          intro: 'Snake is the classic arcade game that has entertained generations! Guide the snake to eat food and grow longer, but don\'t hit the walls or yourself!',
          intro2: 'If you enjoy fast-paced action and quick reflex challenges, this game is perfect for you. Simple controls, endless fun!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Control a snake that moves continuously. Eat food to grow longer and score points. The game ends if you hit a wall or your own body.',
          rule1Title: 'Movement',
          rule1Desc: 'Use arrow keys, WASD, or swipe to change direction. The snake can\'t reverse direction instantly.',
          rule2Title: 'Eating',
          rule2Desc: 'When the snake eats food (red dot), it grows longer and you earn 10 points.',
          rule3Title: 'Speed',
          rule3Desc: 'The snake speeds up as your score increases, making the game progressively harder!',
          controls: 'Use arrow keys or WASD to control direction. On mobile, swipe in the direction you want to go. Press Space or tap to pause.',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Compete for the highest score each day! The leaderboard resets at midnight.',
          practiceMode: 'Practice',
          practiceDesc: 'Play unlimited games to improve your skills. Try to beat your personal high score!',
          tips: 'Gameplay Tips',
          tip1Title: 'Plan Your Route',
          tip1Desc: 'Don\'t just chase food—plan a path that keeps your options open.',
          tip2Title: 'Use the Edges',
          tip2Desc: 'Moving along the edges gives you more space to maneuver when you grow longer.',
          tip3Title: 'Avoid Trapping Yourself',
          tip3Desc: 'Be careful not to circle around and trap yourself. Always leave an escape route!',
          tip4Title: 'Stay Calm at High Speeds',
          tip4Desc: 'As the game speeds up, stay calm and make deliberate moves. Panic leads to mistakes!',
          whyEntertaining: 'Why is Snake So Entertaining?',
          whyDesc: 'Snake tests your reflexes, spatial awareness, and quick thinking. The increasing difficulty keeps you on your toes!',
          whyDesc2: 'There\'s something satisfying about watching your snake grow longer. It\'s a perfect blend of simplicity and challenge!',
        },
        memory: {
          name: 'Memory',
          intro: 'Memory is the classic card-matching game that exercises your brain! Find matching pairs of cards by flipping them over two at a time.',
          intro2: 'If you enjoy memory challenges and concentration games, this is perfect for you. Great for all ages!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Cards are laid face down. Flip two cards at a time to find matching pairs. Clear all pairs to win!',
          rule1Title: 'Flipping',
          rule1Desc: 'Click to flip a card. You can only see two cards at a time.',
          rule2Title: 'Matching',
          rule2Desc: 'If the two flipped cards match, they stay face up. If not, they flip back after a second.',
          rule3Title: 'Winning',
          rule3Desc: 'Find all matching pairs to complete the game. Fewer moves means a better score!',
          controls: 'Click or tap cards to flip them. Try to remember the positions of cards you\'ve seen!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'A fixed set of cards each day. Compete for the fewest moves to complete the puzzle!',
          practiceMode: 'Practice',
          practiceDesc: 'Random card layouts. Play as many times as you want to improve your memory!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: 6 pairs (12 cards). Great for beginners!',
          mediumDesc: 'Medium: 8 pairs (16 cards). A balanced challenge.',
          hardDesc: 'Hard: 10 pairs (20 cards). Test your memory limits!',
          tips: 'Gameplay Tips',
          tip1Title: 'Create Mental Groups',
          tip1Desc: 'Divide the board into sections and focus on remembering cards in each area.',
          tip2Title: 'Use Memory Techniques',
          tip2Desc: 'Associate cards with stories or images to help remember their positions.',
          tip3Title: 'Start Systematically',
          tip3Desc: 'Work from one side to the other rather than randomly clicking cards.',
          tip4Title: 'Pay Attention to Pairs',
          tip4Desc: 'When you see a card, try to recall if you\'ve seen its match elsewhere.',
          whyEntertaining: 'Why is Memory So Entertaining?',
          whyDesc: 'Memory exercises your brain while being fun! It improves concentration and recall abilities.',
          whyDesc2: 'The satisfaction of finding a match and completing the puzzle with fewer moves is incredibly rewarding. It\'s a great mental workout!',
        },
        tetris: {
          name: 'Tetris',
          intro: 'Tetris is the legendary puzzle game that has captivated players for decades! Rotate and arrange falling blocks to create complete lines.',
          intro2: 'If you enjoy fast-paced puzzle action and spatial reasoning, this classic is perfect for you!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Blocks of different shapes (tetrominoes) fall from the top. Rotate and move them to create complete horizontal lines.',
          rule1Title: 'Controls',
          rule1Desc: 'Use arrow keys to move left/right, up to rotate, down to drop faster. On mobile, tap left/right/rotate buttons.',
          rule2Title: 'Clear Lines',
          rule2Desc: 'When a horizontal line is completely filled, it disappears and you earn points.',
          rule3Title: 'Game Over',
          rule3Desc: 'If blocks stack up to the top, the game ends!',
          controls: 'Arrow keys or on-screen buttons to move and rotate. Space bar for hard drop. Clear lines to survive!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Compete for the highest score with the same piece sequence each day!',
          practiceMode: 'Practice',
          practiceDesc: 'Play unlimited games to improve your skills and beat your high score!',
          tips: 'Gameplay Tips',
          tip1Title: 'Leave Gaps Open',
          tip1Desc: 'Keep the well (single-column gap) open for I-pieces to clear 4 lines at once.',
          tip2Title: 'Think Ahead',
          tip2Desc: 'Don\'t just focus on the current piece—plan where the next one will go.',
          tip3Title: 'Stay Flat',
          tip3Desc: 'Try to keep your stack as flat as possible to give yourself more options.',
          tip4Title: 'Clear from Bottom',
          tip4Desc: 'Work from the bottom up. Creating holes under filled areas is hard to fix!',
          whyEntertaining: 'Why is Tetris So Entertaining?',
          whyDesc: 'Tetris combines simple controls with deep strategy. The satisfaction of clearing lines, especially a Tetris (4 lines), is unmatched!',
          whyDesc2: 'The game improves spatial awareness and decision-making under pressure. It\'s easy to learn but takes years to master!',
        },
        tictactoe: {
          name: 'Tic-Tac-Toe',
          intro: 'Tic-Tac-Toe is the classic paper-and-pencil game loved by all ages! Take turns placing X and O to get three in a row.',
          intro2: 'Simple to learn, yet strategic enough to be engaging. Play against a friend or the AI!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Two players take turns marking spaces in a 3×3 grid. The first to get 3 marks in a row (horizontal, vertical, or diagonal) wins!',
          rule1Title: 'Taking Turns',
          rule1Desc: 'Players alternate placing their mark (X or O) on any empty square.',
          rule2Title: 'Winning',
          rule2Desc: 'Get 3 of your marks in a row horizontally, vertically, or diagonally to win.',
          rule3Title: 'Draw',
          rule3Desc: 'If all 9 squares are filled with no winner, the game is a draw.',
          controls: 'Tap or click any empty square to place your mark. First player is X, second is O.',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Play against the AI with a fixed opening move each day.',
          practiceMode: 'Practice',
          practiceDesc: 'Play unlimited games against the AI or with a friend!',
          tips: 'Gameplay Tips',
          tip1Title: 'Take the Center',
          tip1Desc: 'The center square is the most strategic position—it\'s part of 4 winning lines!',
          tip2Title: 'Block Your Opponent',
          tip2Desc: 'Always check if your opponent has 2 in a row and block them!',
          tip3Title: 'Create Forks',
          tip3Desc: 'Try to create two winning threats at once. Your opponent can only block one!',
          tip4Title: 'Corner First',
          tip4Desc: 'If you go first, taking a corner gives you the best chance to win or draw.',
          whyEntertaining: 'Why is Tic-Tac-Toe So Entertaining?',
          whyDesc: 'Tic-Tac-Toe is the perfect blend of simplicity and strategy. Every move matters, and a single mistake can cost you the game!',
          whyDesc2: 'Great for quick breaks or teaching kids basic strategy. The game ends in minutes, making it easy to play again!',
        },
        connectfour: {
          name: 'Connect Four',
          intro: 'Connect Four is the classic two-player strategy game! Drop colored discs to connect four in a row before your opponent.',
          intro2: 'Simple rules, deep strategy. Perfect for players who enjoy tactical thinking!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Players take turns dropping discs into a vertical grid. Discs fall to the lowest available position in each column.',
          rule1Title: 'Dropping Discs',
          rule1Desc: 'Click a column to drop your disc. It falls to the lowest empty spot.',
          rule2Title: 'Winning',
          rule2Desc: 'Connect 4 discs of your color horizontally, vertically, or diagonally to win!',
          rule3Title: 'Full Board',
          rule3Desc: 'If the board fills up with no winner, the game is a draw.',
          controls: 'Click or tap any column to drop your disc. On keyboard, use 1-7 keys to select columns.',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Challenge the AI with a daily starting position. Same puzzle for everyone!',
          practiceMode: 'Practice',
          practiceDesc: 'Play unlimited games against AI or a friend to improve your skills!',
          tips: 'Gameplay Tips',
          tip1Title: 'Control the Center',
          tip1Desc: 'The center column is most valuable—more winning combinations pass through it!',
          tip2Title: 'Block Threats',
          tip2Desc: 'Always check if your opponent has 3 in a row and block immediately!',
          tip3Title: 'Create Double Threats',
          tip3Desc: 'Set up two winning moves at once. Your opponent can only block one!',
          tip4Title: 'Think Bottom-Up',
          tip4Desc: 'Remember that discs stack. Plan moves that create opportunities on higher rows!',
          whyEntertaining: 'Why is Connect Four So Entertaining?',
          whyDesc: 'Connect Four combines visual pattern recognition with forward planning. Each move shapes future possibilities!',
          whyDesc2: 'The vertical board adds a unique dimension to the classic "line up 4" concept. Quick games with deep strategy!',
        },
        whackamole: {
          name: 'Whack-a-Mole',
          intro: 'Whack-a-Mole is the classic reflex game! Hit moles as they pop up from their holes before they hide again.',
          intro2: 'Test your reaction speed and hand-eye coordination. Great for quick, exciting gameplay!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Moles pop up randomly from holes. Tap them quickly to score points before they disappear!',
          rule1Title: 'Normal Moles',
          rule1Desc: 'Hamster moles give you 10 points. Whack them before they hide!',
          rule2Title: 'Golden Moles',
          rule2Desc: 'Golden moles are rare and worth 50 points. Don\'t miss them!',
          rule3Title: 'Bombs',
          rule3Desc: 'Avoid hitting bombs! They cost 30 points and 3 seconds of time.',
          controls: 'Tap or click moles as they appear. Be quick—time is limited!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Everyone gets the same mole sequence. Compete for the highest daily score!',
          practiceMode: 'Practice',
          practiceDesc: 'Unlimited gameplay with random moles. Beat your personal best!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: Moles appear slowly. Great for warming up!',
          mediumDesc: 'Medium: Balanced speed and scoring.',
          hardDesc: 'Hard: Fast moles! Test your limits!',
          tips: 'Gameplay Tips',
          tip1Title: 'Build Combos',
          tip1Desc: 'Hit moles quickly in succession for combo multipliers up to 5x!',
          tip2Title: 'Watch for Gold',
          tip2Desc: 'Golden moles appear rarely—prioritize them for big points!',
          tip3Title: 'Avoid Bombs',
          tip3Desc: 'It\'s better to miss a mole than hit a bomb. Bombs hurt your score AND time!',
          tip4Title: 'Stay Focused',
          tip4Desc: 'Keep your eyes moving across all holes. Anticipate where moles might appear!',
          whyEntertaining: 'Why is Whack-a-Mole So Entertaining?',
          whyDesc: 'Whack-a-Mole tests pure reflexes and hand-eye coordination. The fast-paced action keeps you on your toes!',
          whyDesc2: 'There\'s something deeply satisfying about nailing a perfect combo streak. Great for quick gaming sessions!',
        },
        simonsays: {
          name: 'Simon Says',
          intro: 'Simon Says is the classic memory game! Watch the color sequence and repeat it exactly. How long can you remember?',
          intro2: 'Train your brain and improve your memory with this timeless challenge!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Watch as Simon plays a sequence of colors. Then repeat the sequence by clicking the colors in the same order!',
          rule1Title: 'Watch',
          rule1Desc: 'Pay attention to the color sequence Simon shows you.',
          rule2Title: 'Repeat',
          rule2Desc: 'Click the colors in the exact same order to advance.',
          rule3Title: 'Growing Sequence',
          rule3Desc: 'Each round adds one more color to the sequence. How far can you go?',
          controls: 'Click or tap the colored buttons to repeat the sequence. On keyboard, use R/G/B/Y keys.',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Everyone gets the same starting sequence. Compete for the longest streak!',
          practiceMode: 'Practice',
          practiceDesc: 'Random sequences each game. Practice to improve your memory!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: Slow playback speed. Great for learning!',
          mediumDesc: 'Medium: Normal speed gameplay.',
          hardDesc: 'Hard: Fast playback! Ultimate memory test!',
          tips: 'Gameplay Tips',
          tip1Title: 'Use Patterns',
          tip1Desc: 'Break the sequence into chunks. Remember "R-G-B" as one unit.',
          tip2Title: 'Say It Out Loud',
          tip2Desc: 'Verbally repeating colors helps reinforce memory.',
          tip3Title: 'Create Stories',
          tip3Desc: 'Link colors to a story: "Red apple, Blue sky, Green grass"...',
          tip4Title: 'Stay Calm',
          tip4Desc: 'Don\'t rush when repeating. Take a moment to recall before clicking!',
          whyEntertaining: 'Why is Simon Says So Entertaining?',
          whyDesc: 'Simon Says is pure memory training. Watching your sequence grow longer is incredibly satisfying!',
          whyDesc2: 'The game reveals the limits of your short-term memory and helps improve it over time!',
        },
        fifteenpuzzle: {
          name: '15 Puzzle',
          intro: '15 Puzzle is the classic sliding tile puzzle! Arrange the numbered tiles in order by sliding them into the empty space.',
          intro2: 'A timeless brain teaser that has challenged puzzle lovers for over a century!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'The puzzle has 15 numbered tiles and one empty space. Slide tiles into the empty space to arrange them in order 1-15.',
          rule1Title: 'Sliding',
          rule1Desc: 'Click or tap a tile adjacent to the empty space to slide it.',
          rule2Title: 'Goal',
          rule2Desc: 'Arrange tiles so numbers 1-15 appear in order, left to right, top to bottom.',
          rule3Title: 'Winning',
          rule3Desc: 'Complete the puzzle with as few moves as possible for a higher score!',
          controls: 'Click/tap tiles next to the empty space to slide them. Arrow keys also work!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Everyone gets the same scrambled puzzle each day. Compete for fewest moves!',
          practiceMode: 'Practice',
          practiceDesc: 'Random puzzles with varying difficulty. Improve your solving skills!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: 10-15 moves from solution.',
          mediumDesc: 'Medium: 30-40 moves from solution.',
          hardDesc: 'Hard: 50+ moves. Real challenge!',
          tips: 'Gameplay Tips',
          tip1Title: 'Solve Top Row First',
          tip1Desc: 'Get tiles 1-4 in place first, then work on row 2.',
          tip2Title: 'Work in Sections',
          tip2Desc: 'Don\'t try to solve randomly. Complete the puzzle section by section.',
          tip3Title: 'Use the Empty Space',
          tip3Desc: 'Move the empty space strategically to position tiles where you need them.',
          tip4Title: 'Don\'t Undo Progress',
          tip4Desc: 'Be careful not to scramble already-solved sections while working on others!',
          whyEntertaining: 'Why is 15 Puzzle So Entertaining?',
          whyDesc: 'The 15 Puzzle offers a perfect blend of logic and planning. Each move affects future possibilities!',
          whyDesc2: 'Solving the puzzle efficiently requires thinking several moves ahead. The satisfaction of seeing tiles click into place is unmatched!',
        },
        lightsout: {
          name: 'Lights Out',
          intro: 'Lights Out is the deceptively simple puzzle game! Turn off all the lights by toggling them—but each click affects adjacent lights too.',
          intro2: 'A logic puzzle that starts easy but quickly becomes brain-bending!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Click any light to toggle it on or off. The catch: clicking a light also toggles its 4 neighbors (up, down, left, right)!',
          rule1Title: 'Toggling',
          rule1Desc: 'Click a cell to toggle it and its adjacent cells. Plan carefully!',
          rule2Title: 'Goal',
          rule2Desc: 'Turn ALL lights OFF to complete the puzzle.',
          rule3Title: 'Strategy',
          rule3Desc: 'Some puzzles require thinking many moves ahead. Trial and error won\'t always work!',
          controls: 'Click or tap any light to toggle it and its neighbors. Think before you click!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'One new puzzle each day. Everyone solves the same challenge!',
          practiceMode: 'Practice',
          practiceDesc: 'Unlimited random puzzles. Master the strategy!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: 3×3 grid. Quick puzzles!',
          mediumDesc: 'Medium: 5×5 grid. Standard challenge.',
          hardDesc: 'Hard: 7×7 grid. Complex patterns!',
          tips: 'Gameplay Tips',
          tip1Title: 'Work Systematically',
          tip1Desc: 'Start from the top row and work down. Don\'t go back to completed rows!',
          tip2Title: 'Chase the Lights',
          tip2Desc: 'Use the "chasing" technique: toggle below each lit cell in the row above.',
          tip3Title: 'Plan Ahead',
          tip3Desc: 'Before clicking, visualize how it will affect neighboring cells.',
          tip4Title: 'Minimum Moves',
          tip4Desc: 'Try to solve in the minimum number of moves. Efficiency matters!',
          whyEntertaining: 'Why is Lights Out So Entertaining?',
          whyDesc: 'Lights Out combines simple rules with deep logical thinking. Each puzzle is a new mental challenge!',
          whyDesc2: 'The game teaches you to think several steps ahead. Watching all lights finally turn off is deeply satisfying!',
        },
        brickbreaker: {
          name: 'Brick Breaker',
          intro: 'Brick Breaker is the classic arcade game! Use your paddle to bounce the ball and destroy all the bricks.',
          intro2: 'Simple to play, hard to put down. A timeless arcade experience!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Control the paddle at the bottom of the screen. Bounce the ball to break all the bricks above!',
          rule1Title: 'Paddle Control',
          rule1Desc: 'Move your mouse/finger to control the paddle. Keep the ball in play!',
          rule2Title: 'Breaking Bricks',
          rule2Desc: 'Hit bricks with the ball to destroy them. Each brick gives you points!',
          rule3Title: 'Lives',
          rule3Desc: 'You start with 3 lives. Lose a life when the ball falls below the paddle.',
          controls: 'Move mouse or swipe to control paddle. Arrow keys or A/D also work. Press P to pause.',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'Same brick layout for everyone. Compete for the highest daily score!',
          practiceMode: 'Practice',
          practiceDesc: 'Unlimited levels with increasing difficulty. Beat your high score!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: Slower ball, bigger paddle.',
          mediumDesc: 'Medium: Standard gameplay.',
          hardDesc: 'Hard: Faster ball, smaller paddle!',
          tips: 'Gameplay Tips',
          tip1Title: 'Aim for Angles',
          tip1Desc: 'Hit the ball with different parts of the paddle to change its angle.',
          tip2Title: 'Clear from Bottom',
          tip2Desc: 'Try to clear bricks from the bottom up to avoid trapping the ball!',
          tip3Title: 'Watch the Ball',
          tip3Desc: 'Keep your eyes on the ball, not the paddle. Anticipate where it will land!',
          tip4Title: 'Don\'t Rush',
          tip4Desc: 'There\'s no time limit. Take your time and make controlled movements!',
          whyEntertaining: 'Why is Brick Breaker So Entertaining?',
          whyDesc: 'Brick Breaker offers satisfying, rhythmic gameplay. Watching bricks disappear never gets old!',
          whyDesc2: 'The game tests your reflexes and precision. Each level cleared brings a sense of accomplishment!',
        },
        bullpen: {
          name: 'Bullpen',
          intro: 'Bullpen is a clean, logic-based puzzle game where every bull must be placed just right! It\'s like Sudoku meets Minesweeper!',
          intro2: 'Simple rules, deep strategy! Perfect for puzzle enthusiasts!',
          howToPlay: 'How to Play',
          mechanics: 'Game Mechanics',
          mechanicsIntro: 'Place bulls in the grid so that each pen, row, and column has exactly the right number of bulls!',
          rule1Title: 'Place Bulls',
          rule1Desc: 'Click an empty cell to place a bull (🐂). Click again to mark as grass (🌱). Click again to clear.',
          rule2Title: 'Pen Constraint',
          rule2Desc: 'Each colored pen region must exactly 1 bull (2 in hard mode)!',
          rule3Title: 'Row & Column',
          rule3Desc: 'Each row and column needs exactly 1 bull (2 in hard mode)!',
          rule4Title: 'No Touching',
          rule4Desc: 'Bulls cannot touch each other, not even diagonally!',
          controls: 'Click cells to place or mark, or clear. Use logic to deduce where bulls must be!',
          gameModes: 'Game Modes',
          dailyMode: 'Daily',
          dailyDesc: 'One new puzzle each day. Everyone solves the same challenge!',
          practiceMode: 'Practice',
          practiceDesc: 'Unlimited random puzzles. Master the logic!',
          difficulty: 'Difficulty Levels',
          easyDesc: 'Easy: 5×5 grid. Perfect for beginners!',
          normalDesc: 'Normal: 7×7 grid. Standard challenge.',
          hardDesc: 'Hard: 8×8 grid with 2 bulls per pen! Complex patterns!',
          tips: 'Gameplay Tips',
          tip1Title: 'Work Systematically',
          tip1Desc: 'Start from the edges and work inward. Eliminate impossibilities first!',
          tip2Title: 'Use Deduction',
          tip2Desc: 'If a row has 1 bull and all other cells are either marked or or known, the row is complete!',
          tip3Title: 'Track Constraints',
          tip3Desc: 'Keep track of which pens, rows, and columns still need bulls. Use process of elimination!',
          tip4Title: 'Think Ahead',
          tip4Desc: 'Each placement affects future moves. Plan several steps ahead!',
          whyEntertaining: 'Why is Bullpen so fun?',
          whyDesc: 'Bullpen combines simple rules with deep logical deduction. Each puzzle is a satisfying mental challenge!',
          whyDesc2: 'The game teaches systematic thinking. Watching all bulls finally find their places is incredibly rewarding!',
        },
      }
    },
    zh: {
      title: '游戏指南',
      close: '关闭',
      games: {
        wordle: {
          name: '猜词游戏',
          intro: '猜词游戏是你期待已久的免费文字益智游戏——特别是如果你喜欢 Wordle 和经典猜词游戏。在6次尝试内，通过颜色提示猜出隐藏的单词（英文5个字母，中文4字成语）！',
          intro2: '如果你想要更多挑战，可以在这里免费进行每日挑战和无限练习！游戏同时支持中英文，非常适合语言学习者和文字游戏爱好者。',
          note: 'Wordle 是纽约时报的注册商标，与 RuleWord 没有任何关联。',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '要了解如何获胜，我们首先需要定义你在屏幕上看到的内容。这是一个基于单词的谜题，你有6次机会猜测正确的单词。与传统的填字游戏不同，你不是根据提示填写空白——字母的颜色会引导你！',
          greenTitle: '绿色字母',
          greenDesc: '表示位置完全正确。它们是你的锚点——在后续猜测中不要改变它们！',
          yellowTitle: '黄色字母',
          yellowDesc: '表示字母在单词中但位置错误。你需要在下一次猜测中将它们移到不同的位置。',
          grayTitle: '灰色字母',
          grayDesc: '表示字母完全不在单词中。在后续猜测中避免使用这些字母。',
          submit: '每次猜测必须是词典中的有效单词。游戏不会接受随机的字母组合，所以在提交前请仔细思考！',
          controls: '要猜测，请使用键盘输入字母（或在手机上点击屏幕键盘）。按回车键提交猜测。字母会亮起颜色，为你的下一次尝试提供线索。当所有字母在用完尝试次数前变绿时，你就赢了！',
          gameModes: '游戏模式',
          dailyMode: '每日模式',
          dailyDesc: '每天提供一个所有人都在玩的谜题。与朋友竞争并比较结果！每日单词在午夜重置，如果你输了，就要等到明天才能获得新的挑战。',
          practiceMode: '练习模式',
          practiceDesc: '让你可以无限玩谜题来磨练技能。非常适合在没有压力的情况下学习游戏机制。虽然你不能重玩完全相同的谜题，但完成后可以立即开始新游戏！',
          stats: '两种模式都会跟踪你的统计数据：游戏次数、胜率、当前连胜和最高连胜。与朋友分享你的结果，开始每日竞争！',
          whyEntertaining: '游戏为什么这么有趣？',
          whyDesc: '它将经典文字游戏的词汇挑战与逻辑谜题的推理能力相结合。每次猜测都会缩小可能性范围，创造出令人满意的解谜体验。',
          whyDesc2: '对于语言学习者，中文成语模式提供了一种独特的方式来练习和发现新成语。颜色编码的反馈有助于强化正确的汉字及其位置。',
          tips: '游戏技巧',
          tip1Title: '从常见字母开始',
          tip1Desc: '以包含常见字母的单词开始（英文：E, A, R, I, O, T, N, S, L, C）。这有助于你快速识别哪些字母在单词中。',
          tip2Title: '从灰色字母学习',
          tip2Desc: '灰色字母和绿色字母一样有价值！排除字母可以显著缩小可能性范围。',
          tip3Title: '思考字母模式',
          tip3Desc: '考虑常见的字母组合和模式。在英文中，辅音组合如 "TH", "CH", "SH" 很常见。在中文成语中，某些汉字经常一起出现。',
          tip4Title: '不要浪费猜测',
          tip4Desc: '每次猜测都很重要！避免随机猜测——利用之前猜测的信息进行有根据的尝试。',
        },
        mastermind: {
          name: '密码破译',
          intro: '密码破译是经典的密码破解益智游戏，考验你的逻辑推理能力！在8次尝试内，通过战略思考和颜色反馈破解秘密的4色密码。',
          intro2: '如果你喜欢逻辑谜题和模式识别，这个游戏非常适合你。无限练习，挑战自己用更少的次数破解密码！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '你的目标是猜出秘密的4色密码。密码由6种可能的颜色组成。颜色可以在密码中重复！',
          colors: '可用颜色：红、橙、黄、绿、蓝、紫',
          greenTitle: '绿色指示器',
          greenDesc: '表示颜色在正确的位置——你走对方向了！',
          whiteTitle: '白色指示器',
          whiteDesc: '表示颜色存在于密码中但位置错误。你需要把它移到别的地方。',
          redTitle: '红色指示器',
          redDesc: '表示颜色完全不在密码中。在后续猜测中排除它。',
          controls: '玩法：点击底部的颜色按钮选择4个颜色（或使用键盘上的1-6键）。点击提交检查你的猜测。反馈会显示在每个颜色下方，告诉你有多接近！',
          gameModes: '游戏模式',
          practiceMode: '练习模式',
          practiceDesc: '提供无限谜题。每局游戏生成随机密码，所以没有两局是一样的。非常适合学习推理策略！跟踪你的表现，查看游戏次数、使用尝试次数和成功率。',
          whyEntertaining: '游戏为什么这么有趣？',
          whyDesc: '密码破译结合了模式识别和逻辑推理。每次猜测都提供有价值的反馈，缩小可能性范围。这是你与密码之间的智力较量！',
          whyDesc2: '用最少的猜测破解困难密码的满足感是无与伦比的。随着你玩得越多，你会发展出策略，变得更高效地排除可能性。',
          tips: '游戏技巧',
          tip1Title: '从全不同的颜色开始',
          tip1Desc: '你的第一次猜测应该使用4种不同的颜色，以最大化信息收集。这有助于识别哪些颜色在密码中。',
          tip2Title: '使用排除法',
          tip2Desc: '注意哪些颜色完全不存在（红色反馈）。排除颜色和找到正确颜色一样有价值。',
          tip3Title: '思考位置',
          tip3Desc: '当你得到白色指示器时，你知道某个颜色在密码中但位置错误。尝试系统地移动它来找到正确位置。',
          tip4Title: '颜色可以重复',
          tip4Desc: '别忘了密码可以有重复的颜色！如果你看到意外的反馈，考虑相同的颜色可能出现多次。',
          tip5Title: '追求效率',
          tip5Desc: '最好的玩家在4-5次猜测内破解密码。挑战自己提高平均水平！',
        },
        crosswordle: {
          name: 'Crosswordle',
          intro: 'Crosswordle 是你期待已久的免费益智游戏——特别是如果你喜欢 Wordle 和经典填字游戏。策略性地交换字母来解开每个单词，不要用完移动次数。',
          intro2: '如果你想要更多游戏和大量谜题，可以在这里免费进行每日挑战和无限练习！',
          note: 'Wordle 是纽约时报的注册商标，与 Crosswordle 没有任何关联。',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '要了解如何获胜，我们首先需要定义你在屏幕上看到的内容。这是一个基于字母的谜题，多个字母格子相互交叉。然而，与大多数在线填字游戏不同，你不必根据提示输入字符或填写字母——字母的颜色会提供你需要的信息并引导你！',
          greenTitle: '绿色字母',
          greenDesc: '表示位置完全正确，不需要交换或移动。它们是你每个单词的主要线索。',
          yellowTitle: '黄色字母',
          yellowDesc: '表示在正确的横向或纵向单词中，但位置不正确。你需要移动它们直到变成绿色字母。',
          grayTitle: '灰色字母',
          grayDesc: '表示位置错误，所以你需要将它们交换到正确的横向或纵向单词中使其变绿。',
          goal: '总之，你需要通过交换字母来获得正确的答案，使所有字母变成绿色！但是，你不能暴力破解谜题，因为你只有有限数量的字母交换次数。所以你必须通过观察绿色字母来推断正确的单词。',
          controls: '要交换字母，你需要点击或轻触你想要移动的字母，然后点击你想要交换位置的字母。你要交换的字母在选择后会高亮显示，你可以再次点击取消选择。如果你在交换次数用完前让所有单词正确，你就自动获胜了。',
          gameModes: '游戏模式',
          modesIntro: '目前有三种游戏模式可用：',
          dailyMode: '每日',
          dailyDesc: '谜题只能玩一次，每天会被新的一组替换。请记住，如果你在每日模式中输了，你不能重玩，必须等到第二天获得新的谜题。每日模式使用3×3网格。',
          unlimitedMode: '无限',
          unlimitedDesc: '模式提供更大的网格（7×7或9×9）的无尽谜题。非常适合想要更具挑战性和复杂单词交叉的玩家！',
          practiceMode: '练习',
          practiceDesc: '模式让你可以使用任何网格大小，可以无限进行。它们旨在训练你的猜测技能和理解游戏机制。虽然你不能重玩失败的谜题，但完成后可以立即开始新游戏！',
          gridSizes: '网格大小',
          grid3x3: '3×3网格：适合快速谜题！15次交换。',
          grid7x7: '7×7网格：更多单词等待发现！40次交换。',
          grid9x9: '9×9网格：终极挑战！60次交换。',
          stars: '所有游戏模式根据完成后剩余的交换次数奖励星星：⭐⭐⭐（剩余10+次），⭐⭐（剩余5-9次），⭐（剩余0-4次）。',
          whyEntertaining: '游戏为什么这么有趣？',
          whyDesc: '它是经典填字游戏的计算挑战和 Wordle 的现代乐趣的完美结合——一个令人愉快的每日逻辑文字益智游戏。填字游戏更依赖单词知识，而 Wordle 更基于猜测——两者在这里完美结合！',
          whyDesc2: '撤销功能让你可以实验并从错误中学习。交换错了？只需撤销并尝试不同的方法！',
          tips: '游戏技巧',
          tip1Title: '从交叉点开始',
          tip1Desc: '寻找同时出现在横向和纵向单词中的字母。这些交叉点是高效解决谜题的关键。',
          tip2Title: '注意交换次数',
          tip2Desc: '这是最重要的注意事项之一！每次交换后，检查你的剩余交换次数。使用的交换次数越少，你的星级评价就越高！',
          tip3Title: '使用撤销按钮',
          tip3Desc: '不要害怕实验！如果交换效果不好，使用撤销按钮尝试不同的方法。试错学习是乐趣的一部分。',
          tip4Title: '寻找单词模式',
          tip4Desc: '随着你揭示绿色字母，尝试识别常见的单词模式。如果你看到 "_AT" 有绿色的 A 和 T，想想像 CAT、HAT、BAT 等单词。',
          tip5Title: '熟能生巧',
          tip5Desc: '新手玩家不应该立即进入每日模式，直到他们了解系统和交换机制的工作原理。先尝试练习模式，在没有压力的情况下了解游戏！',
        },
        sudoku: {
          name: '数独',
          intro: '数独是风靡全球的经典数字逻辑益智游戏！在9×9的网格中填入1-9的数字，使每行、每列和每个3×3宫格内的数字不重复。',
          intro2: '如果你喜欢逻辑推理和脑力训练，这个游戏非常适合你。多种难度级别和每日挑战，总有新谜题等你来解！',
          note: '数独是基于逻辑的数字填充游戏。目标是在网格中填入数字，使每行、每列和每个3×3宫格都包含1到9的所有数字。',
          howToPlay: '如何玩',
          mechanics: '游戏规则',
          mechanicsIntro: '谜题由9×9的网格组成，分为九个3×3宫格。一些格子已经填有数字（这些是固定的，不能更改）。你的目标是正确填入空白格子的数字。',
          rule1Title: '规则1：行',
          rule1Desc: '每行必须包含1-9的数字，不能重复。',
          rule2Title: '规则2：列',
          rule2Desc: '每列必须包含1-9的数字，不能重复。',
          rule3Title: '规则3：3×3宫格',
          rule3Desc: '每个3×3宫格必须包含1-9的数字，不能重复。',
          controls: '点击空白格子选中它，然后使用数字键盘或键盘输入数字（1-9）。如果输入错误，可以清除格子或输入不同的数字。使用笔记功能标记可能的候选数字！',
          features: '特色功能',
          hintTitle: '提示',
          hintDesc: '卡住了？使用提示按钮为随机空白格子显示正确数字。每局游戏有3次提示机会，请谨慎使用！',
          notesTitle: '笔记模式',
          notesDesc: '切换笔记模式，在格子中标记多个候选数字。这有助于解题时追踪可能性。点击笔记按钮在数字和笔记输入之间切换。',
          errorHighlight: '错误高亮',
          errorHighlightDesc: '如果输入错误的数字，会以红色高亮显示。这有助于快速发现错误。',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每个难度级别每天一题，与全球玩家竞争！进度自动保存。',
          unlimitedMode: '无限模式',
          unlimitedDesc: '无尽的随机谜题！适合练习和提升技能。',
          practiceMode: '练习模式',
          practiceDesc: '选择任意难度，玩任意多的谜题。非常适合学习！',
          difficulty: '难度级别',
          easyDesc: '简单：移除35个数字。适合初学者！',
          mediumDesc: '中等：移除45个数字。平衡的挑战。',
          hardDesc: '困难：移除52个数字。适合有经验的玩家。',
          expertDesc: '专家：移除58个数字。终极挑战！',
          stats: '统计数据',
          statsDesc: '追踪你的进度：游戏次数、获胜次数和每个难度级别的最佳时间。',
          tips: '游戏技巧',
          tip1Title: '从唯一数开始',
          tip1Desc: '寻找只有一个数字可以填入的格子。扫描行、列和宫格找到这些"显性唯一数"。',
          tip2Title: '善用笔记',
          tip2Desc: '在空白格子中标记候选数字。这有助于发现模式和排除可能性。',
          tip3Title: '排除法',
          tip3Desc: '如果一个数字在某行/列/宫格中不能放在其他地方，它必须放在剩余的格子里。',
          tip4Title: '寻找隐性唯一数',
          tip4Desc: '有时一个数字在某行、列或宫格中只能放在一个格子里，即使该格子有多个候选数字。',
          tip5Title: '慢慢来',
          tip5Desc: '数独是逻辑游戏，不是速度游戏。仔细思考每一步，享受解题过程！',
          whyEntertaining: '为什么数独如此有趣？',
          whyDesc: '数独将逻辑推理与解谜的满足感完美结合。每填入一个数字都让你离答案更近一步，带来成就感。',
          whyDesc2: '游戏提供无尽的多样性——没有两个谜题是相同的。无论你有5分钟还是一小时，数独都是完美的脑力锻炼！',
        },
        minesweeper: {
          name: '扫雷',
          intro: '扫雷是考验逻辑和推理能力的经典益智游戏！根据数字线索清除雷区，不要触发任何地雷。',
          intro2: '如果你喜欢策略思考和模式识别，这个游戏非常适合你。三种难度级别，挑战自己更快地清除地雷！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '你的目标是揭开所有不含地雷的格子。使用已揭开格子上的数字来判断哪些相邻格子包含地雷。',
          rule1Title: '数字',
          rule1Desc: '数字表示8个相邻格子（水平、垂直和对角线方向）中有多少颗地雷。',
          rule2Title: '左键点击',
          rule2Desc: '点击揭开格子。如果是地雷，游戏结束！',
          rule3Title: '右键点击',
          rule3Desc: '右键点击（或手机上长按）在你怀疑包含地雷的格子上放置旗帜。',
          controls: '左键点击揭开格子。右键点击（或长按）标记疑似地雷。清除所有非地雷格子即可获胜！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每个难度级别每天一题。所有人玩同样的谜题——争取最快时间！',
          practiceMode: '练习模式',
          practiceDesc: '无限随机谜题，任意难度。完美提升你的技能！',
          difficulty: '难度级别',
          easyDesc: '简单：9×9网格，10颗地雷。适合学习！',
          mediumDesc: '中等：16×16网格，40颗地雷。平衡的挑战。',
          hardDesc: '困难：16×30网格，99颗地雷。专家级挑战！',
          tips: '游戏技巧',
          tip1Title: '从角落开始',
          tip1Desc: '第一次点击总是安全的。从角落或空旷区域开始可以揭开更多格子。',
          tip2Title: '使用数字逻辑',
          tip2Desc: '如果一个"1"只有一个未揭开的邻居，那个格子一定是地雷！',
          tip3Title: '策略性标记',
          tip3Desc: '不要过度标记。只标记你确定的格子以避免混淆。',
          tip4Title: '学习模式',
          tip4Desc: '识别边缘上的"1-2-1"等常见模式，快速确定地雷位置。',
          whyEntertaining: '为什么扫雷如此有趣？',
          whyDesc: '扫雷将纯逻辑与风险评估结合在一起。每次点击都是一个经过计算的决定，清除困难区域的满足感无与伦比。',
          whyDesc2: '游戏可以提高你的模式识别和逻辑思维能力。随着玩的越多，你会对地雷位置发展出直觉！',
        },
        game2048: {
          name: '2048',
          intro: '2048是风靡全球的令人上瘾的益智游戏！滑动数字方块合并它们，目标是创造难以捉摸的2048方块。',
          intro2: '如果你喜欢数字谜题和策略思考，这个游戏非常适合你。简单易学，难以精通！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '游戏在4×4网格上进行。相同数字的方块接触时会合并为一个。你的目标是创造数字为2048的方块！',
          rule1Title: '滑动',
          rule1Desc: '使用方向键（或手机上滑动）将所有方块朝该方向滑动。',
          rule2Title: '合并',
          rule2Desc: '当两个相同数字的方块接触时，它们合并为一个数值加倍的方块！',
          rule3Title: '新方块',
          rule3Desc: '每次移动后，一个新方块（2或4）出现在随机空位。',
          controls: '使用方向键或WASD移动方块。在手机上，向你想滑动的方向滑动。仔细规划你的移动！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天固定谜题。每个人得到相同的起始位置——看谁能达到最高分！',
          practiceMode: '练习模式',
          practiceDesc: '无尽随机谜题。尝试打破你的最高分！',
          tips: '游戏技巧',
          tip1Title: '把高数字方块放在角落',
          tip1Desc: '选择一个角落并把最高数字方块放在那里。这个策略有助于保持组织性。',
          tip2Title: '建立链条',
          tip2Desc: '尝试创建递增数字的链条。这使合并更高效。',
          tip3Title: '提前规划',
          tip3Desc: '思考新方块会出现在哪里。不要把自己逼入死角！',
          tip4Title: '不要追逐2048',
          tip4Desc: '专注于先建立一个强大的棋盘。有了好的策略，2048自然会到来。',
          whyEntertaining: '为什么2048如此有趣？',
          whyDesc: '2048将简单机制与深度策略结合在一起。每一步都有后果，提前几步规划是成功的关键。',
          whyDesc2: '看着方块合并和数字增长的满足感令人难以置信的愉悦。这是运气和技巧的完美结合！',
        },
        snake: {
          name: '贪吃蛇',
          intro: '贪吃蛇是几代人喜爱的经典街机游戏！引导蛇吃食物并变长，但不要撞到墙壁或自己！',
          intro2: '如果你喜欢快节奏动作和快速反应挑战，这个游戏非常适合你。简单控制，无限乐趣！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '控制一条持续移动的蛇。吃食物来变长并获得分数。如果你撞到墙壁或自己的身体，游戏结束。',
          rule1Title: '移动',
          rule1Desc: '使用方向键、WASD或滑动来改变方向。蛇不能立即反向移动。',
          rule2Title: '吃东西',
          rule2Desc: '当蛇吃到食物（红点）时，它会变长，你获得10分。',
          rule3Title: '速度',
          rule3Desc: '随着分数增加，蛇的速度会加快，使游戏逐渐变难！',
          controls: '使用方向键或WASD控制方向。在手机上，向你想去的方向滑动。按空格键或点击暂停。',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天竞争最高分！排行榜在午夜重置。',
          practiceMode: '练习模式',
          practiceDesc: '无限游戏提升你的技能。尝试打破你的个人最高分！',
          tips: '游戏技巧',
          tip1Title: '规划路线',
          tip1Desc: '不要只是追逐食物——规划一条保持选择开放的路径。',
          tip2Title: '使用边缘',
          tip2Desc: '沿着边缘移动可以在你变长时给你更多空间来机动。',
          tip3Title: '避免困住自己',
          tip3Desc: '小心不要绕圈困住自己。总是留一条逃生路线！',
          tip4Title: '高速时保持冷静',
          tip4Desc: '随着游戏加速，保持冷静并做出刻意的移动。恐慌会导致错误！',
          whyEntertaining: '为什么贪吃蛇如此有趣？',
          whyDesc: '贪吃蛇考验你的反应、空间意识和快速思考。不断升级的难度让你时刻保持警觉！',
          whyDesc2: '看着你的蛇变长有一种令人满足的感觉。这是简单和挑战的完美结合！',
        },
        memory: {
          name: '记忆翻牌',
          intro: '记忆翻牌是锻炼大脑的经典卡片配对游戏！每次翻开两张卡片找到匹配的配对。',
          intro2: '如果你喜欢记忆挑战和专注力游戏，这是完美的选择。适合所有年龄！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '卡片背面朝上放置。每次翻开两张卡片找到匹配的配对。清除所有配对即可获胜！',
          rule1Title: '翻牌',
          rule1Desc: '点击翻开卡片。你一次只能看到两张卡片。',
          rule2Title: '配对',
          rule2Desc: '如果两张翻开的卡片匹配，它们保持面朝上。如果不匹配，一秒钟后翻回。',
          rule3Title: '获胜',
          rule3Desc: '找到所有匹配的配对完成游戏。更少的步数意味着更好的分数！',
          controls: '点击或轻触卡片翻开它们。尝试记住你见过的卡片位置！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天固定的卡片组。争取用最少的步数完成谜题！',
          practiceMode: '练习模式',
          practiceDesc: '随机卡片布局。想玩多少次就玩多少次来提升你的记忆力！',
          difficulty: '难度级别',
          easyDesc: '简单：6对（12张卡片）。适合初学者！',
          mediumDesc: '中等：8对（16张卡片）。平衡的挑战。',
          hardDesc: '困难：10对（20张卡片）。测试你的记忆极限！',
          tips: '游戏技巧',
          tip1Title: '创建心理分组',
          tip1Desc: '将棋盘分成几个区域，专注于记住每个区域的卡片。',
          tip2Title: '使用记忆技巧',
          tip2Desc: '将卡片与故事或图像联系起来帮助记住它们的位置。',
          tip3Title: '系统性地开始',
          tip3Desc: '从一边到另一边工作，而不是随机点击卡片。',
          tip4Title: '注意配对',
          tip4Desc: '当你看到一张卡片时，尝试回忆你是否在其他地方见过它的配对。',
          whyEntertaining: '为什么记忆翻牌如此有趣？',
          whyDesc: '记忆翻牌在锻炼大脑的同时很有趣！它提高专注力和回忆能力。',
          whyDesc2: '找到配对和用更少步数完成谜题的满足感令人难以置信的愉悦。这是很好的脑力锻炼！',
        },
        tetris: {
          name: '俄罗斯方块',
          intro: '俄罗斯方块是风靡全球几十年的传奇益智游戏！旋转并排列下落的方块来创建完整的行。',
          intro2: '如果你喜欢快节奏的益智游戏和空间推理，这款经典游戏非常适合你！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '不同形状的方块（四格骨牌）从顶部下落。旋转和移动它们来创建完整的水平行。',
          rule1Title: '控制',
          rule1Desc: '使用方向键左右移动，向上旋转，向下加速下落。手机上点击左/右/旋转按钮。',
          rule2Title: '消除行',
          rule2Desc: '当水平行完全填满时，它会消失，你获得分数。',
          rule3Title: '游戏结束',
          rule3Desc: '如果方块堆到顶部，游戏结束！',
          controls: '方向键或屏幕按钮移动和旋转。空格键硬降。消除行来生存！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天相同的方块序列，竞争最高分！',
          practiceMode: '练习模式',
          practiceDesc: '无限游戏提升技能，打破你的最高分！',
          tips: '游戏技巧',
          tip1Title: '留出缺口',
          tip1Desc: '保持单列缺口开放，让I型方块一次消除4行。',
          tip2Title: '提前规划',
          tip2Desc: '不要只关注当前方块——计划下一个方块放在哪里。',
          tip3Title: '保持平整',
          tip3Desc: '尽量保持堆叠平整，给自己更多选择。',
          tip4Title: '从底部消除',
          tip4Desc: '从底部往上工作。在填满区域下创建洞很难修复！',
          whyEntertaining: '为什么俄罗斯方块如此有趣？',
          whyDesc: '俄罗斯方块将简单控制与深度策略结合。消除行的满足感，尤其是消除4行，无与伦比！',
          whyDesc2: '游戏提高空间意识和压力下的决策能力。易学难精！',
        },
        tictactoe: {
          name: '井字棋',
          intro: '井字棋是老少皆宜的经典纸笔游戏！轮流放置X和O，连成三子获胜。',
          intro2: '简单易学，但也有足够的策略性。与朋友或AI对战！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '两名玩家轮流在3×3网格中放置标记。首先连成3个标记（横向、纵向或对角线）的玩家获胜！',
          rule1Title: '轮流',
          rule1Desc: '玩家交替在任何空格上放置标记（X或O）。',
          rule2Title: '获胜',
          rule2Desc: '横向、纵向或对角线连成3个标记即可获胜。',
          rule3Title: '平局',
          rule3Desc: '如果9个格子都填满但没有获胜者，游戏平局。',
          controls: '点击或轻触任何空格放置标记。先手是X，后手是O。',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天固定的AI开局，与AI对战。',
          practiceMode: '练习模式',
          practiceDesc: '无限与AI或朋友对战！',
          tips: '游戏技巧',
          tip1Title: '占据中心',
          tip1Desc: '中心格子是最有战略意义的位置——它属于4条获胜线！',
          tip2Title: '阻挡对手',
          tip2Desc: '始终检查对手是否有2子连线并阻挡！',
          tip3Title: '创造双威胁',
          tip3Desc: '尝试同时创造两个获胜威胁。对手只能阻挡一个！',
          tip4Title: '先占角',
          tip4Desc: '如果你先手，占据角落给你最好的获胜或平局机会。',
          whyEntertaining: '为什么井字棋如此有趣？',
          whyDesc: '井字棋是简单与策略的完美结合。每一步都很重要，一个错误就可能输掉游戏！',
          whyDesc2: '非常适合快速休息或教孩子基本策略。游戏几分钟就结束，很容易再玩一局！',
        },
        connectfour: {
          name: '四子棋',
          intro: '四子棋是经典的二人策略游戏！投下彩色圆盘，在对手之前连成四子。',
          intro2: '简单规则，深度策略。喜欢战术思考的玩家的完美选择！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '玩家轮流将圆盘投入垂直网格。圆盘会落到每列最低的可用位置。',
          rule1Title: '投下圆盘',
          rule1Desc: '点击一列投下圆盘。它会落到最低的空位。',
          rule2Title: '获胜',
          rule2Desc: '横向、纵向或对角线连接4个同色圆盘即可获胜！',
          rule3Title: '棋盘满',
          rule3Desc: '如果棋盘填满但没有获胜者，游戏平局。',
          controls: '点击或轻触任何列投下圆盘。键盘可用1-7键选择列。',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天固定的AI起始位置，所有人同样的挑战！',
          practiceMode: '练习模式',
          practiceDesc: '无限与AI或朋友对战提升技能！',
          tips: '游戏技巧',
          tip1Title: '控制中心',
          tip1Desc: '中间列最有价值——更多获胜组合经过它！',
          tip2Title: '阻挡威胁',
          tip2Desc: '始终检查对手是否有3子连线并立即阻挡！',
          tip3Title: '创造双重威胁',
          tip3Desc: '设置两个获胜机会。对手只能阻挡一个！',
          tip4Title: '从下往上思考',
          tip4Desc: '记住圆盘会堆叠。规划在更高行创造机会的移动！',
          whyEntertaining: '为什么四子棋如此有趣？',
          whyDesc: '四子棋将视觉模式识别与前瞻规划结合。每一步都影响未来的可能性！',
          whyDesc2: '垂直棋盘为经典的"连四"概念增添了独特的维度。快速游戏，深度策略！',
        },
        whackamole: {
          name: '打地鼠',
          intro: '打地鼠是经典的反应游戏！在鼹鼠从洞里消失之前击打它们。',
          intro2: '测试你的反应速度和手眼协调。快速、刺激的游戏体验！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '鼹鼠随机从洞里冒出来。在它们消失之前快速点击得分！',
          rule1Title: '普通地鼠',
          rule1Desc: '仓鼠地鼠给你10分。在它们躲藏之前击打！',
          rule2Title: '金色地鼠',
          rule2Desc: '金色地鼠很罕见，值50分。不要错过！',
          rule3Title: '炸弹',
          rule3Desc: '避免击中炸弹！它们扣除30分和3秒时间。',
          controls: '点击或轻触出现的地鼠。要快——时间有限！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '所有人得到相同的地鼠序列。竞争每日最高分！',
          practiceMode: '练习模式',
          practiceDesc: '随机地鼠的无限游戏。打破你的个人最佳！',
          difficulty: '难度级别',
          easyDesc: '简单：地鼠出现较慢。热身首选！',
          mediumDesc: '中等：平衡的速度和得分。',
          hardDesc: '困难：快速地鼠！挑战极限！',
          tips: '游戏技巧',
          tip1Title: '建立连击',
          tip1Desc: '快速连续击打地鼠获得最高5倍的连击加成！',
          tip2Title: '注意金色',
          tip2Desc: '金色地鼠很少出现——优先击打它们获得高分！',
          tip3Title: '避开炸弹',
          tip3Desc: '错过地鼠比击中炸弹好。炸弹伤害分数和时间！',
          tip4Title: '保持专注',
          tip4Desc: '让眼睛在所有洞之间移动。预判地鼠可能出现的位置！',
          whyEntertaining: '为什么打地鼠如此有趣？',
          whyDesc: '打地鼠测试纯反应和手眼协调。快节奏的动作让你时刻保持警觉！',
          whyDesc2: '完美连击的满足感无与伦比。非常适合快速游戏！',
        },
        simonsays: {
          name: '西蒙说',
          intro: '西蒙说是经典的记忆游戏！观看颜色序列并准确重复。你能记住多长？',
          intro2: '训练大脑，提升记忆力，挑战永不过时！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '观看西蒙播放的颜色序列。然后按相同顺序点击颜色来重复序列！',
          rule1Title: '观看',
          rule1Desc: '注意西蒙显示的颜色序列。',
          rule2Title: '重复',
          rule2Desc: '按完全相同的顺序点击颜色来前进。',
          rule3Title: '序列增长',
          rule3Desc: '每轮增加一个颜色到序列中。你能走多远？',
          controls: '点击或轻触彩色按钮重复序列。键盘可用R/G/B/Y键。',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '所有人得到相同的起始序列。竞争最长连续！',
          practiceMode: '练习模式',
          practiceDesc: '每局随机序列。练习提升记忆力！',
          difficulty: '难度级别',
          easyDesc: '简单：慢速播放。学习首选！',
          mediumDesc: '中等：正常速度游戏。',
          hardDesc: '困难：快速播放！终极记忆测试！',
          tips: '游戏技巧',
          tip1Title: '使用模式',
          tip1Desc: '将序列分成块。把"R-G-B"作为一个单元记忆。',
          tip2Title: '大声说出来',
          tip2Desc: '口头重复颜色有助于加强记忆。',
          tip3Title: '创建故事',
          tip3Desc: '将颜色与故事联系起来："红苹果、蓝天空、绿草地"...',
          tip4Title: '保持冷静',
          tip4Desc: '重复时不要急。点击前花点时间回忆！',
          whyEntertaining: '为什么西蒙说如此有趣？',
          whyDesc: '西蒙说是纯粹的记忆力训练。看着序列变长非常令人满足！',
          whyDesc2: '游戏揭示了短期记忆的极限并帮助随时间提升！',
        },
        fifteenpuzzle: {
          name: '15数字推盘',
          intro: '15数字推盘是经典的滑块拼图！通过滑动数字方块到空位，将它们按顺序排列。',
          intro2: '一个世纪以来挑战益智爱好者的永恒脑力游戏！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '拼图有15个编号方块和一个空位。滑动方块到空位将它们按1-15的顺序排列。',
          rule1Title: '滑动',
          rule1Desc: '点击或轻触空位旁边的方块来滑动它。',
          rule2Title: '目标',
          rule2Desc: '排列方块使数字1-15按从左到右、从上到下的顺序出现。',
          rule3Title: '获胜',
          rule3Desc: '用尽可能少的步数完成拼图获得更高分数！',
          controls: '点击/轻触空位旁边的方块滑动它们。方向键也可以！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天所有人得到相同的打乱拼图。竞争最少步数！',
          practiceMode: '练习模式',
          practiceDesc: '随机拼图，难度各异。提升你的解题技能！',
          difficulty: '难度级别',
          easyDesc: '简单：距离解答10-15步。',
          mediumDesc: '中等：距离解答30-40步。',
          hardDesc: '困难：距离解答50+步。真正的挑战！',
          tips: '游戏技巧',
          tip1Title: '先解顶行',
          tip1Desc: '先把方块1-4放好，然后处理第2行。',
          tip2Title: '分区解决',
          tip2Desc: '不要随机解决。逐个区域完成拼图。',
          tip3Title: '利用空位',
          tip3Desc: '策略性地移动空位来将方块定位到需要的位置。',
          tip4Title: '不要破坏进度',
          tip4Desc: '处理其他区域时小心不要打乱已解决的区域！',
          whyEntertaining: '为什么15数字推盘如此有趣？',
          whyDesc: '15数字推盘提供逻辑与规划的完美结合。每一步都影响未来的可能性！',
          whyDesc2: '高效解决拼图需要提前思考多步。看着方块归位的满足感无与伦比！',
        },
        lightsout: {
          name: '熄灯游戏',
          intro: '熄灯游戏是看似简单的益智游戏！通过切换关闭所有灯——但每次点击也会影响相邻的灯。',
          intro2: '一个从简单开始但很快变得烧脑的逻辑谜题！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '点击任何灯来切换它的开关状态。但要注意：点击灯也会切换它的4个邻居（上、下、左、右）！',
          rule1Title: '切换',
          rule1Desc: '点击格子切换它和相邻格子。仔细规划！',
          rule2Title: '目标',
          rule2Desc: '关闭所有灯来完成拼图。',
          rule3Title: '策略',
          rule3Desc: '有些谜题需要提前思考多步。试错不一定有效！',
          controls: '点击或轻触任何灯来切换它和邻居。点击前先思考！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天一个新谜题。所有人解决同样的挑战！',
          practiceMode: '练习模式',
          practiceDesc: '无限随机谜题。掌握策略！',
          difficulty: '难度级别',
          easyDesc: '简单：3×3网格。快速谜题！',
          mediumDesc: '中等：5×5网格。标准挑战。',
          hardDesc: '困难：7×7网格。复杂模式！',
          tips: '游戏技巧',
          tip1Title: '系统化工作',
          tip1Desc: '从顶行开始往下。不要回到已完成的行！',
          tip2Title: '追踪灯光',
          tip2Desc: '使用"追逐"技术：在上一行每个亮着的格子下方切换。',
          tip3Title: '提前规划',
          tip3Desc: '点击前，可视化它将如何影响相邻格子。',
          tip4Title: '最少步数',
          tip4Desc: '尝试用最少步数解决。效率很重要！',
          whyEntertaining: '为什么熄灯游戏如此有趣？',
          whyDesc: '熄灯游戏将简单规则与深度逻辑思考结合。每个谜题都是新的心理挑战！',
          whyDesc2: '游戏教你提前思考多步。看着所有灯最终熄灭非常令人满足！',
        },
        brickbreaker: {
          name: '打砖块',
          intro: '打砖块是经典街机游戏！用挡板反弹球并摧毁所有砖块。',
          intro2: '简单易玩，难以放下。永恒的街机体验！',
          howToPlay: '如何玩',
          mechanics: 'Game Mechanics',
          mechanicsIntro: '控制屏幕底部的挡板。反弹球来打破上方的所有砖块！',
          rule1Title: '挡板控制',
          rule1Desc: '移动鼠标/手指控制挡板。让球保持在游戏中！',
          rule2Title: '打破砖块',
          rule2Desc: '用球击中砖块来摧毁它们。每块砖给你分数！',
          rule3Title: '生命',
          rule3Desc: '你有3条命。球从挡板下方掉落时失去一条命。',
          controls: '移动鼠标或滑动控制挡板。方向键或A/D也可以。按P暂停。',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '所有人相同的砖块布局。竞争每日最高分！',
          practiceMode: '练习模式',
          practiceDesc: '无限关卡，难度递增。打破你的最高分！',
          difficulty: '难度级别',
          easyDesc: '简单：球速较慢，挡板较大。',
          mediumDesc: '中等：标准游戏。',
          hardDesc: '困难：球速较快，挡板较小！',
          tips: '游戏技巧',
          tip1Title: '瞄准角度',
          tip1Desc: '用挡板的不同部位击球来改变它的角度。',
          tip2Title: '从底部清除',
          tip2Desc: '尽量从下往上清除砖块，避免困住球！',
          tip3Title: '盯住球',
          tip3Desc: '眼睛盯着球，不是挡板。预判它将落在哪里！',
          tip4Title: '不要急',
          tip4Desc: '没有时间限制。慢慢来，做出受控的移动！',
          whyEntertaining: '为什么打砖块如此有趣？',
          whyDesc: '打砖块提供令人满足的、有节奏的游戏体验。看着砖块消失永远不会腻！',
          whyDesc2: '游戏测试你的反应和精确度.每清除一关都带来成就感！',
        },
        bullpen: {
          name: '牛栏逻辑',
          intro: '牛栏逻辑是一款简洁的逻辑益智游戏，每头公牛都必须精确放置！就像数独与扫雷的结合！',
          intro2: '简单规则，深度策略！非常适合益智游戏爱好者！',
          howToPlay: '如何玩',
          mechanics: '游戏机制',
          mechanicsIntro: '在网格中放置公牛，使每个围栏、行和列都有正确数量的公牛！',
          rule1Title: '放置公牛',
          rule1Desc: '点击空格放置公牛(🐂)。再次点击标记为草地(🌱)。再点击清除。',
          rule2Title: '围栏约束',
          rule2Desc: '每个彩色围栏区域必须有1头公牛(困难模式为2头)！',
          rule3Title: '行列约束',
          rule3Desc: '每行每列都需要1头公牛(困难模式为2头)！',
          rule4Title: '不能相邻',
          rule4Desc: '公牛之间不能相邻，包括对角线方向！',
          controls: '点击格子放置、标记或清除。用逻辑推导公牛的位置！',
          gameModes: '游戏模式',
          dailyMode: '每日挑战',
          dailyDesc: '每天一个新谜题。所有人解决相同的挑战！',
          practiceMode: '练习模式',
          practiceDesc: '无限随机谜题。掌握逻辑技巧！',
          difficulty: '难度等级',
          easyDesc: '简单：5×5网格。适合初学者！',
          normalDesc: '普通：7×7网格。标准挑战。',
          hardDesc: '困难：8×8网格，每个围栏2头公牛！复杂模式！',
          tips: '游戏技巧',
          tip1Title: '系统化思考',
          tip1Desc: '从边缘开始，逐步向内。先排除不可能的位置！',
          tip2Title: '逻辑推导',
          tip2Desc: '如果一行已有1头公牛且其他格子都已确定，这行就完成了！',
          tip3Title: '追踪约束',
          tip3Desc: '记录哪些围栏、行和列还需要公牛。使用排除法！',
          tip4Title: '提前规划',
          tip4Desc: '每步放置都会影响后续。提前规划几步！',
          whyEntertaining: '牛栏逻辑为什么这么有趣？',
          whyDesc: '牛栏逻辑将简单规则与深度逻辑推理结合。每个谜题都是令人满足的心理挑战！',
          whyDesc2: '游戏教会系统化思考。看着所有公牛最终找到正确位置非常令人满足！',
        },
      }
    }
  }

  const t = translations[language]
  const game = t.games[activeGame]

  return (
    <div className={`fixed inset-0 ${bgClass} ${textClass} z-50 overflow-y-auto`}>
      {/* Header */}
      <div className={`sticky top-0 ${cardBgClass} border-b ${borderClass} p-4 flex items-center justify-between z-10`}>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-500/20">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">{t.title}</h1>
        <button onClick={onClose} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {t.close}
        </button>
      </div>

      {/* Game Tabs */}
      <div className={`sticky top-[60px] ${cardBgClass} border-b ${borderClass} p-2 flex gap-2 overflow-x-auto`}>
        {(['wordle', 'mastermind', 'crosswordle', 'sudoku', 'minesweeper', 'game2048', 'snake', 'memory', 'tetris', 'tictactoe', 'connectfour', 'whackamole', 'simonsays', 'fifteenpuzzle', 'lightsout', 'brickbreaker', 'bullpen'] as GameType[]).map((g) => (
          <button
            key={g}
            onClick={() => setActiveGame(g)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeGame === g
                ? 'bg-green-600 text-white'
                : darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t.games[g].name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Intro */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <p className={`text-lg leading-relaxed ${subTextClass}`}>{game.intro}</p>
          <p className={`mt-4 ${subSubTextClass}`}>{game.intro2}</p>
          {'note' in game && (
            <p className={`mt-4 text-xs italic ${subSubTextClass}`}>{game.note}</p>
          )}
        </div>

        {/* How to Play */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <h2 className="text-xl font-bold mb-4">{game.howToPlay}</h2>

          <h3 className="font-semibold text-lg mb-3">{game.mechanics}</h3>
          <p className={`mb-4 ${subTextClass}`}>{game.mechanicsIntro}</p>

          {'colors' in game && (
            <p className={`mb-4 font-medium ${subTextClass}`}>{game.colors}</p>
          )}

          {/* Color indicators - only for wordle, mastermind, crosswordle */}
          {activeGame !== 'sudoku' && 'greenTitle' in game && (
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{game.greenTitle}</span>
                <span className={` ${subTextClass}`}> {game.greenDesc}</span>
              </div>
            </div>
            {'whiteTitle' in game ? (
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded flex-shrink-0 mt-0.5 ${darkMode ? 'bg-white' : 'bg-gray-200'}`} />
                <div>
                  <span className="font-semibold">{game.whiteTitle}</span>
                  <span className={` ${subTextClass}`}> {game.whiteDesc}</span>
                </div>
              </div>
            ) : 'yellowTitle' in game ? (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{game.yellowTitle}</span>
                  <span className={` ${subTextClass}`}> {game.yellowDesc}</span>
                </div>
              </div>
            ) : null}
            {'redTitle' in game ? (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{game.redTitle}</span>
                  <span className={` ${subTextClass}`}> {game.redDesc}</span>
                </div>
              </div>
            ) : 'grayTitle' in game ? (
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded flex-shrink-0 mt-0.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                <div>
                  <span className="font-semibold">{game.grayTitle}</span>
                  <span className={` ${subTextClass}`}> {game.grayDesc}</span>
                </div>
              </div>
            ) : null}
          </div>
          )}

          {/* Rules - only for sudoku */}
          {activeGame === 'sudoku' && 'rule1Title' in game && (
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-500 flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold">R</div>
              <div>
                <span className="font-semibold">{game.rule1Title}</span>
                <span className={` ${subTextClass}`}> {game.rule1Desc}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-500 flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold">C</div>
              <div>
                <span className="font-semibold">{game.rule2Title}</span>
                <span className={` ${subTextClass}`}> {game.rule2Desc}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-500 flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold">3</div>
              <div>
                <span className="font-semibold">{game.rule3Title}</span>
                <span className={` ${subTextClass}`}> {game.rule3Desc}</span>
              </div>
            </div>
          </div>
          )}

          {'submit' in game && (
            <p className={`mb-4 ${subTextClass}`}>{game.submit}</p>
          )}

          {'goal' in game && (
            <p className={`mb-4 ${subTextClass}`}>{game.goal}</p>
          )}

          <p className={`mt-4 ${subTextClass}`}>{game.controls}</p>
        </div>

        {/* Game Modes */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <h2 className="text-xl font-bold mb-4">{game.gameModes}</h2>

          {'modesIntro' in game && (
            <p className={`mb-4 ${subTextClass}`}>{game.modesIntro}</p>
          )}

          <div className="space-y-4">
            {'dailyMode' in game && (
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">Daily</span>
                  {game.dailyMode}
                </h3>
                <p className={`mt-1 ${subTextClass}`}>{game.dailyDesc}</p>
              </div>
            )}

            {'unlimitedMode' in game && (
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded">Unlimited</span>
                  {game.unlimitedMode}
                </h3>
                <p className={`mt-1 ${subTextClass}`}>{game.unlimitedDesc}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">Practice</span>
                {game.practiceMode}
              </h3>
              <p className={`mt-1 ${subTextClass}`}>{game.practiceDesc}</p>
            </div>
          </div>

          {'stats' in game && (
            <p className={`mt-4 ${subTextClass}`}>{game.stats}</p>
          )}

          {'gridSizes' in game && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">{game.gridSizes}</h3>
              <ul className={`space-y-2 ${subTextClass}`}>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">3×3</span>
                  {game.grid3x3}
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">7×7</span>
                  {game.grid7x7}
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">9×9</span>
                  {game.grid9x9}
                </li>
              </ul>
            </div>
          )}

          {'stars' in game && (
            <p className={`mt-4 ${subTextClass}`}>{game.stars}</p>
          )}
        </div>

        {/* Why Entertaining */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <h2 className="text-xl font-bold mb-4">{game.whyEntertaining}</h2>
          <p className={subTextClass}>{game.whyDesc}</p>
          <p className={`mt-3 ${subTextClass}`}>{game.whyDesc2}</p>
        </div>

        {/* Tips */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <h2 className="text-xl font-bold mb-4">{game.tips}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{game.tip1Title}</h3>
              <p className={`mt-1 ${subTextClass}`}>{game.tip1Desc}</p>
            </div>
            <div>
              <h3 className="font-semibold">{game.tip2Title}</h3>
              <p className={`mt-1 ${subTextClass}`}>{game.tip2Desc}</p>
            </div>
            <div>
              <h3 className="font-semibold">{game.tip3Title}</h3>
              <p className={`mt-1 ${subTextClass}`}>{game.tip3Desc}</p>
            </div>
            {'tip4Title' in game && (
              <div>
                <h3 className="font-semibold">{game.tip4Title}</h3>
                <p className={`mt-1 ${subTextClass}`}>{game.tip4Desc}</p>
              </div>
            )}
            {'tip5Title' in game && (
              <div>
                <h3 className="font-semibold">{game.tip5Title}</h3>
                <p className={`mt-1 ${subTextClass}`}>{game.tip5Desc}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  )
}
