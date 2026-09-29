import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameSession, getDailyChallengeId, getDailyChallengeSeed } from '../src/utils/gameSession'

describe('game sessions', () => {
  beforeEach(() => {
    localStorage.clear()
    window.dataLayer = []
    window.gtag = vi.fn()
  })

  it('generates a stable UTC daily challenge identifier and seed', () => {
    const day = new Date('2026-09-29T23:30:00.000Z')
    expect(getDailyChallengeId('boggle', day)).toBe(getDailyChallengeId('boggle', day))
    expect(getDailyChallengeSeed('boggle', day)).toBe(getDailyChallengeSeed('boggle', day))
    expect(getDailyChallengeSeed('boggle', day)).not.toBe(getDailyChallengeSeed('sokoban', day))
  })

  it('records a finished run once with normalized metadata', () => {
    const session = createGameSession('sokoban')
    session.start({ mode: 'practice', difficulty: 'level-1' })
    session.move()
    session.move(2)
    session.finish({ outcome: 'completed', score: 100, mode: 'practice', difficulty: 'level-1' })
    session.finish({ outcome: 'completed', score: 999 })

    expect(window.dataLayer).toContainEqual(expect.objectContaining({ event: 'game_session_finish', game_id: 'sokoban', moves: 3 }))
    expect(window.gtag).toHaveBeenCalledTimes(2)
  })
})
