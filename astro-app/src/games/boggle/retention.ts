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

const BOGGLE_RECENT_ROUNDS_KEY = 'ruleword:boggle:recentRounds'
const BOGGLE_DAILY_STATS_KEY = 'ruleword:boggle:dailyStats'

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
