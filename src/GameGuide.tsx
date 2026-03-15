import { useState } from 'react'

type GameGuideProps = {
  language: 'en' | 'zh'
  darkMode: boolean
  onClose: () => void
  initialGame?: 'wordle' | 'mastermind' | 'crosswordle' | 'sudoku'
}

type GameType = 'wordle' | 'mastermind' | 'crosswordle' | 'sudoku'

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
        },
      },
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
        },
      },
    },
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
        {(['wordle', 'mastermind', 'crosswordle', 'sudoku'] as GameType[]).map((g) => (
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

          {/* Color indicators */}
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
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{game.yellowTitle}</span>
                  <span className={` ${subTextClass}`}> {game.yellowDesc}</span>
                </div>
              </div>
            )}
            {'redTitle' in game ? (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{game.redTitle}</span>
                  <span className={` ${subTextClass}`}> {game.redDesc}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded flex-shrink-0 mt-0.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                <div>
                  <span className="font-semibold">{game.grayTitle}</span>
                  <span className={` ${subTextClass}`}> {game.grayDesc}</span>
                </div>
              </div>
            )}
          </div>

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
