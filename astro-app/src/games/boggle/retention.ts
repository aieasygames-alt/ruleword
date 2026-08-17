import type { BoggleBoardSize, BoggleMode } from './logic'

export type BoggleRecentRound = {
  id: string
  playedAt: string
  mode: BoggleMode
  boardSize: BoggleBoardSize
  score: number
  wordCount: number
  possibleWordCount?: number
}

export type BoggleDailyStats = {
  streak: number
  bestStreak: number
  lastPlayedDate: string
}

export type BoggleBestScores = Partial<Record<`${BoggleMode}:${BoggleBoardSize}`, number>>

export type BoggleSettings = {
  mode: BoggleMode
  boardSize: BoggleBoardSize
}

const BOGGLE_RECENT_ROUNDS_KEY = 'ruleword:boggle:recentRounds'
const BOGGLE_DAILY_STATS_KEY = 'ruleword:boggle:dailyStats'
const BOGGLE_BEST_SCORES_KEY = 'ruleword:boggle:bestScores'
const BOGGLE_SETTINGS_KEY = 'ruleword:boggle:settings'

export const BOGGLE_BEST_SCORE_KEY = 'ruleword:boggle:bestScore'

let storageOverride: Storage | null = null

export function boggleTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function boggleDaysBetween(firstDate: string, secondDate: string) {
  const first = Date.parse(`${firstDate}T00:00:00.000Z`)
  const second = Date.parse(`${secondDate}T00:00:00.000Z`)
  return Math.round((second - first) / 86400000)
}

export function getBoggleStorage(): Storage | null {
  if (storageOverride) return storageOverride
  if (typeof localStorage !== 'undefined') return localStorage
  if (typeof window !== 'undefined') return window.localStorage
  return null
}

export function setBoggleRetentionStorage(storage: Storage | null) {
  storageOverride = storage
}

export function readRecentBoggleRounds(): BoggleRecentRound[] {
  try {
    const raw = getBoggleStorage()?.getItem(BOGGLE_RECENT_ROUNDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecentBoggleRound(round: BoggleRecentRound): BoggleRecentRound[] {
  const next = addRecentBoggleRound(readRecentBoggleRounds(), round)
  getBoggleStorage()?.setItem(BOGGLE_RECENT_ROUNDS_KEY, JSON.stringify(next))
  return next
}

export function addRecentBoggleRound(rounds: BoggleRecentRound[], round: BoggleRecentRound): BoggleRecentRound[] {
  return [round, ...rounds].slice(0, 5)
}

export function boggleBestScoreKey(mode: BoggleMode, boardSize: BoggleBoardSize): `${BoggleMode}:${BoggleBoardSize}` {
  return `${mode}:${boardSize}`
}

export function readBoggleBestScores(): BoggleBestScores {
  try {
    const raw = getBoggleStorage()?.getItem(BOGGLE_BEST_SCORES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function updateBoggleBestScores(mode: BoggleMode, boardSize: BoggleBoardSize, score: number): BoggleBestScores {
  const scores = readBoggleBestScores()
  const key = boggleBestScoreKey(mode, boardSize)
  scores[key] = Math.max(scores[key] ?? 0, score)
  getBoggleStorage()?.setItem(BOGGLE_BEST_SCORES_KEY, JSON.stringify(scores))
  return scores
}

export function normalizeBoggleSettings(input: Partial<BoggleSettings> | null | undefined): BoggleSettings {
  const mode = input?.mode === 'relaxed' || input?.mode === 'daily' ? input.mode : 'classic'
  const boardSize = input?.boardSize === 5 ? 5 : 4
  return { mode, boardSize }
}

export function readBoggleSettings(): BoggleSettings {
  try {
    const raw = getBoggleStorage()?.getItem(BOGGLE_SETTINGS_KEY)
    return normalizeBoggleSettings(raw ? JSON.parse(raw) : null)
  } catch {
    return normalizeBoggleSettings(null)
  }
}

export function saveBoggleSettings(settings: BoggleSettings): BoggleSettings {
  const normalized = normalizeBoggleSettings(settings)
  getBoggleStorage()?.setItem(BOGGLE_SETTINGS_KEY, JSON.stringify(normalized))
  return normalized
}

export function readBoggleDailyStats(): BoggleDailyStats {
  try {
    const raw = getBoggleStorage()?.getItem(BOGGLE_DAILY_STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // use default below
  }
  return { streak: 0, bestStreak: 0, lastPlayedDate: '' }
}

export function updateBoggleDailyStats(date = new Date()): BoggleDailyStats {
  const currentDate = boggleTodayKey(date)
  const previous = readBoggleDailyStats()
  const next = getNextBoggleDailyStats(previous, currentDate)
  getBoggleStorage()?.setItem(BOGGLE_DAILY_STATS_KEY, JSON.stringify(next))
  return next
}

export function getNextBoggleDailyStats(previous: BoggleDailyStats, currentDate: string): BoggleDailyStats {
  if (previous.lastPlayedDate === currentDate) return previous

  const gap = previous.lastPlayedDate ? boggleDaysBetween(previous.lastPlayedDate, currentDate) : 0
  const streak = gap === 1 ? previous.streak + 1 : 1
  const next = {
    streak,
    bestStreak: Math.max(previous.bestStreak, streak),
    lastPlayedDate: currentDate,
  }
  return next
}
