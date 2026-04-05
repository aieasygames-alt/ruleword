// ===== GAME HEADER COMPONENT =====
// 显示关卡信息、生命值(红心)、计时器、暂停按钮

import React from 'react'
import { formatTime } from '../utils'

interface GameHeaderProps {
  isZh: boolean
  chapterName: string
  levelDisplay: string
  mistakes: number
  maxMistakes: number
  moves: number
  arrowsRemaining: number
  timer: number
  isPaused: boolean
  onPause: () => void
  onBack: () => void
  darkMode: boolean
}

export function GameHeader({
  isZh,
  chapterName,
  levelDisplay,
  mistakes,
  maxMistakes,
  moves,
  arrowsRemaining,
  timer,
  isPaused,
  onPause,
  onBack,
  darkMode
}: GameHeaderProps) {
  const textClass = darkMode ? 'text-white' : 'text-gray-900'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200'
  const cardBgClass = darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <>
      {/* Header */}
      <div className={`flex items-center justify-between border-b ${borderClass} px-4 py-2`}>
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
          <p className="text-xs opacity-60">
            {chapterName} {levelDisplay && `- ${levelDisplay}`}
          </p>
        </div>
        {/* Pause button */}
        <button
          onClick={onPause}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      {/* HUD with Hearts and Timer */}
      <div className={`flex items-center justify-between px-4 py-2 ${cardBgClass} border-b ${borderClass}`}>
        <div className="flex items-center gap-3">
          {/* Lives as Hearts */}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-60">{isZh ? '生命' : 'Lives'}:</span>
            {Array.from({ length: maxMistakes }, (_, i) => (
              <span key={i} className="text-sm">
                {i < maxMistakes - mistakes ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          {/* Moves */}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-60">{isZh ? '步数' : 'Moves'}:</span>
            <span className="text-sm font-bold">{moves}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-60">⏱️</span>
            <span className="text-sm font-mono">{formatTime(timer)}</span>
          </div>
          {/* Arrows remaining */}
          <div className="text-xs opacity-60">
            {isZh ? '剩余' : 'Left'}: <span className="font-bold">{arrowsRemaining}</span>
          </div>
        </div>
      </div>
    </>
  )
}
