import { describe, expect, it } from 'vitest'
import { getDailyChallengeId } from '../src/utils/gameSession'
import { getDailyConnectFourDifficulty, getDailyConnectFourRandom } from '../src/utils/connectFourDaily'

describe('Connect Four daily determinism', () => {
  const date = new Date(2026, 8, 29)

  it('uses the shared daily challenge identifier for completion state', () => {
    expect(getDailyChallengeId('connectfour', date)).toMatch(/^connectfour:\d+$/)
  })

  it('keeps difficulty and per-turn random choices stable for a date', () => {
    expect(getDailyConnectFourDifficulty(date)).toBe(getDailyConnectFourDifficulty(date))

    const firstAttempt = getDailyConnectFourRandom(7, date)
    const retry = getDailyConnectFourRandom(7, date)
    expect([firstAttempt(), firstAttempt(), firstAttempt()]).toEqual([retry(), retry(), retry()])
  })

  it('changes the daily seed on a different date', () => {
    const nextDay = new Date(2026, 8, 30)
    expect(getDailyConnectFourRandom(7, date)()).not.toBe(getDailyConnectFourRandom(7, nextDay)())
  })
})
