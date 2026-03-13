// 成就系统
export type AchievementId =
  | 'first_win'           // 首次胜利
  | 'first_mastermind'    // 首次破解密码
  | 'streak_3'            // 连胜3天
  | 'streak_7'            // 连胜7天
  | 'streak_30'           // 连胜30天
  | 'perfect_guess'       // 一次猜中
  | 'hard_master'         // 困难模式10胜
  | 'win_rate_80'         // 胜率80%
  | 'games_10'            // 游戏10次
  | 'games_50'            // 游戏50次
  | 'games_100'           // 游戏100次
  | 'speed_demon'         // 30秒内破解
  | 'no_hints'            // 不用提示获胜

export interface Achievement {
  id: AchievementId
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

export interface AchievementData {
  achievements: Record<AchievementId, Achievement>
  totalUnlocked: number
}

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementId, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
  first_win: {
    id: 'first_win',
    title: 'First Victory',
    titleZh: '初次胜利',
    description: 'Win your first Wordle game',
    descriptionZh: '赢得第一局猜词游戏',
    icon: '🎯',
  },
  first_mastermind: {
    id: 'first_mastermind',
    title: 'Code Cracker',
    titleZh: '密码破译者',
    description: 'Crack your first Mastermind code',
    descriptionZh: '破解第一个密码',
    icon: '🔐',
  },
  streak_3: {
    id: 'streak_3',
    title: 'On Fire',
    titleZh: '势如破竹',
    description: '3 day winning streak',
    descriptionZh: '连续3天获胜',
    icon: '🔥',
  },
  streak_7: {
    id: 'streak_7',
    title: 'Week Warrior',
    titleZh: '周冠军',
    description: '7 day winning streak',
    descriptionZh: '连续7天获胜',
    icon: '👑',
  },
  streak_30: {
    id: 'streak_30',
    title: 'Monthly Master',
    titleZh: '月度大师',
    description: '30 day winning streak',
    descriptionZh: '连续30天获胜',
    icon: '🏆',
  },
  perfect_guess: {
    id: 'perfect_guess',
    title: 'Perfect Guess',
    titleZh: '完美猜测',
    description: 'Guess correctly on first try',
    descriptionZh: '第一次就猜对',
    icon: '💎',
  },
  hard_master: {
    id: 'hard_master',
    title: 'Hard Mode Master',
    titleZh: '困难模式大师',
    description: 'Win 10 games in hard mode',
    descriptionZh: '困难模式获胜10次',
    icon: '💪',
  },
  win_rate_80: {
    id: 'win_rate_80',
    title: 'Expert Player',
    titleZh: '专家玩家',
    description: 'Achieve 80% win rate',
    descriptionZh: '达到80%胜率',
    icon: '🌟',
  },
  games_10: {
    id: 'games_10',
    title: 'Getting Started',
    titleZh: '初窥门径',
    description: 'Play 10 games',
    descriptionZh: '游戏10次',
    icon: '🎮',
  },
  games_50: {
    id: 'games_50',
    title: 'Regular Player',
    titleZh: '常客',
    description: 'Play 50 games',
    descriptionZh: '游戏50次',
    icon: '🎲',
  },
  games_100: {
    id: 'games_100',
    title: 'Dedicated Gamer',
    titleZh: '游戏达人',
    description: 'Play 100 games',
    descriptionZh: '游戏100次',
    icon: '🎪',
  },
  speed_demon: {
    id: 'speed_demon',
    title: 'Speed Demon',
    titleZh: '闪电侠',
    description: 'Crack code in under 30 seconds',
    descriptionZh: '30秒内破解密码',
    icon: '⚡',
  },
  no_hints: {
    id: 'no_hints',
    title: 'Pure Skill',
    titleZh: '纯实力',
    description: 'Win without using hints',
    descriptionZh: '不使用提示获胜',
    icon: '🧠',
  },
}

const ACHIEVEMENTS_KEY = 'ruleword_achievements'

