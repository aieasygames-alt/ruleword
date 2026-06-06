import { useState, useEffect } from 'react'
import {
  getGameStats, getAllProgress, getAchievements, getGamerLevel,
  formatPlayTime, type Achievement, type GamerLevel, type GameProgress, type GameStats,
} from '../utils/gameProgress'

interface Props {
  lang?: string
}

export default function StatsDashboard({ lang = 'en' }: Props) {
  const isZh = lang === 'zh-CN'
  const [stats, setStats] = useState<GameStats | null>(null)
  const [progress, setProgress] = useState<Record<string, GameProgress>>({})
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [gamerLevel, setGamerLevel] = useState<GamerLevel | null>(null)
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    const s = getGameStats()
    const p = getAllProgress()
    const a = getAchievements(s, p)
    const l = getGamerLevel(s)

    setStats(s)
    setProgress(p)
    setAchievements(a)
    setGamerLevel(l)

    try {
      const favs = localStorage.getItem('ruleword_favorites')
      setFavCount(favs ? JSON.parse(favs).length : 0)
    } catch { /* ignore */ }
  }, [])

  if (!stats || !gamerLevel) {
    return (
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="text-4xl mb-4">🎮</div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{isZh ? '开始游戏以追踪你的统计！' : 'Start Playing to Track Your Stats!'}</h2>
          <p class="text-gray-600 dark:text-slate-400 mb-4">{isZh ? '玩任何游戏，你的统计将在这里显示。' : 'Play any game and your stats will appear here.'}</p>
          <a href="/" class="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition-colors">
            {isZh ? '浏览游戏 →' : 'Browse Games →'}
          </a>
        </div>
      </div>
    )
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const gamesPlayed = Object.keys(progress).length
  const topGames = Object.entries(progress)
    .sort(([, a], [, b]) => (b.highScore || 0) - (a.highScore || 0))
    .slice(0, 5)

  return (
    <div class="space-y-8">
      {/* Gamer Level Card */}
      <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-white/80">{isZh ? '玩家等级' : 'Gamer Level'}</div>
            <div class="text-3xl font-bold">Lv.{gamerLevel.level} — {isZh ? gamerLevel.titleZh : gamerLevel.title}</div>
          </div>
          <div class="text-5xl">🏆</div>
        </div>
        <div class="mt-4">
          <div class="flex justify-between text-sm text-white/80 mb-1">
            <span>{stats.totalGamesPlayed} {isZh ? '次游玩' : 'games played'}</span>
            <span>{isZh ? '下一级' : 'Next'}: {isZh ? gamerLevel.nextTitleZh : gamerLevel.nextTitle}</span>
          </div>
          <div class="w-full bg-white/20 rounded-full h-2.5">
            <div
              class="bg-white rounded-full h-2.5 transition-all duration-500"
              style={`width: ${gamerLevel.progress}%`}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 text-center">
          <div class="text-2xl mb-1">🎮</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGamesPlayed}</div>
          <div class="text-xs text-gray-500 dark:text-slate-400">{isZh ? '总游玩' : 'Total Plays'}</div>
        </div>
        <div class="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 text-center">
          <div class="text-2xl mb-1">🕹️</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{gamesPlayed}</div>
          <div class="text-xs text-gray-500 dark:text-slate-400">{isZh ? '游戏数' : 'Games Tried'}</div>
        </div>
        <div class="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 text-center">
          <div class="text-2xl mb-1">⏱️</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{formatPlayTime(stats.totalPlayTime)}</div>
          <div class="text-xs text-gray-500 dark:text-slate-400">{isZh ? '游玩时间' : 'Play Time'}</div>
        </div>
        <div class="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 text-center">
          <div class="text-2xl mb-1">❤️</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{favCount}</div>
          <div class="text-xs text-gray-500 dark:text-slate-400">{isZh ? '收藏' : 'Favorites'}</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🏅</span> {isZh ? '成就' : 'Achievements'}
          </h3>
          <span class="text-sm text-gray-500 dark:text-slate-400">{unlockedCount}/{achievements.length} {isZh ? '已解锁' : 'unlocked'}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {achievements.map(a => (
            <div
              class={`rounded-xl p-3 text-center border transition-all ${
                a.unlocked
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
                  : 'bg-gray-50 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700 opacity-50'
              }`}
            >
              <div class="text-2xl mb-1">{a.unlocked ? a.icon : '🔒'}</div>
              <div class={`text-xs font-semibold ${a.unlocked ? 'text-amber-700 dark:text-amber-300' : 'text-gray-400 dark:text-slate-500'}`}>
                {isZh ? a.nameZh : a.name}
              </div>
              <div class="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{isZh ? a.descriptionZh : a.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Scores */}
      {topGames.length > 0 && (
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <span>🏆</span> {isZh ? '最高分数' : 'Top High Scores'}
          </h3>
          <div class="space-y-2">
            {topGames.map(([slug, p], i) => (
              <div class="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                <span class="text-lg font-bold text-gray-400 dark:text-slate-500 w-6">#{i + 1}</span>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                  <div class="text-xs text-gray-500 dark:text-slate-400">{p.gamesPlayed} {isZh ? '次游玩' : 'plays'}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400">{p.highScore?.toLocaleString() || '—'}</div>
                  <div class="text-xs text-gray-500 dark:text-slate-400">{isZh ? '最高分' : 'best score'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
