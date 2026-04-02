import { useEffect, useState, ComponentType, useRef } from 'react'
import { getGameProgress, recordGamePlay } from '../utils/gameProgress'
import { addRecentlyPlayed } from '../utils/recentlyPlayed'
import ShareModal from './ShareModal'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type ShareData = {
  gameName: string
  gameEmoji: string
  score?: number
  time?: string
  attempts?: number
  result?: string
  level?: string
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
  // New games
  'texttwist': () => import('./games/TextTwist'),
  'strooptest': () => import('./games/StroopTest'),
  'reactiontime': () => import('./games/ReactionTime'),
  'huarongpass': () => import('./games/HuarongPass'),
  'hidato': () => import('./games/Hidato'),
  'minesweeperflags': () => import('./games/MinesweeperFlags'),
  'solitairetripeaks': () => import('./games/SolitaireTriPeaks'),
  'tangram': () => import('./games/Tangram'),
  'shisensho': () => import('./games/ShisenSho'),
  'mahjongtitans': () => import('./games/MahjongTitans'),
  'kakurasu': () => import('./games/Kakurasu'),
  'memorygrid': () => import('./games/MemoryGrid'),
  'blockpuzzle': () => import('./games/BlockPuzzle'),
  'calcudoku': () => import('./games/Calcudoku'),
  'centipede': () => import('./games/Centipede'),
  'jewelquest': () => import('./games/JewelQuest'),
  '2048cupcakes': () => import('./games/Two048Cupcakes'),
  // External/iframe games
  'amongus': () => import('./games/AmongUs'),
  // New popular games
  'stack': () => import('./games/Stack'),
  'triviaquiz': () => import('./games/TriviaQuiz'),
  'doodlejump': () => import('./games/DoodleJump'),
  'flappybird': () => import('./games/FlappyBird'),
  'watersort': () => import('./games/WaterSort'),
  'flowfree': () => import('./games/FlowFree'),
  'fruitninja': () => import('./games/FruitNinja'),
  'geometrydash': () => import('./games/GeometryDash'),
  'cuttherope': () => import('./games/CutTheRope'),
  'templerun': () => import('./games/TempleRun'),
  'wordscapes': () => import('./games/Wordscapes'),
  // Complex games
  'agario': () => import('./games/AgarIo'),
  'paperio': () => import('./games/PaperIo'),
  'towerdefense': () => import('./games/TowerDefense'),
  'angrybirds': () => import('./games/AngryBirds'),
  'rubikscube': () => import('./games/RubiksCube'),
}

export default function GameWrapper({ gameId, gameName, gameSlug }: GameWrapperProps) {
  const [GameComponent, setGameComponent] = useState<ComponentType<any> | null>(null)
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    soundEnabled: true,
    language: 'en'
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const gameStartTime = useRef<number>(Date.now())
  const currentScore = useRef<number>(0)

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
    setIsLoading(true)
    const loader = gameComponents[gameId]
    if (loader) {
      loader()
        .then(module => {
          setGameComponent(() => module.default)
          setIsLoading(false)
        })
        .catch(err => {
          console.error(`Failed to load game ${gameId}:`, err)
          setError(`Failed to load game: ${err.message}`)
          setIsLoading(false)
        })
    } else {
      setError(`Game "${gameId}" not found`)
      setIsLoading(false)
    }
  }, [gameId])

  // Add to recently played when game loads
  useEffect(() => {
    if (gameSlug) {
      addRecentlyPlayed(gameSlug)
    }
  }, [gameSlug])

  // Record game session when component unmounts
  useEffect(() => {
    if (!GameComponent) return

    gameStartTime.current = Date.now()

    return () => {
      // Record game play when leaving the game
      const playTime = Math.floor((Date.now() - gameStartTime.current) / 1000)
      if (playTime > 0) {
        recordGamePlay(gameId, currentScore.current, playTime)
      }
    }
  }, [GameComponent, gameId])

  // Score tracking function that games can call
  const updateScore = (score: number) => {
    currentScore.current = score
  }

  // Get previous high score
  const getHighScore = () => {
    const progress = getGameProgress(gameId)
    return progress?.highScore || 0
  }

  // Share function that games can call
  const onShare = (data: Omit<ShareData, 'gameName' | 'gameEmoji'>) => {
    // Get game emoji from games data
    const gameEmojis: Record<string, string> = {
      'wordle': '🔤',
      'game2048': '🔢',
      '2048cupcakes': '🧁',
      'sudoku': '🔢',
      'chess': '♟️',
      'tetris': '🧱',
      // Add more as needed
    }

    setShareData({
      gameName,
      gameEmoji: gameEmojis[gameId] || '🎮',
      ...data
    })
    setShowShareModal(true)
  }

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
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Placeholder navigation bar - instant display */}
        <nav className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    R
                  </div>
                  <span className="font-semibold hidden sm:inline">Free Games Hub</span>
                </a>
              </div>
              <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-none">
                {gameName}
              </h1>
              <div className="w-24" />
            </div>
          </div>
        </nav>

        {/* Loading content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            {/* Game Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl shadow-lg shadow-green-500/25 animate-pulse">
              🎮
            </div>

            {/* Loading Spinner */}
            <div className="animate-spin w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>

            {/* Loading Text */}
            <h2 className="text-xl font-bold mb-2">{gameName}</h2>
            <p className="text-slate-400 text-sm">
              {settings.language === 'zh' ? '游戏加载中...' : 'Loading game...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <GameComponent
        settings={settings}
        onBack={handleBack}
        toggleLanguage={toggleLanguage}
        toggleTheme={toggleTheme}
        toggleSound={toggleSound}
        updateScore={updateScore}
        getHighScore={getHighScore}
        onShare={onShare}
        gameId={gameId}
        gameSlug={gameSlug}
        gameName={gameName}
      />
      {shareData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={shareData}
          darkMode={settings.darkMode}
        />
      )}
    </>
  )
}
