import { useState, useMemo } from 'react'
import { gameGuidesEn, gameGuidesZhCN, getGameGuide } from '../../data/gameGuides'

// Game ID mapping from component names to guide IDs
const gameIdMap: Record<string, string> = {
  wordle: 'wordle',
  mastermind: 'mastermind',
  crosswordle: 'crosswordle',
  sudoku: 'sudoku',
  minesweeper: 'minesweeper',
  game2048: '2048',
  snake: 'snake',
  memory: 'memory',
  tetris: 'tetris',
  tictactoe: 'tictactoe',
  connectfour: 'connect4',
  whackamole: 'whackAMole',
  simonsays: 'simonSays',
  fifteenpuzzle: '15puzzle',
  lightsout: 'lightsOut',
  brickbreaker: 'brickBreaker',
  bullpen: 'bullpens',
  nonogram: 'nonogram',
  kakuro: 'kakuro',
  hitori: 'hitori',
  skyscrapers: 'skyscrapers',
  kenken: 'kenken',
  threes: 'threes',
  suguru: 'suguru',
  hashiwokakero: 'hashiwokakero',
  slitherlink: 'slitherlink',
  binary: 'binary',
}

type GameType = keyof typeof gameIdMap

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

  // Get all available games from gameGuides
  const availableGames = useMemo(() => {
    const guides = language === 'zh' ? gameGuidesZhCN : gameGuidesEn
    return Object.entries(guides).map(([id, guide]) => {
      const componentType = (Object.entries(gameIdMap).find(([_, v]) => v === id)?.[0] || 'wordle') as GameType
      return { id, name: guide.name, componentType }
    })
  }, [language])

  // Get current game guide
  const currentGuide = useMemo(() => {
    const gameId = gameIdMap[activeGame] || activeGame
    return getGameGuide(gameId, language === 'zh' ? 'zh-CN' : 'en')
  }, [activeGame, language])

  const translations = {
    en: {
      title: 'Game Guide',
      close: 'Close',
      howToPlay: 'How to Play',
      tips: 'Tips',
    },
    zh: {
      title: '游戏指南',
      close: '关闭',
      howToPlay: '如何游玩',
      tips: '游戏技巧',
    },
  }

  const t = translations[language]

  if (!currentGuide) {
    return (
      <div className={`fixed inset-0 ${bgClass} ${textClass} z-50 flex items-center justify-center`}>
        <div className={`${cardBgClass} rounded-xl p-6 border ${borderClass}`}>
          <p>Guide not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t.close}
          </button>
        </div>
      </div>
    )
  }

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
        {availableGames.map(({ id, name, componentType }) => (
          <button
            key={id}
            onClick={() => setActiveGame(componentType)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              gameIdMap[activeGame] === id
                ? 'bg-green-600 text-white'
                : darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Intro */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <p className={`text-lg leading-relaxed ${subTextClass}`}>{currentGuide.intro}</p>
        </div>

        {/* How to Play */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <h2 className="text-xl font-bold mb-4">{t.howToPlay}</h2>
          <p className={subTextClass}>{currentGuide.howToPlay}</p>
        </div>

        {/* Tips */}
        <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
          <h2 className="text-xl font-bold mb-4">{t.tips}</h2>
          <ul className="space-y-3">
            {currentGuide.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                <span className={subTextClass}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
