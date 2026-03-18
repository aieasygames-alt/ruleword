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

// All games data with categories
const games = [
  // Word Games
  { id: 'wordle', name: 'Word Guess', nameZh: '猜词游戏', icon: '📝', desc: '6 tries to guess 5-letter word', descZh: '6次机会猜出单词', category: 'word', featured: true, color: 'from-emerald-500 to-teal-600' },
  { id: 'crosswordle', name: 'Crosswordle', nameZh: '填字游戏', icon: '🔤', desc: 'Swap letters to solve words', descZh: '字母交换填字游戏', category: 'word', featured: true, color: 'from-blue-500 to-indigo-600' },

  // Logic & Numbers - Classics
  { id: 'sudoku', name: 'Sudoku', nameZh: '数独', icon: '🧩', desc: 'Classic number logic puzzle', descZh: '经典数字逻辑游戏', category: 'logic', featured: true, color: 'from-orange-500 to-red-600' },
  { id: 'game2048', name: '2048', nameZh: '2048', icon: '🔢', desc: 'Merge numbers challenge', descZh: '数字合并挑战', category: 'logic', featured: true, color: 'from-amber-500 to-orange-600' },
  { id: 'minesweeper', name: 'Minesweeper', nameZh: '扫雷', icon: '💣', desc: 'Classic mine-finding puzzle', descZh: '经典扫雷益智游戏', category: 'logic', featured: true, color: 'from-red-500 to-rose-600' },

  // Logic & Numbers - New
  { id: 'nonogram', name: 'Nonogram', nameZh: '数织', icon: '🖼️', desc: 'Reveal hidden pixel art', descZh: '揭示隐藏像素画', category: 'logic', featured: true, color: 'from-purple-500 to-violet-600' },
  { id: 'skyscrapers', name: 'Skyscrapers', nameZh: '摩天楼', icon: '🏙️', desc: 'Place buildings by clues', descZh: '根据提示放置建筑', category: 'logic', color: 'from-cyan-500 to-blue-600' },
  { id: 'suguru', name: 'Suguru', nameZh: '数独组', icon: '🎨', desc: 'Fill regions with numbers', descZh: '数字填充区域', category: 'logic', color: 'from-pink-500 to-rose-600' },
  { id: 'binary', name: 'Binary', nameZh: '01填格', icon: '⚪', desc: 'Fill grid with 0s and 1s', descZh: '用0和1填满格子', category: 'logic', color: 'from-slate-500 to-gray-600' },
  { id: 'kakuro', name: 'Kakuro', nameZh: '数和', icon: '➕', desc: 'Sum crossword puzzle', descZh: '求和填字游戏', category: 'logic', color: 'from-green-500 to-emerald-600' },
  { id: 'kenken', name: 'KenKen', nameZh: '贤贤数独', icon: '🧮', desc: 'Math grid puzzle', descZh: '数学方格谜题', category: 'logic', color: 'from-teal-500 to-cyan-600' },
  { id: 'hitori', name: 'Hitori', nameZh: '一人', icon: '⚫', desc: 'Eliminate duplicate numbers', descZh: '消除重复数字', category: 'logic', color: 'from-zinc-500 to-neutral-600' },
  { id: 'slitherlink', name: 'Slitherlink', nameZh: '回路迷', icon: '🔗', desc: 'Form a single loop', descZh: '形成单一回路', category: 'logic', color: 'from-indigo-500 to-blue-600' },
  { id: 'hashiwokakero', name: 'Bridges', nameZh: '造桥', icon: '🌉', desc: 'Connect islands with bridges', descZh: '用桥连接岛屿', category: 'logic', color: 'from-sky-500 to-cyan-600' },
  { id: 'threes', name: 'Threes', nameZh: '三消', icon: '3️⃣', desc: 'Slide and merge threes', descZh: '滑动合并三消', category: 'logic', color: 'from-violet-500 to-purple-600' },
  { id: 'fifteenpuzzle', name: '15 Puzzle', nameZh: '数字推盘', icon: '🔲', desc: 'Slide numbers in order', descZh: '滑动数字排序', category: 'logic', color: 'from-amber-500 to-yellow-600' },
  { id: 'lightsout', name: 'Lights Out', nameZh: '熄灯游戏', icon: '💡', desc: 'Turn off all lights', descZh: '关闭所有灯泡', category: 'logic', color: 'from-yellow-500 to-amber-600' },
  { id: 'bullpen', name: 'Bullpen', nameZh: '牛栏逻辑', icon: '🐂', desc: 'Sudoku meets Minesweeper', descZh: '数独与扫雷的结合', category: 'logic', featured: true, color: 'from-lime-500 to-green-600' },

  // Strategy
  { id: 'mastermind', name: 'Mastermind', nameZh: '密码破译', icon: '🔐', desc: '8 tries to crack color code', descZh: '8次机会破解密码', category: 'strategy', featured: true, color: 'from-fuchsia-500 to-pink-600' },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', nameZh: '井字棋', icon: '⭕', desc: 'Classic X and O game', descZh: '经典井字棋游戏', category: 'strategy', color: 'from-rose-500 to-red-600' },
  { id: 'connectfour', name: 'Connect Four', nameZh: '四子棋', icon: '🔴', desc: 'Connect four to win', descZh: '连成四子获胜', category: 'strategy', color: 'from-red-500 to-orange-600' },

  // Arcade
  { id: 'tetris', name: 'Tetris', nameZh: '俄罗斯方块', icon: '🧱', desc: 'Classic block puzzle', descZh: '经典俄罗斯方块', category: 'arcade', featured: true, color: 'from-blue-500 to-cyan-600' },
  { id: 'snake', name: 'Snake', nameZh: '贪吃蛇', icon: '🐍', desc: 'Classic snake game', descZh: '经典贪吃蛇游戏', category: 'arcade', color: 'from-green-500 to-emerald-600' },
  { id: 'brickbreaker', name: 'Brick Breaker', nameZh: '打砖块', icon: '🏓', desc: 'Classic ball and paddle', descZh: '经典弹球游戏', category: 'arcade', color: 'from-purple-500 to-indigo-600' },

  // Memory & Reflex
  { id: 'memory', name: 'Memory', nameZh: '记忆翻牌', icon: '🃏', desc: 'Flip cards to find pairs', descZh: '翻转卡片找到配对', category: 'memory', color: 'from-pink-500 to-rose-600' },
  { id: 'simonsays', name: 'Simon Says', nameZh: '西蒙说', icon: '🎵', desc: 'Memory color sequence', descZh: '记忆颜色序列', category: 'memory', color: 'from-violet-500 to-purple-600' },
  { id: 'whackamole', name: 'Whack-a-Mole', nameZh: '打地鼠', icon: '🔨', desc: 'Quick reflexes game', descZh: '快速反应打地鼠', category: 'memory', color: 'from-orange-500 to-red-600' },

  // Tools
  { id: 'dictionary', name: 'Dictionary', nameZh: '词典', icon: '📚', desc: 'Word definitions & more', descZh: '单词定义与更多', category: 'tools', color: 'from-gray-500 to-slate-600' },
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

  const lang = settings.language
  const isDark = settings.darkMode

  // Theme classes
  const bgClass = isDark ? 'bg-slate-950' : 'bg-gray-50'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const cardBgClass = isDark ? 'bg-slate-900/80' : 'bg-white'
  const borderClass = isDark ? 'border-slate-800' : 'border-gray-200'
  const subtleTextClass = isDark ? 'text-slate-400' : 'text-gray-500'

  // Filter games
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

  const featuredGames = games.filter(g => g.featured)

  const handleGameClick = (gameId: string) => {
    onSelectGame?.(gameId)
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-gray-200'} border-b backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/25">
                R
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">RuleWord</h1>
                <p className={`text-xs ${subtleTextClass} -mt-0.5`}>{games.length}+ {lang === 'zh' ? '免费游戏' : 'Free Games'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {lang === 'en' ? '中文' : 'EN'}
              </button>
              <button
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={toggleSound}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {settings.soundEnabled ? '🔊' : '🔇'}
              </button>
              <div className="hidden md:block">
                <Feedback language={lang} inline />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className={`relative overflow-hidden ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950' : 'bg-gradient-to-b from-white to-gray-50'}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-green-500' : 'bg-green-400'}`} />
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            {lang === 'zh' ? '免费在线游戏合集' : 'Free Online Games'}
          </h2>
          <p className={`text-lg sm:text-xl max-w-2xl mx-auto ${subtleTextClass} mb-8`}>
            {lang === 'zh'
              ? '经典益智、策略对战、街机游戏，无需下载，即开即玩'
              : 'Classic puzzles, strategy games, arcade fun. No downloads, play instantly.'}
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className={`relative rounded-2xl ${isDark ? 'bg-slate-800/80' : 'bg-white'} shadow-xl shadow-black/5 border ${borderClass}`}>
              <input
                type="text"
                placeholder={lang === 'zh' ? '搜索游戏...' : 'Search games...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-5 py-4 pl-14 rounded-2xl text-lg ${isDark ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-gray-900 placeholder-gray-400'} focus:outline-none`}
              />
              <svg className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${subtleTextClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 ${subtleTextClass} hover:opacity-70`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* Category Tabs */}
        <div className={`sticky top-16 z-40 py-4 -mx-4 px-4 ${isDark ? 'bg-slate-950/95' : 'bg-gray-50/95'} backdrop-blur-sm`}>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{lang === 'zh' ? cat.nameZh : cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        {activeCategory === 'all' && searchQuery === '' && (
          <section className="mt-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⭐</span>
              <h3 className="text-xl font-bold">{lang === 'zh' ? '热门推荐' : 'Featured Games'}</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredGames.map((game, i) => (
                <button
                  key={game.id}
                  onClick={() => handleGameClick(game.id)}
                  className={`group relative overflow-hidden rounded-2xl aspect-square p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 bg-gradient-to-br ${game.color}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="text-4xl lg:text-5xl">{game.icon}</div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{lang === 'zh' ? game.nameZh : game.name}</h4>
                      <p className="text-white/80 text-sm line-clamp-2">{lang === 'zh' ? game.descZh : game.desc}</p>
                    </div>
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/30 backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* All Games Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <h3 className="text-xl font-bold">
                {activeCategory === 'all'
                  ? (lang === 'zh' ? '全部游戏' : 'All Games')
                  : (lang === 'zh' ? categories.find(c => c.id === activeCategory)?.nameZh : categories.find(c => c.id === activeCategory)?.name)}
              </h3>
            </div>
            <span className={`text-sm ${subtleTextClass}`}>
              {filteredGames.length} {lang === 'zh' ? '款' : 'games'}
            </span>
          </div>

          {filteredGames.length === 0 ? (
            <div className={`text-center py-20 ${subtleTextClass}`}>
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-xl">{lang === 'zh' ? '没有找到匹配的游戏' : 'No games found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game, i) => (
                <button
                  key={game.id}
                  onClick={() => handleGameClick(game.id)}
                  className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${cardBgClass} border ${borderClass}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Gradient icon background */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110`}>
                      <span className="text-2xl">{game.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg mb-1">{lang === 'zh' ? game.nameZh : game.name}</h4>
                      <p className={`text-sm ${subtleTextClass} line-clamp-2`}>
                        {lang === 'zh' ? game.descZh : game.desc}
                      </p>
                    </div>

                    {/* Arrow */}
                    <svg className={`w-5 h-5 ${subtleTextClass} group-hover:text-green-500 group-hover:translate-x-1 transition-all flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Featured badge */}
                  {game.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                        ⭐
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Game Guide CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowGameGuide(true)}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-medium transition-all hover:shadow-xl ${
              isDark
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600'
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-lg'
            }`}
          >
            <span className="text-xl">📖</span>
            <span>{lang === 'zh' ? '查看游戏指南' : 'View Game Guide'}</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${borderClass} ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <span className={`font-semibold ${subtleTextClass}`}>RuleWord</span>
            </div>
            <p className={`text-sm ${subtleTextClass}`}>
              © 2026 RuleWord · {games.length}+ {lang === 'zh' ? '款免费游戏' : 'Free Games'}
            </p>
          </div>
        </div>
      </footer>

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
