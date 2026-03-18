import { useEffect } from 'react'

type PageMeta = {
  title: string
  description: string
  keywords?: string
}

const gameMetas: Record<string, { en: PageMeta; zh: PageMeta }> = {
  wordle: {
    en: {
      title: 'Word Guess - RuleWord | Free Online Word Game',
      description: 'Play Word Guess for free! Guess the 5-letter word in 6 tries. Daily challenges and unlimited practice mode available.',
      keywords: 'wordle, word game, puzzle game, free online game, daily challenge'
    },
    zh: {
      title: '猜词游戏 - RuleWord | 免费在线文字游戏',
      description: '免费玩猜词游戏！6次机会猜出成语。每日挑战和无限练习模式。',
      keywords: '猜词游戏, 成语游戏, 文字游戏, 免费在线游戏, 每日挑战'
    }
  },
  crosswordle: {
    en: {
      title: 'Crosswordle - RuleWord | Free Word Swap Puzzle',
      description: 'Play Crosswordle for free! Swap letters to solve crossword puzzles. Multiple grid sizes and daily challenges.',
      keywords: 'crosswordle, crossword, word puzzle, letter swap, free game'
    },
    zh: {
      title: '填字游戏 - RuleWord | 免费字母交换谜题',
      description: '免费玩填字游戏！通过交换字母解开填字谜题。多种网格大小和每日挑战。',
      keywords: '填字游戏, 字母交换, 文字谜题, 免费游戏'
    }
  },
  sudoku: {
    en: {
      title: 'Sudoku - RuleWord | Free Online Sudoku Puzzle',
      description: 'Play Sudoku for free! Classic 9x9 number logic puzzle with 4 difficulty levels. Daily challenges and hints available.',
      keywords: 'sudoku, number puzzle, logic game, free sudoku, daily challenge'
    },
    zh: {
      title: '数独 - RuleWord | 免费在线数独游戏',
      description: '免费玩数独！经典9x9数字逻辑谜题，4种难度级别。每日挑战和提示功能。',
      keywords: '数独, 数字谜题, 逻辑游戏, 免费数独, 每日挑战'
    }
  },
  mastermind: {
    en: {
      title: 'Mastermind - RuleWord | Free Code Breaking Game',
      description: 'Play Mastermind for free! Crack the 4-color code in 8 tries. Test your logic and deduction skills.',
      keywords: 'mastermind, code breaking, logic game, color puzzle, free game'
    },
    zh: {
      title: '密码破译 - RuleWord | 免费密码破解游戏',
      description: '免费玩密码破译！8次机会破解4色密码。测试你的逻辑和推理能力。',
      keywords: '密码破译, 破解游戏, 逻辑游戏, 颜色谜题, 免费游戏'
    }
  },
  minesweeper: {
    en: {
      title: 'Minesweeper - RuleWord | Free Classic Minesweeper',
      description: 'Play Minesweeper for free! Classic mine-finding puzzle game with 3 difficulty levels. Daily challenges available.',
      keywords: 'minesweeper, mine game, classic puzzle, free minesweeper'
    },
    zh: {
      title: '扫雷 - RuleWord | 免费经典扫雷游戏',
      description: '免费玩扫雷！经典扫雷益智游戏，3种难度级别。支持每日挑战。',
      keywords: '扫雷, 扫雷游戏, 经典谜题, 免费扫雷'
    }
  },
  game2048: {
    en: {
      title: '2048 - RuleWord | Free Online 2048 Game',
      description: 'Play 2048 for free! Merge numbers to reach 2048. Addictive puzzle game with daily challenges.',
      keywords: '2048, number game, merge game, puzzle, free 2048'
    },
    zh: {
      title: '2048 - RuleWord | 免费在线2048游戏',
      description: '免费玩2048！合并数字达到2048。令人上瘾的益智游戏，支持每日挑战。',
      keywords: '2048, 数字游戏, 合并游戏, 益智游戏, 免费2048'
    }
  },
  snake: {
    en: {
      title: 'Snake - RuleWord | Free Classic Snake Game',
      description: 'Play Snake for free! Classic arcade game with modern controls. Grow your snake and beat your high score!',
      keywords: 'snake game, classic arcade, retro game, free snake'
    },
    zh: {
      title: '贪吃蛇 - RuleWord | 免费经典贪吃蛇游戏',
      description: '免费玩贪吃蛇！经典街机游戏，现代化控制。让你的蛇变长，打破最高分！',
      keywords: '贪吃蛇, 经典街机, 复古游戏, 免费贪吃蛇'
    }
  },
  memory: {
    en: {
      title: 'Memory Match - RuleWord | Free Card Matching Game',
      description: 'Play Memory Match for free! Flip cards to find matching pairs. 3 difficulty levels to test your memory.',
      keywords: 'memory game, card matching, memory training, free game'
    },
    zh: {
      title: '记忆翻牌 - RuleWord | 免费卡片配对游戏',
      description: '免费玩记忆翻牌！翻转卡片找到配对。3种难度级别测试你的记忆力。',
      keywords: '记忆游戏, 卡片配对, 记忆训练, 免费游戏'
    }
  },
  tetris: {
    en: {
      title: 'Tetris - RuleWord | Free Classic Tetris Game',
      description: 'Play Tetris for free! Classic block stacking puzzle game. Clear lines and beat your high score!',
      keywords: 'tetris, block game, puzzle game, classic arcade, free tetris'
    },
    zh: {
      title: '俄罗斯方块 - RuleWord | 免费经典俄罗斯方块',
      description: '免费玩俄罗斯方块！经典方块堆叠益智游戏。消除行，打破最高分！',
      keywords: '俄罗斯方块, 方块游戏, 益智游戏, 经典街机, 免费俄罗斯方块'
    }
  },
  tictactoe: {
    en: {
      title: 'Tic-Tac-Toe - RuleWord | Free Classic Strategy Game',
      description: 'Play Tic-Tac-Toe for free! Classic X and O strategy game. Play against AI or a friend!',
      keywords: 'tic tac toe, x and o, strategy game, classic game, free game'
    },
    zh: {
      title: '井字棋 - RuleWord | 免费经典策略游戏',
      description: '免费玩井字棋！经典X和O策略游戏。与AI或朋友对战！',
      keywords: '井字棋, 圈叉棋, 策略游戏, 经典游戏, 免费游戏'
    }
  },
  connectfour: {
    en: {
      title: 'Connect Four - RuleWord | Free Strategy Game',
      description: 'Play Connect Four for free! Drop discs to connect 4 in a row. Classic strategy game for all ages.',
      keywords: 'connect four, connect 4, strategy game, board game, free game'
    },
    zh: {
      title: '四子棋 - RuleWord | 免费策略游戏',
      description: '免费玩四子棋！投下圆盘连成四子。适合所有年龄的经典策略游戏。',
      keywords: '四子棋, 策略游戏, 棋盘游戏, 免费游戏'
    }
  },
  whackamole: {
    en: {
      title: 'Whack-a-Mole - RuleWord | Free Reflex Game',
      description: 'Play Whack-a-Mole for free! Hit moles as they pop up. Test your reflexes and beat your high score!',
      keywords: 'whack a mole, reflex game, arcade game, free game'
    },
    zh: {
      title: '打地鼠 - RuleWord | 免费反应游戏',
      description: '免费玩打地鼠！在鼹鼠冒出时击打它们。测试你的反应速度，打破最高分！',
      keywords: '打地鼠, 反应游戏, 街机游戏, 免费游戏'
    }
  },
  simonsays: {
    en: {
      title: 'Simon Says - RuleWord | Free Memory Game',
      description: 'Play Simon Says for free! Watch and repeat color sequences. Test your memory with this classic game.',
      keywords: 'simon says, memory game, color sequence, classic game, free game'
    },
    zh: {
      title: '西蒙说 - RuleWord | 免费记忆游戏',
      description: '免费玩西蒙说！观看并重复颜色序列。用这款经典游戏测试你的记忆力。',
      keywords: '西蒙说, 记忆游戏, 颜色序列, 经典游戏, 免费游戏'
    }
  },
  fifteenpuzzle: {
    en: {
      title: '15 Puzzle - RuleWord | Free Sliding Puzzle',
      description: 'Play 15 Puzzle for free! Slide numbered tiles to arrange them in order. Classic logic puzzle game.',
      keywords: '15 puzzle, sliding puzzle, number puzzle, logic game, free game'
    },
    zh: {
      title: '15数字推盘 - RuleWord | 免费滑动谜题',
      description: '免费玩15数字推盘！滑动数字方块将它们按顺序排列。经典逻辑益智游戏。',
      keywords: '15数字推盘, 滑动谜题, 数字谜题, 逻辑游戏, 免费游戏'
    }
  },
  lightsout: {
    en: {
      title: 'Lights Out - RuleWord | Free Logic Puzzle',
      description: 'Play Lights Out for free! Turn off all lights by toggling them. Challenging logic puzzle game.',
      keywords: 'lights out, logic puzzle, brain teaser, free game'
    },
    zh: {
      title: '熄灯游戏 - RuleWord | 免费逻辑谜题',
      description: '免费玩熄灯游戏！通过切换关闭所有灯泡。挑战性逻辑益智游戏。',
      keywords: '熄灯游戏, 逻辑谜题, 脑力游戏, 免费游戏'
    }
  },
  brickbreaker: {
    en: {
      title: 'Brick Breaker - RuleWord | Free Classic Arcade Game',
      description: 'Play Brick Breaker for free! Bounce the ball to destroy all bricks. Classic arcade action game.',
      keywords: 'brick breaker, breakout, arcade game, classic game, free game'
    },
    zh: {
      title: '打砖块 - RuleWord | 免费经典街机游戏',
      description: '免费玩打砖块！反弹球摧毁所有砖块。经典街机动作游戏。',
      keywords: '打砖块, 弹球游戏, 街机游戏, 经典游戏, 免费游戏'
    }
  },
  bullpen: {
    en: {
      title: 'Bullpen - RuleWord | Free Logic Puzzle Game',
      description: 'Play Bullpen for free! A clean logic puzzle where every bull must be placed just right. Like Sudoku meets Minesweeper.',
      keywords: 'bullpen, logic puzzle, deduction game, sudoku-like, free puzzle game'
    },
    zh: {
      title: '牛栏逻辑 - RuleWord | 免费逻辑益智游戏',
      description: '免费玩牛栏逻辑！简洁的逻辑益智游戏，每头公牛都必须精确放置. 就像数独与扫雷的结合.',
      keywords: '牛栏逻辑, 逻辑谜题, 推理游戏, 类数独, 免费益智游戏'
    }
  },
  dictionary: {
    en: {
      title: 'Dictionary - RuleWord | Free Online Dictionary',
      description: 'Search words and idioms in our free dictionary. Browse definitions, examples, and more.',
      keywords: 'dictionary, word definitions, idioms, free dictionary'
    },
    zh: {
      title: '词典 - RuleWord | 免费在线词典',
      description: '在我们的免费词典中搜索单词和成语。浏览定义、示例等。',
      keywords: '词典, 单词定义, 成语, 免费词典'
    }
  }
}

const defaultMeta: PageMeta = {
  title: 'RuleWord - Free Online Mini Games Collection',
  description: 'Play 17+ free online mini games: Wordle, Sudoku, 2048, Tetris, Snake, Minesweeper and more! No download required.',
  keywords: 'free online games, word games, puzzle games, sudoku, tetris, snake, 2048'
}

export function usePageMeta(gameId?: string, language: 'en' | 'zh' = 'en') {
  useEffect(() => {
    const meta = gameId && gameMetas[gameId]
      ? gameMetas[gameId][language]
      : defaultMeta

    // Update title
    document.title = meta.title

    // Update or create meta description
    let descriptionMeta = document.querySelector('meta[name="description"]')
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta')
      descriptionMeta.setAttribute('name', 'description')
      document.head.appendChild(descriptionMeta)
    }
    descriptionMeta.setAttribute('content', meta.description)

    // Update or create meta keywords
    if (meta.keywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]')
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta')
        keywordsMeta.setAttribute('name', 'keywords')
        document.head.appendChild(keywordsMeta)
      }
      keywordsMeta.setAttribute('content', meta.keywords)
    }

    // Update og:title and og:description
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', meta.title)

    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', meta.description)

  }, [gameId, language])
}