export function loadAchievements(): AchievementData {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      // 合并默认定义
      const achievements = { ...ACHIEVEMENT_DEFINITIONS } as Record<AchievementId, Achievement>
      for (const id of Object.keys(parsed.achievements || {}) as AchievementId[]) {
        if (achievements[id]) {
          achievements[id] = {
            ...achievements[id],
            ...parsed.achievements[id],
          }
        }
      }
      return {
        achievements,
        totalUnlocked: Object.values(achievements).filter(a => a.unlocked).length,
      }
    }
  } catch {}

  // 初始化
  const achievements = { ...ACHIEVEMENT_DEFINITIONS } as Record<AchievementId, Achievement>
  for (const id of Object.keys(achievements) as AchievementId[]) {
    achievements[id] = {
      ...achievements[id],
      unlocked: false,
    }
  }
  return {
    achievements,
    totalUnlocked: 0,
  }
}

export function saveAchievements(data: AchievementData): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data))
}

export function unlockAchievement(
  data: AchievementData,
  id: AchievementId
): { data: AchievementData; newlyUnlocked: boolean } {
  if (data.achievements[id]?.unlocked) {
    return { data, newlyUnlocked: false }
  }

  const newData = {
    ...data,
    achievements: {
      ...data.achievements,
      [id]: {
        ...data.achievements[id],
        unlocked: true,
        unlockedAt: Date.now(),
      },
    },
    totalUnlocked: data.totalUnlocked + 1,
  }

  saveAchievements(newData)
  return { data: newData, newlyUnlocked: true }
}

// 检查成就条件
export function checkAchievements(
  data: AchievementData,
  stats: {
    played: number
    won: number
    currentStreak: number
    hardModeWins: number
    firstGuessWins: number
    noHintWins: number
  },
  gameType: 'wordle' | 'mastermind',
  guessCount?: number,
  hintsUsed?: number,
  timeTaken?: number
): { data: AchievementData; unlocked: AchievementId[] } {
  let currentData = data
  const unlocked: AchievementId[] = []

  // 首次胜利
  if (gameType === 'wordle' && stats.won >= 1) {
    const result = unlockAchievement(currentData, 'first_win')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('first_win')
    }
  }

  // 首次破解
  if (gameType === 'mastermind' && stats.won >= 1) {
    const result = unlockAchievement(currentData, 'first_mastermind')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('first_mastermind')
    }
  }

  // 连胜
  if (stats.currentStreak >= 3) {
    const result = unlockAchievement(currentData, 'streak_3')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('streak_3')
    }
  }
  if (stats.currentStreak >= 7) {
    const result = unlockAchievement(currentData, 'streak_7')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('streak_7')
    }
  }
  if (stats.currentStreak >= 30) {
    const result = unlockAchievement(currentData, 'streak_30')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('streak_30')
    }
  }

  // 一次猜中
  if (guessCount === 1) {
    const result = unlockAchievement(currentData, 'perfect_guess')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('perfect_guess')
    }
  }

  // 困难模式10胜
  if (stats.hardModeWins >= 10) {
    const result = unlockAchievement(currentData, 'hard_master')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('hard_master')
    }
  }

  // 胜率80%
  if (stats.played >= 10 && stats.won / stats.played >= 0.8) {
    const result = unlockAchievement(currentData, 'win_rate_80')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('win_rate_80')
    }
  }

  // 游戏次数
  if (stats.played >= 10) {
    const result = unlockAchievement(currentData, 'games_10')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('games_10')
    }
  }
  if (stats.played >= 50) {
    const result = unlockAchievement(currentData, 'games_50')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('games_50')
    }
  }
  if (stats.played >= 100) {
    const result = unlockAchievement(currentData, 'games_100')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('games_100')
    }
  }

  // 速度恶魔
  if (gameType === 'mastermind' && timeTaken && timeTaken < 30) {
    const result = unlockAchievement(currentData, 'speed_demon')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('speed_demon')
    }
  }

  // 不用提示
  if (hintsUsed === 0 && guessCount && guessCount <= 6) {
    const result = unlockAchievement(currentData, 'no_hints')
    if (result.newlyUnlocked) {
      currentData = result.data
      unlocked.push('no_hints')
    }
  }

  return { data: currentData, unlocked }
}
