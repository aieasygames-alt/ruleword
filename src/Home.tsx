import { useState, useMemo } from 'react'
import GameGuide from './GameGuide'
import Feedback from './Feedback'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type HomeProps = {
  settings: Settings
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
  onSelectGame?: (gameId: string) => void  // 可选的游戏选择回调
}

// Game data with categories
const games = [
  // 文字游戏 / Word Games
  { id: 'wordle', name: 'Word Guess', nameZh: '猜词游戏', icon: '📝', desc: '6 tries to guess 5-letter word', descZh: '6次机会猜出单词', category: 'word', featured: true },
  { id: 'crosswordle', name: 'Crosswordle', nameZh: '填字游戏', icon: '🔤', desc: 'Swap letters to solve words', descZh: '字母交换填字游戏', category: 'word', featured: true },

  // 数字逻辑 / Logic & Numbers
  { id: 'sudoku', name: 'Sudoku', nameZh: '数独', icon: '🧩', desc: 'Classic number logic puzzle', descZh: '经典数字逻辑游戏', category: 'logic', featured: true },
  { id: 'game2048', name: '2048', nameZh: '2048', icon: '🔢', desc: 'Merge numbers challenge', descZh: '数字合并挑战', category: 'logic', featured: true },
  { id: 'fifteenpuzzle', name: '15 Puzzle', nameZh: '数字推盘', icon: '🔲', desc: 'Slide numbers in order', descZh: '滑动数字排序', category: 'logic' },
  { id: 'lightsout', name: 'Lights Out', nameZh: '熄灯游戏', icon: '💡', desc: 'Turn off all lights', descZh: '关闭所有灯泡', category: 'logic' },

  // 策略对战 / Strategy
  { id: 'mastermind', name: 'Mastermind', nameZh: '密码破译', icon: '🔐', desc: '8 tries to crack color code', descZh: '8次机会破解密码', category: 'strategy', featured: true },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', nameZh: '井字棋', icon: '⭕', desc: 'Classic X and O game', descZh: '经典井字棋游戏', category: 'strategy' },
  { id: 'connectfour', name: 'Connect Four', nameZh: '四子棋', icon: '🔴', desc: 'Connect four to win', descZh: '连成四子获胜', category: 'strategy' },
  { id: 'minesweeper', name: 'Minesweeper', nameZh: '扫雷', icon: '🧨', desc: 'Classic mine-finding puzzle', descZh: '经典扫雷益智游戏', category: 'strategy', featured: true },

  // 经典街机 / Arcade
  { id: 'snake', name: 'Snake', nameZh: '贪吃蛇', icon: '🐍', desc: 'Classic snake game', descZh: '经典贪吃蛇游戏', category: 'arcade' },
  { id: 'tetris', name: 'Tetris', nameZh: '俄罗斯方块', icon: '🧱', desc: 'Classic block puzzle', descZh: '经典俄罗斯方块', category: 'arcade', featured: true },
  { id: 'brickbreaker', name: 'Brick Breaker', nameZh: '打砖块', icon: '🏓', desc: 'Classic ball and paddle', descZh: '经典弹球游戏', category: 'arcade' },

  // 记忆反应 / Memory & Reflex
  { id: 'memory', name: 'Memory', nameZh: '记忆翻牌', icon: '🃏', desc: 'Flip cards to find pairs', descZh: '翻转卡片找到配对', category: 'memory' },
  { id: 'simonsays', name: 'Simon Says', nameZh: '西蒙说', icon: '🎵', desc: 'Memory color sequence', descZh: '记忆颜色序列', category: 'memory' },
  { id: 'whackamole', name: 'Whack-a-Mole', nameZh: '打地鼠', icon: '🔨', desc: 'Quick reflexes game', descZh: '快速反应打地鼠', category: 'memory' },

  // 词典 / Tools
  { id: 'dictionary', name: 'Dictionary', nameZh: '词典', icon: '📚', desc: 'Word definitions & more', descZh: '单词定义与更多', category: 'tools' },
]

