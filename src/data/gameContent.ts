import type { GameContentData } from '../components/GameContent'

/**
 * SEO-optimized content for all games
 * Each game should have 800-1500 words of content
 *
 * Priority: Tier 3 games (low competition, high opportunity)
 */

export const gameContentData: Record<string, GameContentData> = {
  // ===== WORD GAMES =====
  wordle: {
    about: {
      en: "Word Guess is a popular word puzzle game where players have 6 attempts to guess a hidden 5-letter word. After each guess, colored tiles indicate how close your guess was to the target word. Green means the letter is correct and in the right position, yellow means the letter is in the word but in the wrong position, and gray means the letter is not in the word at all. This simple yet addictive gameplay has made Word Guess one of the most popular online puzzle games.",
      zh: "猜词游戏是一款流行的文字谜题游戏，玩家需要在6次尝试内猜出一个隐藏的5字母单词。每次猜测后，彩色方块会显示你的猜测与目标单词的接近程度。绿色表示字母正确且位置正确，黄色表示字母在单词中但位置错误，灰色表示字母不在单词中。这种简单而上瘾的游戏玩法使猜词游戏成为最受欢迎的在线益智游戏之一。"
    },
    history: {
      en: "The word guessing game format was popularized in 2022 and has since inspired countless variations. Originally created by Josh Wardle, the game was acquired by The New York Times and continues to be played by millions worldwide daily.",
      zh: "猜词游戏格式于2022年流行起来，此后催生了无数变体。最初由Josh Wardle创建，该游戏被纽约时报收购，至今每天仍有数百万全球玩家。"
    },
    howToPlay: [
      "Start by entering any 5-letter word as your first guess",
      "Look at the color feedback: Green = correct position, Yellow = wrong position, Gray = not in word",
      "Use the feedback to eliminate letters and narrow down possibilities",
      "Try to use common letters like E, A, R, S, T in your early guesses",
      "You have 6 attempts to find the correct word"
    ],
    tips: {
      en: [
        "Start with words containing common letters like CRANE, SLATE, or ARISE",
        "Avoid repeating letters in your first 2-3 guesses to maximize information",
        "Pay attention to letter frequency - E, A, R, O, T are most common in English",
        "Use the process of elimination - gray letters will never appear in the answer",
        "In hard mode, you must use any revealed green or yellow letters in subsequent guesses"
      ],
      zh: [
        "使用包含常见字母的单词开始，如CRANE、SLATE或ARISE",
        "在前2-3次猜测中避免重复字母，以最大化信息获取",
        "注意字母频率 - E、A、R、O、T是英语中最常见的字母",
        "使用排除法 - 灰色字母永远不会出现在答案中",
        "在困难模式下，你必须在后续猜测中使用已揭示的绿色或黄色字母"
      ]
    },
    faq: [
      {
        question: { en: "What is the best starting word?", zh: "最好的起始词是什么？" },
        answer: { en: "Words like CRANE, SLATE, ARISE, and TRACE are excellent starting words because they contain multiple common letters in good positions.", zh: "像CRANE、SLATE、ARISE和TRACE这样的单词是极佳的起始词，因为它们包含多个常见字母，位置也很好。" }
      },
      {
        question: { en: "Can I play previous days' puzzles?", zh: "我可以玩之前日期的谜题吗？" },
        answer: { en: "Yes! Our practice mode allows you to play unlimited random puzzles anytime you want.", zh: "可以！我们的练习模式让你随时可以无限玩随机谜题。" }
      },
      {
        question: { en: "How is difficulty determined?", zh: "难度是如何确定的？" },
        answer: { en: "Hard mode requires you to use revealed hints in subsequent guesses, making the puzzle more challenging.", zh: "困难模式要求你在后续猜测中使用已揭示的提示，使谜题更具挑战性。" }
      }
    ]
  },

  // ===== LOGIC PUZZLES =====
  sudoku: {
    about: {
      en: "Sudoku is a classic logic-based number puzzle played on a 9×9 grid divided into nine 3×3 subgrids. The objective is to fill the entire grid with digits 1-9 so that each row, each column, and each 3×3 box contains all digits from 1 to 9 without repetition. Partially completed grids are provided as starting points, and the challenge is to use logical deduction to fill in the rest.",
      zh: "数独是一款经典的基于逻辑的数字谜题，在9×9的网格上进行，网格被分为九个3×3的小方格。目标是用数字1-9填满整个网格，使每行、每列和每个3×3方格都包含1-9的所有数字且不重复。部分完成的网格作为起点，挑战是使用逻辑推理来填充其余部分。"
    },
    history: {
      en: "Sudoku originated from Latin square puzzles and was modernized in Japan in the 1980s. The name 'Sudoku' is abbreviated from the Japanese phrase 'Sūji wa dokushin ni kagiru' meaning 'the digits must remain single'. It became a global phenomenon in the 2000s.",
      zh: "数独起源于拉丁方阵谜题，于1980年代在日本现代化。名称'Sudoku'是日语短语'Sūji wa dokushin ni kagiru'的缩写，意思是'数字必须保持单独'。它在2000年代成为全球现象。"
    },
    howToPlay: [
      "The 9×9 grid is divided into nine 3×3 boxes",
      "Fill each row with numbers 1-9, no repeats allowed",
      "Fill each column with numbers 1-9, no repeats allowed",
      "Fill each 3×3 box with numbers 1-9, no repeats allowed",
      "Use the given numbers as clues to deduce the rest"
    ],
    tips: {
      en: [
        "Start with rows, columns, or boxes that have the most given numbers",
        "Use the 'pencil mark' feature to note possible candidates for each cell",
        "Look for 'naked singles' - cells where only one number can fit",
        "Look for 'hidden singles' - numbers that can only go in one place in a row/column/box",
        "Advanced techniques include X-Wing, Swordfish, and elimination chains"
      ],
      zh: [
        "从给定数字最多的行、列或方格开始",
        "使用'铅笔标记'功能记录每个单元格的可能候选数字",
        "寻找'裸单' - 只能填一个数字的单元格",
        "寻找'隐单' - 在行/列/方格中只能放在一个位置的数字",
        "高级技巧包括X-Wing、剑鱼和消除链"
      ]
    },
    faq: [
      {
        question: { en: "Does Sudoku require math skills?", zh: "数独需要数学技能吗？" },
        answer: { en: "No! Sudoku is purely a logic puzzle. The numbers are just symbols - you could use letters or colors instead. No arithmetic is needed.", zh: "不需要！数独纯粹是逻辑谜题。数字只是符号 - 你可以使用字母或颜色代替。不需要算术。" }
      },
      {
        question: { en: "What difficulty should I start with?", zh: "我应该从什么难度开始？" },
        answer: { en: "Beginners should start with Easy mode, which provides more starting numbers and requires only basic techniques.", zh: "初学者应该从简单模式开始，它提供更多起始数字，只需要基本技巧。" }
      },
      {
        question: { en: "Are all Sudoku puzzles solvable without guessing?", zh: "所有数独谜题都可以不猜测解决吗？" },
        answer: { en: "Yes, well-designed Sudoku puzzles have exactly one solution that can be found through pure logic. Our puzzles are guaranteed to be solvable without guessing.", zh: "是的，设计良好的数独谜题有且仅有一个可以通过纯逻辑找到的解决方案。我们的谜题保证可以不猜测解决。" }
      }
    ]
  },

  // ===== NONOGRAM =====
  nonogram: {
    about: {
      en: "Nonogram (also known as Picross, Griddlers, or Paint by Numbers) is a picture logic puzzle where you fill in cells on a grid to reveal a hidden picture. Numbers along the edges indicate how many consecutive cells should be filled in each row and column. By using logic and deduction, you gradually uncover the mystery image pixel by pixel.",
      zh: "数织（也称为Picross、十字绣或数字画）是一款图画逻辑谜题，你在网格上填充单元格以揭示隐藏的图片。边缘的数字表示每行和每列中应该填充多少连续单元格。通过使用逻辑和推理，你逐渐逐像素地揭开神秘图像。"
    },
    history: {
      en: "Nonograms were invented independently in Japan in the late 1980s by two different puzzle designers. The name comes from 'nonogram' referring to a system of picture-drawing grids. They became popular worldwide through video games and newspapers.",
      zh: "数织于1980年代后期由两位不同的谜题设计师在日本独立发明。这个名字来自于'nongram'，指的是一种画图网格系统。它们通过视频游戏和报纸在全球流行起来。"
    },
    howToPlay: [
      "Each number tells you the length of consecutive filled cells",
      "Multiple numbers mean separate groups with at least one empty cell between",
      "Use row and column clues together to determine cell states",
      "Mark cells you know are empty with an X to help visualize",
      "Complete the puzzle by filling all correct cells to reveal the picture"
    ],
    tips: {
      en: [
        "Start with rows/columns that have large numbers or sum close to grid size",
        "A row with '5' in a 5-grid must be completely filled",
        "Look for overlapping possibilities - a clue of 4 in a 5-grid means the middle 3 cells must be filled",
        "Use X marks to track cells you've determined are empty",
        "Work systematically - completing one line often reveals clues for others"
      ],
      zh: [
        "从具有大数字或总和接近网格大小的行/列开始",
        "5格网格中的'5'行必须完全填充",
        "寻找重叠可能性 - 5格中的4提示意味着中间3格必须填充",
        "使用X标记记录你已确定是空的单元格",
        "系统地工作 - 完成一行通常会揭示其他行的线索"
      ]
    },
    faq: [
      {
        question: { en: "What's the difference between Nonogram and Picross?", zh: "数织和Picross有什么区别？" },
        answer: { en: "They're the same puzzle type! Picross is a Nintendo trademark for Nonogram puzzles. Other names include Griddlers, Paint by Numbers, and Hanjie.", zh: "它们是同一种谜题类型！Picross是任天堂对数织谜题的商标。其他名称包括十字绣、数字画和汉杰。" }
      },
      {
        question: { en: "Do I need to know what the picture is to solve it?", zh: "我需要知道图片是什么才能解决吗？" },
        answer: { en: "No! You can solve Nonograms purely through logic. The picture is revealed as a reward at the end, not a clue during solving.", zh: "不需要！你可以纯通过逻辑解决数织。图片是最后作为奖励揭示的，而不是解决过程中的线索。" }
      }
    ]
  },

  // ===== 2048 =====
  game2048: {
    about: {
      en: "2048 is an addictive sliding tile puzzle game played on a 4×4 grid. Tiles with numbers slide in one direction when you press arrow keys, and when two tiles with the same number collide, they merge into one tile with their sum. The goal is to create a tile with the number 2048, though you can continue playing to achieve higher numbers.",
      zh: "2048是一款令人上瘾的滑动方块谜题游戏，在4×4网格上进行。当你按箭头键时，带有数字的方块向一个方向滑动，当两个具有相同数字的方块相撞时，它们合并成一个具有它们总和的方块。目标是创建一个数字为2048的方块，尽管你可以继续游戏以获得更高的数字。"
    },
    history: {
      en: "2048 was created by Gabriele Cirulli in 2014 as a weekend project and unexpectedly went viral. The game was inspired by 1024 by Veewo Studio and has spawned countless variants and spin-offs.",
      zh: "2048由Gabriele Cirulli于2014年创建，作为周末项目，意外地病毒式传播。该游戏受到Veewo Studio的1024启发，并催生了无数变体和衍生品。"
    },
    howToPlay: [
      "Use arrow keys (or swipe) to slide all tiles in one direction",
      "When two tiles with the same number touch, they merge into their sum",
      "Each move spawns a new tile (2 or 4) in a random empty spot",
      "The goal is to create a tile with 2048",
      "The game ends when no more moves are possible"
    ],
    tips: {
      en: [
        "Keep your highest tile in a corner - ideally build along one edge",
        "Choose a main direction (like right) and a secondary direction (like up)",
        "Avoid moving tiles in the opposite direction of your corner strategy",
        "Build a 'snake' pattern with decreasing numbers along an edge",
        "Plan several moves ahead - don't just react to each new tile"
      ],
      zh: [
        "将你最高的方块保持在角落 - 理想情况下沿一边建立",
        "选择一个主方向（如右）和一个次要方向（如上）",
        "避免向你的角落策略相反的方向移动方块",
        "沿边缘用递减的数字建立'蛇形'模式",
        "提前计划几步 - 不要只是对每个新方块做出反应"
      ]
    },
    faq: [
      {
        question: { en: "Is it possible to always win 2048?", zh: "是否可能总是赢得2048？" },
        answer: { en: "With optimal strategy, reaching 2048 is achievable most of the time. However, bad tile spawns can sometimes make it impossible even for expert players.", zh: "使用最佳策略，大多数情况下可以达到2048。然而，糟糕的方块生成有时甚至使专家玩家也无法完成。" }
      },
      {
        question: { en: "What happens after I reach 2048?", zh: "达到2048后会发生什么？" },
        answer: { en: "You can continue playing to reach higher tiles like 4096, 8192, and beyond. The game only ends when no moves are possible.", zh: "你可以继续游戏以达到更高的方块，如4096、8192等。游戏只有在无法移动时才结束。" }
      },
      {
        question: { en: "What's the highest possible tile?", zh: "最高可能的方块是多少？" },
        answer: { en: "In theory, you can reach the 131,072 tile, but this requires extraordinary skill and luck. The 2048 tile is considered 'winning' the game.", zh: "理论上，你可以达到131,072方块，但这需要非凡的技巧和运气。2048方块被认为是'赢得'游戏。" }
      }
    ]
  },

  // ===== MINESWEEPER =====
  minesweeper: {
    about: {
      en: "Minesweeper is a classic single-player puzzle game where the objective is to clear a rectangular board containing hidden mines without detonating any of them. Numbers reveal how many mines are in adjacent cells, and you use logic to deduce which cells are safe to click and which contain mines.",
      zh: "扫雷是一款经典的单人益智游戏，目标是清除包含隐藏地雷的矩形棋盘而不引爆任何地雷。数字显示相邻单元格中有多少地雷，你使用逻辑推断哪些单元格可以安全点击，哪些包含地雷。"
    },
    history: {
      en: "Minesweeper was popularized by Microsoft Windows, where it was included as a built-in game starting with Windows 3.1 in 1992. The game's origins trace back to mainframe computer games from the 1960s-70s.",
      zh: "扫雷由微软Windows普及，从1992年的Windows 3.1开始作为内置游戏包含。该游戏的起源可追溯到1960-70年代的大型机电脑游戏。"
    },
    howToPlay: [
      "Click on a cell to reveal it - numbers show adjacent mine count",
      "Right-click (or long press) to flag cells you think contain mines",
      "Empty cells automatically reveal adjacent empty cells",
      "Use the numbers to deduce which unrevealed cells are safe",
      "Clear all non-mine cells to win"
    ],
    tips: {
      en: [
        "Start by clicking in the middle - corners have fewer neighbors to help",
        "A '1' touching only one unrevealed cell means that cell is a mine",
        "If a number equals its unrevealed neighbors, all are mines",
        "If flags equal a number, all other neighbors are safe",
        "The 1-2-1 pattern is a common configuration - learn to recognize it"
      ],
      zh: [
        "从中间开始点击 - 角落的邻居较少，帮助不大",
        "只接触一个未揭示单元格的'1'意味着那个单元格是地雷",
        "如果一个数字等于它未揭示的邻居数，所有都是地雷",
        "如果旗帜数等于一个数字，所有其他邻居都是安全的",
        "1-2-1模式是常见配置 - 学会识别它"
      ]
    },
    faq: [
      {
        question: { en: "Is Minesweeper always solvable with logic?", zh: "扫雷总是可以用逻辑解决吗？" },
        answer: { en: "Most positions can be solved with pure logic, but some situations require guessing. Our puzzles are designed to minimize forced guesses.", zh: "大多数位置可以纯用逻辑解决，但有些情况需要猜测。我们的谜题旨在最小化强制猜测。" }
      },
      {
        question: { en: "What does the counter in the corner mean?", zh: "角落的计数器是什么意思？" },
        answer: { en: "It shows the number of mines minus the number of flags placed. This helps track how many mines are still unflagged.", zh: "它显示地雷数减去已放置的旗帜数。这有助于追踪还有多少地雷未被标记。" }
      }
    ]
  },

  // ===== ADD MORE GAMES AS NEEDED =====

  // ===== SLITHERLINK =====
  slitherlink: {
    about: {
      en: "Slitherlink is a logic puzzle where you draw a single continuous loop around a grid of dots. Numbers indicate how many of its four sides are part of the loop. The challenge is to create a loop that never crosses itself and satisfies all number clues. This Japanese puzzle type (also called 'Loop the Loop') offers a unique blend of topology and logic.",
      zh: "连环线是一款逻辑谜题，你在点阵网格周围画一条连续的单一回路。数字表示其四条边中有多少是回路的一部分。挑战是创建一个永不交叉并满足所有数字提示的回路。这种日本谜题类型（也称为'循环回路'）提供了拓扑和逻辑的独特融合。"
    },
    history: {
      en: "Slitherlink was created by Nikoli, the famous Japanese puzzle publisher, in 1989. It has become one of the most beloved Japanese logic puzzles, known for its elegant rules and satisfying solutions.",
      zh: "连环线由著名的日本谜题出版商Nikoli于1989年创建。它已成为最受欢迎的日本逻辑谜题之一，以其优雅的规则和令人满意的解决方案而闻名。"
    },
    howToPlay: [
      "Draw horizontal or vertical lines between adjacent dots to form a loop",
      "Numbers (0-3) indicate how many edges around that cell are part of the loop",
      "The loop must be continuous and never cross or branch",
      "Cells without numbers still constrain the loop",
      "Complete when the loop is closed and satisfies all clues"
    ],
    tips: {
      en: [
        "A '0' means no edges around it are part of the loop - mark them as empty",
        "A '3' in a corner must have two edges going into the corner",
        "Adjacent '3's have a specific pattern - learn to recognize it",
        "Diagonal '3's share an edge that must be part of the loop",
        "Use the rule that the loop can't cross to eliminate possibilities"
      ],
      zh: [
        "'0'意味着它周围没有边是回路的一部分 - 将它们标记为空",
        "角落的'3'必须有两条边进入角落",
        "相邻的'3'有特定模式 - 学会识别它",
        "对角的'3'共享一条必须是回路一部分的边",
        "使用回路不能交叉的规则来消除可能性"
      ]
    },
    faq: [
      {
        question: { en: "Is there always exactly one solution?", zh: "是否总是只有一个解决方案？" },
        answer: { en: "Yes, well-designed Slitherlink puzzles have exactly one unique loop solution. All our puzzles are guaranteed to have a single solution.", zh: "是的，设计良好的连环线谜题有且仅有一个唯一的回路解决方案。我们所有的谜题都保证有单一解决方案。" }
      },
      {
        question: { en: "What's the largest grid size available?", zh: "可用的最大网格尺寸是多少？" },
        answer: { en: "Grids typically range from 5×5 (easy) to 25×25 (expert). Larger grids require more advanced techniques and patience.", zh: "网格通常从5×5（简单）到25×25（专家）不等。较大的网格需要更高级的技巧和耐心。" }
      }
    ]
  },

  // ===== SUGURU =====
  suguru: {
    about: {
      en: "Suguru (also known as Tectonics or Number Blocks) is a Japanese logic puzzle where you fill irregular regions with numbers. Each region of size N must contain numbers 1 through N exactly once. Additionally, no two adjacent cells (including diagonally) can contain the same number, making it a unique blend of Sudoku and region-based puzzles.",
      zh: "数块（也称为构造或数字方块）是一款日本逻辑谜题，你用数字填充不规则区域。每个大小为N的区域必须恰好包含1到N的数字。此外，没有两个相邻单元格（包括对角线）可以包含相同的数字，这使它成为数独和区域谜题的独特融合。"
    },
    history: {
      en: "Suguru was invented by Naoki Inaba and has become popular among logic puzzle enthusiasts for its elegant combination of Sudoku-like rules with irregular grid shapes.",
      zh: "数块由Naoki Inaba发明，因其类似数独的规则与不规则网格形状的优雅结合而在逻辑谜题爱好者中流行。"
    },
    howToPlay: [
      "The grid is divided into outlined regions of various sizes",
      "Fill each region of size N with numbers 1 to N exactly once",
      "No two adjacent cells (including diagonals) can have the same number",
      "Use logic to determine which numbers go where",
      "Complete when all cells are filled correctly"
    ],
    tips: {
      en: [
        "Start with regions of size 1 (they must be 1) and size 2",
        "Look for cells with many neighbors - they have fewer possibilities",
        "If a cell is surrounded by 1,2,3,4, it must be 5",
        "Use the 'no adjacent same number' rule to eliminate possibilities",
        "Small regions constrain larger ones - use this to your advantage"
      ],
      zh: [
        "从大小为1的区域（必须是1）和大小为2的区域开始",
        "寻找有许多邻居的单元格 - 它们的可能性更少",
        "如果一个单元格被1,2,3,4包围，它必须是5",
        "使用'没有相邻相同数字'规则来消除可能性",
        "小区域约束大区域 - 利用这一点"
      ]
    },
    faq: [
      {
        question: { en: "How is Suguru different from Sudoku?", zh: "数块和数独有什么区别？" },
        answer: { en: "Suguru has irregular regions instead of 3×3 boxes, and the no-adjacent-same-number rule applies diagonally too. This creates different solving strategies.", zh: "数块有不规则区域而不是3×3方格，而且不相邻同数规则也适用于对角线。这创造了不同的解决策略。" }
      }
    ]
  },

  // ===== KAKURO =====
  kakuro: {
    about: {
      en: "Kakuro (also called Cross Sums) is a mathematical crossword puzzle that combines elements of Sudoku and crosswords. Fill the grid with digits 1-9 so that the numbers in each block sum to the clue shown, without repeating any digit within a block. It's like a crossword where words are replaced by numbers that add up.",
      zh: "数和（也称为求和填字）是一款数学填字谜题，结合了数独和填字游戏的元素。用数字1-9填充网格，使每个方块中的数字总和等于显示的提示，方块内不重复任何数字。这就像填字游戏，但单词被加起来的数字取代。"
    },
    history: {
      en: "Kakuro originated in the United States in the 1950s but became a phenomenon in Japan, where it got its current name. It's often considered the next step for Sudoku lovers looking for more challenge.",
      zh: "数和起源于1950年代的美国，但在日本成为现象，并得到了现在的名字。它通常被认为是寻求更多挑战的数独爱好者的下一步。"    },
    howToPlay: [
      "Fill white cells with digits 1-9",
      "Numbers at the top of each block = sum of digits below",
      "Numbers at the left of each block = sum of digits to the right",
      "No digit can repeat within a single sum block",
      "Use math and logic to determine the correct combinations"
    ],
    tips: {
      en: [
        "Learn common sum combinations: 3=1+2, 4=1+3, 17=8+9, etc.",
        "The sum of 45 appears in complete rows/columns of 9 cells",
        "Blocks with unique combinations (like sum 16 in 2 cells = 7+9) are key starting points",
        "Use process of elimination when a digit must appear somewhere",
        "Keep track of which digits you've used in each block"
      ],
      zh: [
        "学习常见总和组合：3=1+2, 4=1+3, 17=8+9等",
        "45的总和出现在完整的9格行/列中",
        "具有唯一组合的方块（如2格总和16=7+9）是关键起点",
        "当一个数字必须出现在某处时使用排除法",
        "记录你在每个方块中使用了哪些数字"
      ]
    },
    faq: [
      {
        question: { en: "What's the difference between Kakuro and Sudoku?", zh: "数和和数独有什么区别？" },
        answer: { en: "Kakuro requires arithmetic (sums) while Sudoku is pure logic. Kakuro also has variable-length 'words' instead of a fixed 9-cell row/column structure.", zh: "数和需要算术（求和）而数独是纯逻辑。数和也有可变长度的'词'而不是固定的9格行/列结构。" }
      },
      {
        question: { en: "Do I need to be good at math to play Kakuro?", zh: "我需要擅长数学才能玩数和吗？" },
        answer: { en: "Basic addition is all you need. The challenge is logical deduction, not calculation. Many players memorize common sum combinations.", zh: "只需要基本的加法。挑战是逻辑推理，而不是计算。许多玩家记住常见的总和组合。" }
      }
    ]
  },

  // ===== MASTERMIND =====
  mastermind: {
    about: {
      en: "Mastermind is a classic code-breaking board game where you try to crack a hidden sequence of colored pegs. After each guess, you receive feedback: black pegs for correct color in correct position, and white pegs for correct color in wrong position. Use deduction and strategy to break the code within the allowed attempts.",
      zh: "密码破译是一款经典的破解密码棋盘游戏，你尝试破解隐藏的颜色序列。每次猜测后，你会收到反馈：黑色表示颜色和位置都正确，白色表示颜色正确但位置错误。在允许的尝试次数内使用推理和策略破解密码。"
    },
    history: {
      en: "Mastermind was invented in 1970 by Mordecai Meirowitz and became one of the most popular board games of the 1970s-80s. It has been adapted into countless digital versions and remains a classic test of logical thinking.",
      zh: "密码破译由Mordecai Meirowitz于1970年发明，成为1970-80年代最受欢迎的棋盘游戏之一。它已被改编成无数数字版本，仍然是逻辑思维的经典测试。"    },
    howToPlay: [
      "The computer creates a secret code of 4 colors",
      "Make your guess by selecting 4 colors",
      "Black pegs (●) = correct color in correct position",
      "White pegs (○) = correct color in wrong position",
      "Crack the code within 8 attempts to win"
    ],
    tips: {
      en: [
        "Start with 2-2 pattern (e.g., Red-Red-Blue-Blue) to maximize information",
        "Pay attention to the total feedback count - it tells you how many of each color",
        "If you get 4 white pegs and 0 black, all colors are right but all positions are wrong",
        "Systematically test each color rather than random guessing",
        "The Knuth algorithm guarantees solving any code in 5 moves or less"
      ],
      zh: [
        "从2-2模式开始（如红-红-蓝-蓝）以最大化信息",
        "注意总反馈数量 - 它告诉你每种颜色有多少个",
        "如果你得到4个白色和0个黑色，所有颜色都对但所有位置都错",
        "系统地测试每种颜色而不是随机猜测",
        "Knuth算法保证在5步或更少步内解决任何密码"
      ]
    },
    faq: [
      {
        question: { en: "What's the optimal strategy for Mastermind?", zh: "密码破译的最佳策略是什么？" },
        answer: { en: "The Knuth algorithm is proven optimal, solving any code in 5 moves or less. For casual play, systematically test colors and use the feedback to eliminate possibilities.", zh: "Knuth算法被证明是最佳的，可以在5步或更少步内解决任何密码。对于休闲游戏，系统地测试颜色并使用反馈来消除可能性。" }
      },
      {
        question: { en: "Can colors repeat in the code?", zh: "密码中的颜色可以重复吗？" },
        answer: { en: "Yes, in our version colors can repeat. This makes the game more challenging as there are more possible combinations to consider.", zh: "是的，在我们的版本中颜色可以重复。这使游戏更具挑战性，因为有更多可能的组合需要考虑。" }
      }
    ]
  },

  // ===== TETRIS =====
  tetris: {
    about: {
      en: "Tetris is the world-famous block-stacking puzzle game where falling tetrominoes (shapes made of 4 blocks) must be arranged to complete horizontal lines. When a line is complete, it disappears, earning points and making room for more pieces. The game speeds up as you progress, creating an increasingly intense challenge.",
      zh: "俄罗斯方块是世界著名的方块堆叠益智游戏，下落的四格骨牌（由4个方块组成的形状）必须被安排来完成水平线。当一行完成时，它会消失，获得积分并为更多方块腾出空间。随着游戏进展，速度会加快，创造出越来越激烈的挑战。"
    },
    history: {
      en: "Tetris was created by Soviet software engineer Alexey Pajitnov in 1984. It became a global phenomenon after being bundled with the Nintendo Game Boy in 1989. With over 500 million copies sold, it's one of the best-selling video games of all time.",
      zh: "俄罗斯方块由苏联软件工程师阿列克谢·帕基特诺夫于1984年创建。1989年与任天堂Game Boy捆绑销售后成为全球现象。销量超过5亿份，是有史以来最畅销的视频游戏之一。"
    },
    howToPlay: [
      "Tetrominoes fall from the top of the screen",
      "Use arrow keys to move and rotate pieces",
      "Complete horizontal lines to clear them and score points",
      "The game speeds up as you clear more lines",
      "Game ends when blocks reach the top"
    ],
    tips: {
      en: [
        "Keep the playing field flat - avoid creating holes under overhangs",
        "Use 'hold' feature to save pieces for later",
        "Plan for the I-piece (line) to save it for clearing 4 lines (Tetris)",
        "Leave one column open on the side for I-pieces",
        "Practice 'T-spins' for advanced scoring"
      ],
      zh: [
        "保持游戏场地平整 - 避免在突出部分下创造洞",
        "使用'保存'功能将方块留到以后使用",
        "计划好I方块（线），用它来清除4行（Tetris）",
        "在侧面留一列开放给I方块",
        "练习'T-spin'以获得高级得分"
      ]
    },
    faq: [
      {
        question: { en: "What is a Tetris?", zh: "什么是Tetris？" },
        answer: { en: "A Tetris is clearing 4 lines at once using an I-piece. This scores the most points and is the most satisfying move in the game.", zh: "Tetris是使用I方块一次清除4行。这得分最高，是游戏中最令人满足的移动。" }
      },
      {
        question: { en: "How can I improve my Tetris skills?", zh: "如何提高俄罗斯方块技能？" },
        answer: { en: "Start by practicing piece rotation and placement. Learn to use the 'next' preview to plan ahead. Eventually, learn advanced techniques like T-spins and combo chains.", zh: "从练习方块旋转和放置开始。学会使用'下一个'预览来提前计划。最终，学习T-spin和连击链等高级技巧。" }
      }
    ]
  },

  // ===== MEMORY =====
  memory: {
    about: {
      en: "Memory Match is a classic card-matching game that tests and trains your memory. Cards are placed face-down, and you flip two at a time trying to find matching pairs. The goal is to match all pairs in as few moves as possible, training your visual memory and concentration.",
      zh: "记忆翻牌是一款经典的卡片配对游戏，测试和训练你的记忆力。卡片面朝下放置，你每次翻两张试图找到配对。目标是用尽可能少的步数配对所有对子，训练你的视觉记忆和专注力。"
    },
    history: {
      en: "The memory card game has existed in various forms for centuries. The modern Concentration game became popular in the 1950s and has since been adapted into countless digital versions. It's widely used in cognitive training and education.",
      zh: "记忆卡片游戏以各种形式存在了几个世纪。现代的专注游戏在1950年代流行起来，此后被改编成无数数字版本。它广泛用于认知训练和教育。"
    },
    howToPlay: [
      "All cards start face-down",
      "Click to flip two cards",
      "If they match, they stay revealed",
      "If they don't match, they flip back",
      "Find all pairs to win"
    ],
    tips: {
      en: [
        "Flip cards in a consistent pattern to remember positions better",
        "Say the card contents out loud to engage multiple memory systems",
        "Create mental stories connecting matching pairs",
        "Start with a quick scan of a few cards to get initial information",
        "Practice regularly - memory can be improved with training"
      ],
      zh: [
        "以一致的模式翻牌以更好地记住位置",
        "大声说出卡片内容以激活多个记忆系统",
        "创建连接配对的心理故事",
        "开始时快速扫描几张卡片以获取初始信息",
        "定期练习 - 记忆力可以通过训练提高"
      ]
    },
    faq: [
      {
        question: { en: "Does this game actually improve memory?", zh: "这个游戏真的能提高记忆力吗？" },
        answer: { en: "Yes, Memory Match trains visual memory and concentration. Regular practice can improve your ability to remember patterns and locations, though it primarily trains the specific skill of visual memory.", zh: "是的，记忆翻牌训练视觉记忆和专注力。定期练习可以提高你记住模式和位置的能力，尽管它主要训练视觉记忆这项特定技能。" }
      },
      {
        question: { en: "What's a good score?", zh: "什么是好成绩？" },
        answer: { en: "A perfect game matches all pairs without any mismatches. For a 4x4 grid (8 pairs), under 12 moves is excellent. For harder levels, focus on improvement rather than absolute scores.", zh: "完美的游戏是在没有任何不匹配的情况下配对所有对子。对于4x4网格（8对），12步以下是优秀的。对于更难的级别，专注于进步而不是绝对分数。" }
      }
    ]
  },

  // ===== CONNECT FOUR =====
  connectfour: {
    about: {
      en: "Connect Four is a two-player strategy game where players take turns dropping colored discs into a vertical grid. The goal is to be the first to connect four of your discs in a row - horizontally, vertically, or diagonally. Simple rules but deep strategy make this a classic for all ages.",
      zh: "四子棋是一款双人策略游戏，玩家轮流将彩色圆盘放入垂直网格中。目标是第一个在水平、垂直或对角线方向连成四个圆盘。简单的规则但深刻的策略使这款游戏成为适合所有年龄的经典。"
    },
    history: {
      en: "Connect Four was first sold by Milton Bradley in 1974. It has since become one of the most popular family games worldwide. The game is mathematically solved - with perfect play, the first player can always win.",
      zh: "四子棋于1974年由Milton Bradley首次销售。此后成为全球最受欢迎的家庭游戏之一。这个游戏在数学上已被解决 - 如果双方完美游戏，先手玩家总能获胜。"
    },
    howToPlay: [
      "Two players take turns",
      "Click a column to drop your disc",
      "Discs fall to the lowest available position",
      "Connect 4 discs in a row to win (horizontal, vertical, or diagonal)",
      "The first to connect 4 wins!"
    ],
    tips: {
      en: [
        "Control the center column - it offers the most winning possibilities",
        "Try to create 'double threats' - two ways to win simultaneously",
        "Block your opponent's potential connections early",
        "Look for 'forced win' patterns 3-4 moves ahead",
        "Avoid playing directly below a winning square for your opponent"
      ],
      zh: [
        "控制中间列 - 它提供最多的获胜可能性",
        "尝试创建'双重威胁' - 同时有两种获胜方式",
        "尽早阻止对手的潜在连接",
        "提前3-4步寻找'强制获胜'模式",
        "避免直接在对手获胜格子下方落子"
      ]
    },
    faq: [
      {
        question: { en: "Does the first player have an advantage?", zh: "先手玩家有优势吗？" },
        answer: { en: "Yes, with perfect play the first player can always force a win. However, in casual play, this advantage is small and skill matters more than turn order.", zh: "是的，如果双方完美游戏，先手玩家总能强制获胜。然而，在休闲游戏中，这个优势很小，技能比先手顺序更重要。" }
      },
      {
        question: { en: "How can I get better at Connect Four?", zh: "如何提高四子棋水平？" },
        answer: { en: "Practice recognizing patterns, especially 'double threat' setups. Learn to think several moves ahead. Watch how winning positions develop and learn to create them yourself.", zh: "练习识别模式，特别是'双重威胁'设置。学会提前几步思考。观察获胜位置是如何发展的，学会自己创造它们。" }
      }
    ]
  },

  // ===== 15 PUZZLE =====
  fifteenpuzzle: {
    about: {
      en: "The 15 Puzzle is a classic sliding tile puzzle consisting of a 4×4 grid with 15 numbered tiles and one empty space. The goal is to arrange the tiles in numerical order by sliding them into the empty space. This seemingly simple puzzle has fascinated players for over a century.",
      zh: "15数字推盘是一款经典的滑动方块谜题，由4×4网格组成，有15个编号方块和一个空格。目标是通过将方块滑动到空格中，将方块按数字顺序排列。这个看似简单的谜题已经吸引了玩家一个多世纪。"
    },
    history: {
      en: "The 15 Puzzle was created in 1874 by Noyes Palmer Chapman. It became a worldwide craze in 1880, similar to the Rubik's Cube phenomenon a century later. Mathematicians have proven that exactly half of all possible starting positions are unsolvable.",
      zh: "15数字推盘由Noyes Palmer Chapman于1874年创建。1880年成为全球热潮，就像一个世纪后的魔方现象一样。数学家已经证明，恰好一半的可能起始位置是不可解的。"
    },
    howToPlay: [
      "The grid has 15 numbered tiles and one empty space",
      "Click a tile adjacent to the empty space to slide it",
      "Arrange tiles in order from 1-15, with empty space at bottom-right",
      "Plan your moves carefully - each move affects multiple tiles",
      "Complete the puzzle as quickly as possible"
    ],
    tips: {
      en: [
        "Solve the puzzle row by row, starting from the top",
        "Don't worry about the last two numbers in each row until the row is almost complete",
        "Learn the 'corner technique' for placing the 4th and 8th tiles",
        "For the bottom two rows, solve columns instead of rows",
        "Practice the final 2×3 arrangement - it's the hardest part"
      ],
      zh: [
        "逐行解决谜题，从顶部开始",
        "不要担心每行的最后两个数字，直到该行几乎完成",
        "学习'角落技巧'来放置第4和第8个方块",
        "对于底部两行，按列而不是按行解决",
        "练习最后的2×3排列 - 这是最难的部分"
      ]
    },
    faq: [
      {
        question: { en: "Are all 15 puzzles solvable?", zh: "所有15数字推盘都可以解决吗？" },
        answer: { en: "No, exactly half of all possible configurations are unsolvable. The solvability depends on the number of 'inversions' in the starting position. Our puzzles are guaranteed to be solvable.", zh: "不，恰好一半的可能配置是不可解的。可解性取决于起始位置的'逆序'数。我们的谜题保证可以解决。" }
      },
      {
        question: { en: "What's the minimum number of moves needed?", zh: "最少需要多少步？" },
        answer: { en: "The optimal solution can require up to 80 moves for difficult configurations. Speed solvers average around 60 moves. Focus on solving efficiently rather than minimizing moves as a beginner.", zh: "对于困难配置，最佳解决方案可能需要多达80步。速解者平均约60步。作为初学者，专注于高效解决而不是最小化步数。" }
      }
    ]
  },

  // ===== BINARY / TAKUZU =====
  binary: {
    about: {
      en: "Binary (also known as Takuzu or Binairo) is a logic puzzle played on a grid where you fill cells with 0s and 1s. The rules are simple: each row and column must contain equal numbers of 0s and 1s, no more than two of the same number can be adjacent, and each row and column must be unique.",
      zh: "0和1（也称为Takuzu或二进制）是一款在网格上玩的逻辑谜题，你用0和1填充单元格。规则很简单：每行和每列必须包含相等数量的0和1，不能有两个以上相同数字相邻，每行和每列必须是唯一的。"
    },
    history: {
      en: "Binary puzzles were invented by Peter De Schepper and Peter Fraeyman in 2009. The simple rules but deep logic have made them popular in newspapers and puzzle magazines worldwide.",
      zh: "0和1谜题由Peter De Schepper和Peter Fraeyman于2009年发明。简单的规则但深刻的逻辑使它们在世界各地的报纸和谜题杂志中流行。"
    },
    howToPlay: [
      "Fill each cell with either 0 or 1",
      "Each row and column must have equal 0s and 1s",
      "No more than two of the same number can be adjacent horizontally or vertically",
      "Each row must be unique, and each column must be unique",
      "Use logic to deduce the correct arrangement"
    ],
    tips: {
      en: [
        "If two same numbers are adjacent, the cells next to them must be the opposite",
        "If a row has n/2 of one number, the rest must be the other number",
        "Look for forced moves first - cells that can only be one value",
        "Avoid creating patterns that would violate the uniqueness rule",
        "Check your work frequently - one wrong cell can cascade"
      ],
      zh: [
        "如果两个相同数字相邻，它们旁边的单元格必须是相反的",
        "如果一行有n/2个某种数字，其余必须是另一种数字",
        "首先寻找强制移动 - 只能是一个值的单元格",
        "避免创建会违反唯一性规则的模式",
        "经常检查你的工作 - 一个错误的单元格会级联影响"
      ]
    },
    faq: [
      {
        question: { en: "How is Binary different from Sudoku?", zh: "0和1和数独有什么区别？" },
        answer: { en: "Binary only uses 0 and 1 (or two colors), focuses on adjacency rules rather than unique values in regions, and has the additional uniqueness constraint for rows and columns.", zh: "0和1只使用0和1（或两种颜色），专注于相邻规则而不是区域中的唯一值，并且对行和列有额外的唯一性约束。" }
      },
      {
        question: { en: "What grid sizes are available?", zh: "有哪些网格尺寸？" },
        answer: { en: "Common sizes are 6×6 (easy), 8×8 (medium), and 10×10 (hard). Larger grids require more careful planning and pattern recognition.", zh: "常见尺寸是6×6（简单）、8×8（中等）和10×10（困难）。较大的网格需要更仔细的计划和模式识别。" }
      }
    ]
  },

  // ===== SKYSCRAPERS =====
  skyscrapers: {
    about: {
      en: "Skyscrapers is a logic puzzle where you place buildings of different heights on a grid. Numbers outside the grid indicate how many buildings are visible from that direction. Taller buildings block shorter ones behind them. This Latin square variant offers a unique spatial reasoning challenge.",
      zh: "摩天大楼是一款逻辑谜题，你在网格上放置不同高度的建筑。网格外的数字表示从该方向可以看到多少建筑。较高的建筑会挡住后面较矮的建筑。这种拉丁方阵变体提供了独特的空间推理挑战。"
    },
    history: {
      en: "Skyscrapers puzzles are believed to have originated in Japan in the late 20th century. They have gained popularity in puzzle competitions and logic puzzle magazines for their elegant combination of Latin square rules with visibility constraints.",
      zh: "摩天大楼谜题被认为起源于20世纪后期的日本。它们在谜题竞赛和逻辑谜题杂志中越来越受欢迎，因为它们优雅地结合了拉丁方阵规则和可见性约束。"
    },
    howToPlay: [
      "Place buildings numbered 1-N in each row and column",
      "Each row and column contains each number exactly once (Latin square)",
      "Clues outside the grid show how many buildings are visible",
      "Taller buildings block visibility of shorter buildings behind them",
      "Satisfy all visibility clues to solve the puzzle"
    ],
    tips: {
      en: [
        "A clue of 1 means the tallest building (N) is right in front",
        "A clue of N means buildings are in ascending order from that side",
        "Start by placing the tallest buildings (N) - they can only go where clue is 1",
        "Look for cells that must contain specific values based on visibility",
        "Use process of elimination - some positions become impossible based on clues"
      ],
      zh: [
        "提示1意味着最高的建筑（N）就在前面",
        "提示N意味着建筑从那一侧按升序排列",
        "从放置最高建筑（N）开始 - 它们只能放在提示为1的地方",
        "寻找必须包含特定值的单元格基于可见性",
        "使用排除法 - 根据提示某些位置变得不可能"
      ]
    },
    faq: [
      {
        question: { en: "What happens when a clue is 1?", zh: "当提示是1时会发生什么？" },
        answer: { en: "A clue of 1 means the tallest building is in the first position from that direction, blocking all other buildings from view.", zh: "提示1意味着最高的建筑在该方向的第一个位置，挡住了所有其他建筑的视野。" }
      },
      {
        question: { en: "How do I determine building heights?", zh: "如何确定建筑高度？" },
        answer: { en: "Use the visibility clues combined with Latin square constraints. If a 4x4 grid has a clue of 4, the buildings must be 1-2-3-4 from that direction.", zh: "使用可见性提示结合拉丁方阵约束。如果4x4网格有提示4，建筑从那个方向必须是1-2-3-4。" }
      }
    ]
  }
}

/**
 * Get SEO content for a specific game
 */
export function getGameContent(gameId: string): GameContentData | undefined {
  return gameContentData[gameId]
}

/**
 * Get list of games that have content available
 */
export function getGamesWithContent(): string[] {
  return Object.keys(gameContentData)
}
