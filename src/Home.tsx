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
  onSelectGame?: (gameId: string) => void
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
  { id: 'bullpen', name: 'Bullpen', nameZh: '牛栏逻辑', icon: '🐂', desc: 'Sudoku meets Minesweeper', descZh: '数独与扫雷的结合', category: 'logic', featured: true },

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

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-50'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:bg-gray-50'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'
  const sidebarBgClass = settings.darkMode ? 'bg-slate-800/50' : 'bg-white'

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

  const handleGameClick = (gameId: string) => {
    onSelectGame?.(gameId)
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Header - Fixed */}
      <header className={`sticky top-0 z-50 ${settings.darkMode ? 'bg-slate-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} border-b backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => {}} className="flex items-center gap-3 group">
              <span className="text-3xl">📝</span>
              <h1 className="text-xl lg:text-2xl font-bold group-hover:text-green-500 transition-colors">RuleWord</h1>
            </button>

            {/* Header Actions */}
            <div className="flex items-center gap-1 lg:gap-3">
              <button onClick={toggleLanguage} className="px-3 py-2 rounded-lg hover:bg-gray-700/20 text-sm font-medium transition-colors">
                {settings.language === 'en' ? '中文' : 'EN'}
              </button>
              <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700/20 transition-colors">
                {settings.darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={toggleSound} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700/20 transition-colors">
                {settings.soundEnabled ? '🔊' : '🔇'}
              </button>
              <div className="hidden sm:block">
                <Feedback language={settings.language} inline />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className={`sticky top-24 ${sidebarBgClass} rounded-xl p-4 border ${borderClass}`}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">
                {lang === 'zh' ? '分类' : 'Categories'}
              </h3>
              <nav className="space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center gap-3 transition-all ${
                      activeCategory === cat.id
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                        : settings.darkMode
                        ? 'hover:bg-slate-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-medium">{lang === 'zh' ? cat.nameZh : cat.name}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className={`mt-6 pt-4 border-t ${borderClass}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{games.length}</div>
                  <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lang === 'zh' ? '款游戏' : 'Games'}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0">
            {/* Hero Section */}
            <div className="text-center mb-8 lg:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                {lang === 'zh' ? '免费在线小游戏合集' : 'Free Online Mini Games'}
              </h2>
              <p className={`text-base lg:text-lg max-w-2xl mx-auto ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {lang === 'zh'
                  ? '17+款经典游戏，无需下载，即开即玩'
                  : '17+ classic games, no download, play instantly'}
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className={`relative ${cardBgClass} rounded-xl border ${borderClass} shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-green-500/20`}>
                <input
                  type="text"
                  placeholder={lang === 'zh' ? '搜索游戏...' : 'Search games...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3.5 pl-12 rounded-xl ${settings.darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'} focus:outline-none`}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs - Mobile Only */}
            <div className="mb-6 lg:hidden overflow-x-auto -mx-4 px-4">
              <div className="flex gap-2 pb-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center gap-2 ${
                      activeCategory === cat.id
                        ? 'bg-green-600 text-white'
                        : settings.darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{lang === 'zh' ? cat.nameZh : cat.name}</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                  {featuredGames.map(game => (
                    <button
                      key={game.id}
                      onClick={() => handleGameClick(game.id)}
                      className={`p-4 lg:p-5 rounded-xl text-center transition-all duration-200 ${cardBgClass} border ${borderClass} hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1 group`}
                    >
                      <div className="text-4xl lg:text-5xl mb-2 lg:mb-3 group-hover:scale-110 transition-transform">{game.icon}</div>
                      <h4 className="font-bold text-sm lg:text-base">{lang === 'zh' ? game.nameZh : game.name}</h4>
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
                <div className={`text-center py-16 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-lg">{lang === 'zh' ? '没有找到匹配的游戏' : 'No games found matching your search'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                  {filteredGames.map(game => (
                    <button
                      key={game.id}
                      onClick={() => handleGameClick(game.id)}
                      className={`p-4 lg:p-5 rounded-xl transition-all duration-200 ${cardBgClass} border ${borderClass} hover:border-green-500/50 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-4 text-left w-full group`}
                    >
                      <div className="text-4xl lg:text-5xl group-hover:scale-110 transition-transform">{game.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base lg:text-lg">{lang === 'zh' ? game.nameZh : game.name}</h4>
                        <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          {lang === 'zh' ? game.descZh : game.desc}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* How to Play Link */}
            <div className="mt-10 text-center">
              <button
                onClick={() => setShowGameGuide(true)}
                className={`px-8 py-3.5 rounded-xl font-medium transition-all ${settings.darkMode ? 'bg-slate-800 hover:bg-slate-700 hover:shadow-lg' : 'bg-white hover:bg-gray-50 hover:shadow-lg border border-gray-200'} inline-flex items-center gap-2`}
              >
                <span>📖</span>
                {lang === 'zh' ? '查看游戏指南' : 'View Game Guide'}
              </button>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className={`mt-16 pt-8 border-t ${borderClass} text-center ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <p>© 2026 RuleWord. {lang === 'zh' ? '免费在线小游戏合集' : 'Free Online Mini Games Collection'}</p>
            <span className="hidden sm:inline">•</span>
            <p>{lang === 'zh' ? '17+ 款经典游戏' : '17+ Classic Games'}</p>
          </div>
        </footer>
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
