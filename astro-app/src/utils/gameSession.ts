import { recordGamePlay, saveGameProgress } from './gameProgress'
import { trackRulewordEvent } from './analytics'

export type GameSessionOutcome = 'completed' | 'failed' | 'abandoned'

export type GameSessionResult = {
  outcome: GameSessionOutcome
  score?: number
  durationSeconds?: number
  moves?: number
  difficulty?: string
  mode?: 'daily' | 'practice' | 'unlimited' | 'pvp' | 'ai'
  challengeId?: string
}

export type GameSession = {
  start: (context?: Omit<GameSessionResult, 'outcome' | 'score' | 'durationSeconds' | 'moves'>) => void
  move: (count?: number) => void
  finish: (result: GameSessionResult) => void
}

const DAY_MS = 86_400_000
const EPOCH_UTC = Date.UTC(2024, 0, 1)

function todayUtc(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function getDailyChallengeId(gameId: string, date = new Date()) {
  return `${gameId}:${Math.floor((todayUtc(date) - EPOCH_UTC) / DAY_MS)}`
}

export function getDailyChallengeSeed(gameId: string, date = new Date()) {
  const input = getDailyChallengeId(gameId, date)
  let hash = 2166136261
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createGameSession(gameId: string): GameSession {
  let startedAt: number | null = null
  let moves = 0
  let completed = false

  return {
    start(context = {}) {
      startedAt = Date.now()
      moves = 0
      completed = false
      trackRulewordEvent('game_session_start', { game_id: gameId, ...context })
    },
    move(count = 1) {
      if (startedAt === null || completed) return
      moves += count
    },
    finish(result) {
      if (completed) return
      completed = true
      const durationSeconds = result.durationSeconds ?? (startedAt === null ? 0 : Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
      const totalMoves = result.moves ?? moves
      const payload = {
        game_id: gameId,
        outcome: result.outcome,
        score: result.score,
        duration_seconds: durationSeconds,
        moves: totalMoves,
        difficulty: result.difficulty,
        mode: result.mode,
        challenge_id: result.challengeId,
      }

      trackRulewordEvent('game_session_finish', payload)
      recordGamePlay(gameId, result.score, durationSeconds)
      saveGameProgress(gameId, {
        customData: {
          lastOutcome: result.outcome,
          lastMoves: totalMoves,
          lastMode: result.mode,
          lastDifficulty: result.difficulty,
          lastChallengeId: result.challengeId,
        },
      })
    },
  }
}
