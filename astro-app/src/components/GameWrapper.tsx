import { useEffect, useState, useRef } from 'react'
import { getGameProgress, recordGamePlay } from '../utils/gameProgress'
import { addRecentlyPlayed } from '../utils/recentlyPlayed'
import ShareModal from './ShareModal'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: string
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

// 动态导入所有游戏组件 — 使用 import.meta.glob 自动发现
const gameModules = import.meta.glob<{ default: ComponentType<any> }>('./games/*.tsx')

// 非游戏文件（工具组件），需排除
const NON_GAME_FILES = new Set(['Calendar', 'Feedback', 'GameGuide'])

// 特殊 gameId 映射（文件名小写化不等于 gameId 的例外）
const GAME_ID_OVERRIDES: Record<string, string> = {
  'Two048Cupcakes': '2048cupcakes',
}

// 自动构建 gameId → 动态加载器映射
const gameComponents: Record<string, () => Promise<{ default: ComponentType<any> }>> = {}

for (const [path, loader] of Object.entries(gameModules)) {
  const match = path.match(/\.\/games\/(.+)\.tsx$/)
  if (!match) continue
  const fileName = match[1]

  // 跳过非游戏组件
  if (NON_GAME_FILES.has(fileName)) continue

  // gameId: 使用覆盖映射或直接小写化文件名
  const gameId = GAME_ID_OVERRIDES[fileName] || fileName.toLowerCase()

  gameComponents[gameId] = loader
}

// Registry aliases that intentionally reuse an existing implementation.
gameComponents.simongame = gameComponents.simonsays
gameComponents.reactiontime = gameComponents.reactiontest

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
    window.history.back()
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
