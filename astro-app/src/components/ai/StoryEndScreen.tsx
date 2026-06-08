import type { StoryEndingResult, StoryStat, StoryTheme } from '../../types'
import type { StoryThemeConfig } from '../../utils/storyThemes'

interface StoryEndScreenProps {
  ending: StoryEndingResult
  metadata: Record<string, number>
  stats: StoryStat[]
  themeConfig: StoryThemeConfig
  colorGradient: string
  onShare: () => void
  onReplay: () => void
}

export default function StoryEndScreen({ ending, metadata, stats, themeConfig, colorGradient, onShare, onReplay }: StoryEndScreenProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 border border-slate-700 animate-slide-up">
        <div className="text-5xl">{themeConfig.endEmoji}</div>
        <h2 className="text-2xl font-bold text-white">{ending.title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{ending.description}</p>
        {ending.summary && (
          <p className="text-slate-400 text-xs italic">"{ending.summary}"</p>
        )}

        {/* Stat summary */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 py-2">
            {stats.map((stat, i) => {
              const value = Math.round(metadata[stat.id] ?? stat.initialValue)
              const max = stat.max ?? 100
              const percentage = Math.max(0, Math.min(100, (value / max) * 100))
              return (
                <div key={stat.id} className="bg-slate-700/50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-sm">{stat.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-xs text-slate-400">{stat.label}</div>
                    <div className="w-full h-1 bg-slate-600 rounded-full mt-0.5">
                      <div
                        className={`h-full rounded-full ${themeConfig.statColors[i % themeConfig.statColors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-300 font-mono">{value}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onShare}
            className={`w-full px-4 py-3 ${themeConfig.primaryButton} ${themeConfig.primaryButtonHover} text-white rounded-xl text-sm font-medium transition-colors`}
          >
            Share Your Story
          </button>
          <button
            onClick={onReplay}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}
