import { useEffect, useState, ComponentType } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type GameWrapperProps = {
  gameId: string
  gameName: string
  gameSlug: string
}

// 动态导入所有游戏组件 - 文件名匹配实际存在的文件
const gameComponents: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  'sudoku': () => import('./games/Sudoku'),
  'game2048': () => import('./games/Game2048'),
  'mastermind': () => import('./games/Mastermind'),
  'minesweeper': () => import('./games/Minesweeper'),
  'tetris': () => import('./games/Tetris'),
  'snake': () => import('./games/Snake'),
  'crosswordle': () => import('./games/Crosswordle'),
  'wordsearch': () => import('./games/WordSearch'),
  'hangman': () => import('./games/Hangman'),
  'memory': () => import('./games/Memory'),
  'tictactoe': () => import('./games/TicTacToe'),
  'connectfour': () => import('./games/ConnectFour'),
  'whackamole': () => import('./games/WhackAMole'),
  'simonsays': () => import('./games/SimonSays'),
  'numbermemory': () => import('./games/NumberMemory'),
  'patternmemory': () => import('./games/PatternMemory'),
  'fifteenpuzzle': () => import('./games/FifteenPuzzle'),
  'lightsout': () => import('./games/LightsOut'),
  'brickbreaker': () => import('./games/BrickBreaker'),
  'bullpen': () => import('./games/Bullpen'),
  'nonogram': () => import('./games/Nonogram'),
  'kakuro': () => import('./games/Kakuro'),
  'hitori': () => import('./games/Hitori'),
  'skyscrapers': () => import('./games/Skyscrapers'),
  'kenken': () => import('./games/KenKen'),
  'threes': () => import('./games/Threes'),
  'suguru': () => import('./games/Suguru'),
  'hashiwokakero': () => import('./games/Hashiwokakero'),
  'slitherlink': () => import('./games/Slitherlink'),
  'binary': () => import('./games/Binary'),
  'nurikabe': () => import('./games/Nurikabe'),
  'starbattle': () => import('./games/StarBattle'),
  'reversi': () => import('./games/Reversi'),
  'gomoku': () => import('./games/Gomoku'),
  'checkers': () => import('./games/Checkers'),
  'dotsandboxes': () => import('./games/DotsAndBoxes'),
  'wordlist': () => import('./games/WordList'),
  'reactiontest': () => import('./games/ReactionTest'),
  'simongame': () => import('./games/SimonGame'),
  'anagrams': () => import('./games/Anagrams'),
  'nim': () => import('./games/Nim'),
  'boggle': () => import('./games/Boggle'),
  'heyawake': () => import('./games/Heyawake'),
  'masyu': () => import('./games/Masyu'),
  'fillomino': () => import('./games/Fillomino'),
  'pong': () => import('./games/Pong'),
  'frogger': () => import('./games/Frogger'),
  'yajilin': () => import('./games/Yajilin'),
  'castlewall': () => import('./games/CastleWall'),
  'shakashaka': () => import('./games/Shakashaka'),
  'aqre': () => import('./games/Aqre'),
  'tapa': () => import('./games/Tapa'),
  'spaceinvaders': () => import('./games/SpaceInvaders'),
  'asteroids': () => import('./games/Asteroids'),
  'pacman': () => import('./games/PacMan'),
  'breakoutgame': () => import('./games/BreakoutGame'),
  'chess': () => import('./games/Chess'),
  'chinesechess': () => import('./games/ChineseChess'),
  'sudokux': () => import('./games/SudokuX'),
  'killersudoku': () => import('./games/KillerSudoku'),
  'battleship': () => import('./games/Battleship'),
  'wordle': () => import('./games/Wordle'),
  'spellingbee': () => import('./games/SpellingBee'),
  'connections': () => import('./games/Connections'),
  // New games - Skill & Puzzle categories
  'mahjongsolitaire': () => import('./games/MahjongSolitaire'),
  'sokoban': () => import('./games/Sokoban'),
  'typingtest': () => import('./games/TypingTest'),
  'aimtrainer': () => import('./games/AimTrainer'),
  'chimptest': () => import('./games/ChimpTest'),
  'matchthree': () => import('./games/MatchThree'),
  'bubbleshooter': () => import('./games/BubbleShooter'),
  'speedmath': () => import('./games/SpeedMath'),
  'jigsaw': () => import('./games/Jigsaw'),
  'colormatch': () => import('./games/ColorMatch'),
  // More new games
  'solitaire': () => import('./games/Solitaire'),
  'crossword': () => import('./games/Crossword'),
  'memorymatrix': () => import('./games/MemoryMatrix'),
  'pegsolitaire': () => import('./games/PegSolitaire'),
  'wordscramble': () => import('./games/WordScramble'),
}

export default function GameWrapper({ gameId, gameName, gameSlug }: GameWrapperProps) {
  const [GameComponent, setGameComponent] = useState<ComponentType<any> | null>(null)
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    soundEnabled: true,
    language: 'en'
  })
  const [error, setError] = useState<string | null>(null)

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('ruleword_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        // 使用默认设置
      }
    }

    // 检查 URL 参数
    const params = new URLSearchParams(window.location.search)
    const lang = params.get('lang')
    if (lang === 'zh' || lang === 'en') {
      setSettings(s => ({ ...s, language: lang }))
    }
  }, [])

  // 动态加载游戏组件
  useEffect(() => {
    const loader = gameComponents[gameId]
    if (loader) {
      loader()
        .then(module => {
          setGameComponent(() => module.default)
        })
        .catch(err => {
          console.error(`Failed to load game ${gameId}:`, err)
          setError(`Failed to load game: ${err.message}`)
        })
    } else {
      setError(`Game "${gameId}" not found`)
    }
  }, [gameId])

  const handleBack = () => {
    window.location.href = '/'
  }

  const toggleLanguage = () => {
    setSettings(s => {
      const newSettings = { ...s, language: s.language === 'en' ? 'zh' : 'en' }
      localStorage.setItem('ruleword_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }

  const toggleTheme = () => {
    setSettings(s => {
      const newSettings = { ...s, darkMode: !s.darkMode }
      localStorage.setItem('ruleword_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }

  const toggleSound = () => {
    setSettings(s => {
      const newSettings = { ...s, soundEnabled: !s.soundEnabled }
      localStorage.setItem('ruleword_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <a href="/" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading {gameName}...</p>
        </div>
      </div>
    )
  }

  return (
    <GameComponent
      settings={settings}
      onBack={handleBack}
      toggleLanguage={toggleLanguage}
      toggleTheme={toggleTheme}
      toggleSound={toggleSound}
    />
  )
}
