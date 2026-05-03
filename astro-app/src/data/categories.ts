// Game categories - standalone data source
// Previously part of data/games.ts, extracted for single-source-of-truth

export interface Category {
  id: string
  name: string
  nameZh: string
  icon: string
  desc: string
}

export const categories: Category[] = [
  { id: 'all', name: 'All Games', nameZh: '全部游戏', icon: '🎮', desc: 'Browse all our free online games' },
  { id: 'word', name: 'Word Games', nameZh: '文字游戏', icon: '🔤', desc: 'Word puzzles and vocabulary games' },
  { id: 'logic', name: 'Logic & Numbers', nameZh: '数字逻辑', icon: '🧩', desc: 'Brain training logic puzzles' },
  { id: 'strategy', name: 'Strategy', nameZh: '策略对战', icon: '♟️', desc: 'Strategy and board games' },
  { id: 'arcade', name: 'Arcade', nameZh: '经典街机', icon: '👾', desc: 'Classic arcade games' },
  { id: 'memory', name: 'Memory & Reflex', nameZh: '记忆反应', icon: '🧠', desc: 'Memory and reflex training' },
  { id: 'skill', name: 'Skill Games', nameZh: '技能挑战', icon: '🎯', desc: 'Test and improve your skills' },
  { id: 'puzzle', name: 'Puzzle', nameZh: '拼图消除', icon: '🧩', desc: 'Relaxing puzzle and matching games' },
]

export const gameCategories = categories.filter(c => c.id !== 'all')

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id)
}
