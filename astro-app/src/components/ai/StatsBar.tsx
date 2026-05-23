import type { StoryStat } from '../../types'

interface StatsBarProps {
  stats: StoryStat[]
  metadata: Record<string, number>
}

export default function StatsBar({ stats, metadata }: StatsBarProps) {
  if (stats.length === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 overflow-x-auto scrollbar-hide">
      {stats.map(stat => {
        const value = metadata[stat.id] ?? stat.initialValue
        const min = stat.min ?? 0
        const max = stat.max ?? 100
        const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))

        let barColor = 'bg-slate-500'
        if (stat.id.startsWith('affection')) {
          barColor = percentage > 60 ? 'bg-pink-500' : percentage > 30 ? 'bg-pink-400' : 'bg-pink-300/50'
        } else if (stat.id === 'confidence') {
          barColor = percentage > 60 ? 'bg-blue-500' : percentage > 30 ? 'bg-blue-400' : 'bg-blue-300/50'
        }

        return (
          <div key={stat.id} className="flex items-center gap-1.5 shrink-0" title={`${stat.label}: ${Math.round(value)}`}>
            <span className="text-sm">{stat.icon}</span>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-6 text-right">{Math.round(value)}</span>
          </div>
        )
      })}
    </div>
  )
}
