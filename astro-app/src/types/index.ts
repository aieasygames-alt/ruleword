// ============================================
// Centralized Type Definitions for Ruleword
// ============================================

// ====================
// Game Types
// ====================

export type GameCategory = 'word' | 'logic' | 'strategy' | 'arcade' | 'memory' | 'skill' | 'puzzle'

export interface GameConfig {
  slug: string
  id: string
  name: string
  nameZh: string
  icon: string
  desc: string
  descZh: string
  category: GameCategory
  featured?: boolean
  color: string
}

export interface GameLocalization {
  name: string
  desc: string
  description?: string
  objectives?: string
  howToPlay?: string
  rules?: GameRules
  tips?: string[]
  faq?: GameFAQ[]
}

export interface GameRules {
  controls?: string
  mechanics?: string[]
  features?: string[]
}

export interface GameFAQ {
  question: string
  answer: string
}

// ====================
// SEO Types
// ====================

export type SearchIntent = 'play' | 'learn' | 'daily' | 'unlimited'

export interface GameSEO {
  primaryKeyword: string
  secondaryKeywords: string[]
  longTailKeywords: string[]
  titleTemplate: string
  descriptionTemplate: string
  intent: SearchIntent
}

// ====================
// i18n Types
// ====================

export type Language = 'en' | 'fr' | 'de' | 'es' | 'ru' | 'ja' | 'zh-CN' | 'zh-TW'

export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
}

export interface TranslationSet {
  [key: string]: string | TranslationSet
}

// ====================
// Game Guide Types
// ====================

export interface GameGuideContent {
  name: string
  intro: string
  howToPlay: string
  tips: string[]
}

export type GameGuides = Record<string, GameGuideContent>

// ====================
// Game Progress Types
// ====================

export type CellState = 'empty' | 'correct' | 'present' | 'absent'

export interface GameProgress {
  slug: string
  timestamp: number
  score?: number
  level?: number
  completed?: boolean
}

export interface GameStats {
  gamesPlayed: number
  highScores: Record<string, number>
  totalTime: number
}

// ====================
// Achievement Types
// ====================

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number
  condition: (stats: GameStats) => boolean
}

// ====================
// Category Types
// ====================

export interface Category {
  id: GameCategory | 'all'
  name: string
  nameZh: string
  icon: string
  desc: string
}

// ====================
// Content/CMS Types
// ====================

export interface ContentGame {
  id: string
  slug: string
  icon: string
  category: GameCategory
  featured?: boolean
  color: string
  en: GameLocalization
  zh?: GameLocalization
}

// ====================
// API Response Types
// ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ====================
// Utility Types
// ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>
