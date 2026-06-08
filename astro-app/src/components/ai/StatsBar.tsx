import { useRef, useEffect, useState } from 'react'
import type { StoryStat, StoryTheme } from '../../types'
import { getThemeConfig } from '../../utils/storyThemes'

interface StatsBarProps {
  stats: StoryStat[]
  metadata: Record<string, number>
  theme: StoryTheme
}

export default function StatsBar({ stats, metadata, theme }: StatsBarProps) {
  if (stats.length === 0) return null

  const themeConfig = getThemeConfig(theme)
  const prevMetadata = useRef(metadata)
  const [pulsingStats, setPulsingStats] = useState<Set<string>>(new Set())

  useEffect(() => {
    const changed = new Set<string>()
    for (const stat of stats) {
      if (metadata[stat.id] !== prevMetadata.current[stat.id]) {
        changed.add(stat.id)
      }
    }
    if (changed.size > 0) {
      setPulsingStats(changed)
      const timer = setTimeout(() => setPulsingStats(new Set()), 600)
      prevMetadata.current = metadata
      return () => clearTimeout(timer)
    }
    prevMetadata.current = metadata
  }, [metadata, stats])

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 overflow-x-auto scrollbar-hide">
      {stats.map((stat, i) => {
        const value = metadata[stat.id] ?? stat.initialValue
        const min = stat.min ?? 0
        const max = stat.max ?? 100
        const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
        const barColor = themeConfig.statColors[i % themeConfig.statColors.length]
        const isPulsing = pulsingStats.has(stat.id)

        return (
          <div
            key={stat.id}
            className={`flex items-center gap-1.5 shrink-0 transition-transform ${isPulsing ? 'scale-110' : ''}`}
            title={`${stat.label}: ${Math.round(value)}`}
          >
            <span className="text-sm">{stat.icon}</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-500 leading-none">{stat.label}</span>
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-slate-400 w-6 text-right font-mono">{Math.round(value)}</span>
          </div>
        )
      })}
    </div>
  )
}
