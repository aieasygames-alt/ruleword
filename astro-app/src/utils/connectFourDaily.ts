import { getDailyChallengeSeed } from './gameSession'

export type ConnectFourDifficulty = 'easy' | 'medium' | 'hard'

export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

export const getDailyConnectFourDifficulty = (date = new Date()): ConnectFourDifficulty => {
  const random = createSeededRandom(getDailyChallengeSeed('connectfour', date))
  const roll = random()
  if (roll < 1 / 3) return 'easy'
  if (roll < 2 / 3) return 'medium'
  return 'hard'
}

export const getDailyConnectFourRandom = (moves: number, date = new Date()) =>
  createSeededRandom(getDailyChallengeSeed('connectfour', date) + moves)
