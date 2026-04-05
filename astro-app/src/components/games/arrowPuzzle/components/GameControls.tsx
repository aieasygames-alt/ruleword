// ===== GAME CONTROLS COMPONENT =====
// 底部控制栏： 撤销、提示、重试

import React from 'react'

interface GameControlsProps {
  isZh: boolean
  canUndo: boolean
  isPlaying: boolean
  onUndo: () => void
  onHint: () => void
  onRestart: () => void
  darkMode: boolean
}

export function GameControls({
  isZh,
  canUndo,
  isPlaying,
  onUndo,
  onHint,
  onRestart,
  darkMode
}: GameControlsProps) {
  const cardBgClass = darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className="px-4 pb-4 flex items-center justify-center gap-3">
      <button
        onClick={onUndo}
        disabled={!canUndo || !isPlaying}
        className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
      >
        ↩ {isZh ? '撤销' : 'Undo'}
      </button>
      <button
        onClick={onHint}
        disabled={!isPlaying}
        className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
      >
        💡 {isZh ? '提示' : 'Hint'}
      </button>
      <button
        onClick={onRestart}
        className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} active:scale-95 transition-all`}
      >
        🔄 {isZh ? '重试' : 'Retry'}
      </button>
    </div>
  )
}