const categories = [
  { id: 'all', name: 'All Games', nameZh: '全部游戏', icon: '🎮' },
  { id: 'word', name: 'Word Games', nameZh: '文字游戏', icon: '📝' },
  { id: 'logic', name: 'Logic & Numbers', nameZh: '数字逻辑', icon: '🧩' },
  { id: 'strategy', name: 'Strategy', nameZh: '策略对战', icon: '🎯' },
  { id: 'arcade', name: 'Arcade', nameZh: '经典街机', icon: '👾' },
  { id: 'memory', name: 'Memory & Reflex', nameZh: '记忆反应', icon: '🧠' },
  { id: 'tools', name: 'Tools', nameZh: '工具', icon: '🔧' },
]

export default function Home({ settings, toggleLanguage, toggleTheme, toggleSound, onSelectGame }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showGameGuide, setShowGameGuide] = useState(false)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const lang = settings.language

  // Filter games based on search and category
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = searchQuery === '' ||
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.nameZh.includes(searchQuery) ||
        game.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.descZh.includes(searchQuery)

      const matchesCategory = activeCategory === 'all' || game.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory])

  // Featured games (shown at top)
  const featuredGames = games.filter(g => g.featured)

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button onClick={() => {}} className="flex items-center gap-2">
            <span className="text-3xl">📝</span>
            <h1 className="text-2xl font-bold">RuleWord</h1>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="px-3 py-1 rounded hover:bg-gray-700/30 text-sm font-medium">
              {settings.language === 'en' ? '中文' : 'English'}
            </button>
            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700/30">
              {settings.darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={toggleSound} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700/30">
              {settings.soundEnabled ? '🔊' : '🔇'}
            </button>
            <Feedback language={settings.language} inline />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {lang === 'zh' ? '免费在线小游戏合集' : 'Free Online Mini Games'}
          </h2>
          <p className={`text-lg ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {lang === 'zh'
              ? '17+款经典游戏，无需下载，即开即玩'
              : '17+ classic games, no download, play instantly'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className={`relative ${cardBgClass} rounded-xl border ${borderClass}`}>
            <input
              type="text"
              placeholder={lang === 'zh' ? '搜索游戏...' : 'Search games...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 pl-12 rounded-xl ${settings.darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-green-600 text-white'
                    : settings.darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{lang === 'zh' ? cat.nameZh : cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Games (when no search/category filter) */}
        {activeCategory === 'all' && searchQuery === '' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⭐</span>
              {lang === 'zh' ? '热门游戏' : 'Featured Games'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => onSelectGame?.(game.id)}
                  className={`p-4 rounded-xl text-center transition-transform hover:scale-105 ${cardBgClass} border ${borderClass}`}
                >
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <h4 className="font-bold">{lang === 'zh' ? game.nameZh : game.name}</h4>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Games Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🎮</span>
            {activeCategory === 'all'
              ? (lang === 'zh' ? '全部游戏' : 'All Games')
              : (lang === 'zh' ? categories.find(c => c.id === activeCategory)?.nameZh : categories.find(c => c.id === activeCategory)?.name)}
            <span className={`text-sm font-normal ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              ({filteredGames.length})
            </span>
          </h3>

          {filteredGames.length === 0 ? (
            <div className={`text-center py-12 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-4xl mb-4">🔍</p>
              <p>{lang === 'zh' ? '没有找到匹配的游戏' : 'No games found matching your search'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => onSelectGame?.(game.id)}
                  className={`p-4 rounded-xl transition-transform hover:scale-[1.02] ${cardBgClass} border ${borderClass} flex items-center gap-4 text-left w-full`}
                >
                  <div className="text-4xl">{game.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{lang === 'zh' ? game.nameZh : game.name}</h4>
                    <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lang === 'zh' ? game.descZh : game.desc}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* How to Play Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowGameGuide(true)}
            className={`px-6 py-3 rounded-xl font-medium ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <span className="mr-2">📖</span>
            {lang === 'zh' ? '查看游戏指南' : 'View Game Guide'}
          </button>
        </div>

        {/* Footer */}
        <div className={`mt-12 pt-6 border-t ${borderClass} text-center ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm">
            {lang === 'zh'
              ? '© 2026 RuleWord. 免费在线小游戏合集'
              : '© 2026 RuleWord. Free Online Mini Games Collection'}
          </p>
        </div>
      </div>

      {/* Game Guide Modal */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
        />
      )}
    </div>
  )
}
