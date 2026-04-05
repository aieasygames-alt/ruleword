// ===== GAME CONSTANTS =====

import type { Direction } from './types'

// Theme colors (参考微信小游戏"箭了又箭"的浅蓝主题)
export const THEME_COLORS = {
  // Light theme
  background: '#e0f2fe',      // sky-100 浅蓝背景
  gridBg: '#f0f9ff',          // sky-50
  gridLine: 'rgba(14, 165, 233, 0.15)',  // sky-500 with opacity
  arrow: '#1e293b',           // slate-800 黑色箭头
  arrowStroke: '#0f172a',     // slate-900 箭头边框
  wall: '#94a3b8',            // slate-400
  numberBlock: '#e2e8f0',     // slate-200
  numberBlockText: '#334155', // slate-700
  heart: '#ef4444',           // red-500
  heartEmpty: '#d1d5db',      // gray-300

  // Dark theme
  darkBackground: '#0f172a',  // slate-900
  darkGridBg: '#1e293b',      // slate-800
  darkGridLine: 'rgba(148, 163, 184, 0.15)',
  darkArrow: '#e2e8f0',       // slate-200
  darkArrowStroke: '#f8fafc', // slate-50
}

// Direction colors (for optional colored mode)
export const DIR_COLORS: Record<string, string> = {
  up: '#ef4444',
  down: '#3b82f6',
  left: '#22c55e',
  right: '#eab308',
}

// Direction deltas [rowDelta, colDelta]
export const DIR_DELTA: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
}

// Direction symbols
export const DIR_SYMBOLS: Record<Direction, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
}

// All directions array
export const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right']

// Chapter configuration
export const CHAPTER_CONFIG = {
  1: { id: 1, name: 'Beginner', nameZh: '入门篇', range: [1, 25] as [number, number], icon: '🌱', color: 'from-green-400 to-emerald-600' },
  2: { id: 2, name: 'Intermediate', nameZh: '进阶篇', range: [26, 50] as [number, number], icon: '⚡', color: 'from-blue-400 to-indigo-600' },
  3: { id: 3, name: 'Advanced', nameZh: '挑战篇', range: [51, 75] as [number, number], icon: '🔥', color: 'from-purple-400 to-pink-600' },
  4: { id: 4, name: 'Master', nameZh: '大师篇', range: [76, 100] as [number, number], icon: '👑', color: 'from-amber-400 to-red-600' },
}

// Chapters array for easy iteration
export const CHAPTERS = Object.values(CHAPTER_CONFIG)

// Animation durations (ms)
export const ANIMATION = {
  arrowExit: 250,
  blockedShake: 300,
  hintGlow: 2000,
  comboDisplay: 1500,
}

// Game settings
export const GAME_CONFIG = {
  maxMistakes: 3,
  totalLevels: 100,
  comboTimeWindow: 3000, // 3 seconds for combo
}
