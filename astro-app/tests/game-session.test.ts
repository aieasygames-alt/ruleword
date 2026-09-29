import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameSession, getDailyChallengeId, getDailyChallengeSeed } from '../src/utils/gameSession'

describe('game sessions', () => {
  beforeEach(() => {
    localStorage.clear()
    window.dataLayer = []
    window.gtag = vi.fn()
  })

  it('generates a stable local-day challenge identifier and seed', () => {
    const day = new Date('2026-09-29T23:30:00.000Z')
    expect(getDailyChallengeId('boggle', day)).toBe(getDailyChallengeId('boggle', day))
    expect(getDailyChallengeSeed('boggle', day)).toBe(getDailyChallengeSeed('boggle', day))
    expect(getDailyChallengeSeed('boggle', day)).not.toBe(getDailyChallengeSeed('sokoban', day))
  })

  it('changes the challenge ID at the local midnight boundary', () => {
    const beforeMidnight = new Date(2026, 8, 29, 23, 59)
    const afterMidnight = new Date(2026, 8, 30, 0, 1)
    expect(getDailyChallengeId('boggle', beforeMidnight)).not.toBe(getDailyChallengeId('boggle', afterMidnight))
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

  it('does not record a run that never started', () => {
    const session = createGameSession('sokoban')

    expect(session.isActive()).toBe(false)
    session.move()
    session.finish({ outcome: 'abandoned' })

    expect(window.dataLayer).toEqual([])
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('tracks the active lifecycle of a started run', () => {
    const session = createGameSession('sokoban')
    session.start({ mode: 'daily', challengeId: 'sokoban:1' })

    expect(session.isActive()).toBe(true)
    session.finish({ outcome: 'abandoned', mode: 'daily', challengeId: 'sokoban:1' })

    expect(session.isActive()).toBe(false)
    expect(window.dataLayer).toContainEqual(expect.objectContaining({
      event: 'game_session_finish',
      game_id: 'sokoban',
      outcome: 'abandoned',
      mode: 'daily',
    }))
  })

  it('does not allow a finished session to reopen from later moves', () => {
    const session = createGameSession('sokoban')
    session.start({ mode: 'practice' })
    session.finish({ outcome: 'completed', mode: 'practice' })
    session.move(3)

    expect(session.isActive()).toBe(false)
    expect(window.dataLayer).toHaveLength(2)
  })
})
