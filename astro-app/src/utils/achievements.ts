/**
 * Achievement System
 * Tracks and unlocks achievements based on game progress
 */

export interface Achievement {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  requirement: {
    type: 'games_played' | 'high_score' | 'total_score' | 'perfect_game' | 'streak' | 'category' | 'specific_game';
    value: number;
    gameSlug?: string;
    category?: string;
  };
  unlocked: boolean;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Play count achievements
  {
    id: 'first_game',
    name: 'First Steps',
    nameZh: '初学者',
    description: 'Play your first game',
    descriptionZh: '完成第一个游戏',
    icon: '🎮',
    requirement: { type: 'games_played', value: 1 },
    unlocked: false
  },
  {
    id: 'ten_games',
    name: 'Gamer',
    nameZh: '玩家',
    description: 'Play 10 games',
    descriptionZh: '完成10个游戏',
    icon: '🕹️',
    requirement: { type: 'games_played', value: 10 },
    unlocked: false
  },
  {
    id: 'fifty_games',
    name: 'Dedicated',
    nameZh: '专注',
    description: 'Play 50 games',
    descriptionZh: '完成50个游戏',
    icon: '🏆',
    requirement: { type: 'games_played', value: 50 },
    unlocked: false
  },
  {
    id: 'hundred_games',
    name: 'Champion',
    nameZh: '冠军',
    description: 'Play 100 games',
    descriptionZh: '完成100个游戏',
    icon: '👑',
    requirement: { type: 'games_played', value: 100 },
    unlocked: false
  },

  // Score achievements
  {
    id: 'score_100',
    name: 'Century',
    nameZh: '百分',
    description: 'Score 100 points in any game',
    descriptionZh: '在任何游戏中获得100分',
    icon: '💯',
    requirement: { type: 'high_score', value: 100 },
    unlocked: false
  },
  {
    id: 'score_1000',
    name: 'High Scorer',
    nameZh: '高分玩家',
    description: 'Score 1000 points in any game',
    descriptionZh: '在任何游戏中获得1000分',
    icon: '🎯',
    requirement: { type: 'high_score', value: 1000 },
    unlocked: false
  },
  {
    id: 'score_10000',
    name: 'Legendary',
    nameZh: '传奇',
    description: 'Score 10000 points in any game',
    descriptionZh: '在任何游戏中获得10000分',
    icon: '⭐',
    requirement: { type: 'high_score', value: 10000 },
    unlocked: false
  },

  // Category achievements
  {
    id: 'word_master',
    name: 'Word Master',
    nameZh: '文字大师',
    description: 'Play 10 word games',
    descriptionZh: '完成10个文字游戏',
    icon: '📝',
    requirement: { type: 'category', value: 10, category: 'word' },
    unlocked: false
  },
  {
    id: 'logic_wiz',
    name: 'Logic Wizard',
    nameZh: '逻辑天才',
    description: 'Play 10 logic games',
    descriptionZh: '完成10个逻辑游戏',
    icon: '🧩',
    requirement: { type: 'category', value: 10, category: 'logic' },
    unlocked: false
  },
  {
    id: 'arcade_hero',
    name: 'Arcade Hero',
    nameZh: '街机英雄',
    description: 'Play 10 arcade games',
    descriptionZh: '完成10个街机游戏',
    icon: '👾',
    requirement: { type: 'category', value: 10, category: 'arcade' },
    unlocked: false
  },

  // Specific game achievements
  {
    id: 'sudoku_master',
    name: 'Sudoku Master',
    nameZh: '数独大师',
    description: 'Play 20 Sudoku games',
    descriptionZh: '完成20个数独游戏',
    icon: '9️⃣',
    requirement: { type: 'specific_game', value: 20, gameSlug: 'sudoku' },
    unlocked: false
  },
  {
    id: 'tetris_legend',
    name: 'Tetris Legend',
    nameZh: '俄罗斯方块传奇',
    description: 'Play 20 Tetris games',
    descriptionZh: '完成20个俄罗斯方块游戏',
    icon: '🧱',
    requirement: { type: 'specific_game', value: 20, gameSlug: 'tetris' },
    unlocked: false
  },
];

const ACHIEVEMENTS_KEY = 'ruleword_achievements';
const STATS_KEY = 'ruleword_game_stats';

/**
 * Get all achievements with unlock status
 */
export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') return ACHIEVEMENTS;

  try {
    const unlockedData = localStorage.getItem(ACHIEVEMENTS_KEY);
    const unlocked: Record<string, number> = unlockedData ? JSON.parse(unlockedData) : {};

    return ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: unlocked[ach.id] !== undefined,
      unlockedAt: unlocked[ach.id]
    }));
  } catch (e) {
    console.error('Failed to load achievements:', e);
    return ACHIEVEMENTS;
  }
}

/**
 * Unlock an achievement
 */
export function unlockAchievement(achievementId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const unlockedData = localStorage.getItem(ACHIEVEMENTS_KEY);
    const unlocked: Record<string, number> = unlockedData ? JSON.parse(unlockedData) : {};

    // Check if already unlocked
    if (unlocked[achievementId]) return false;

    // Unlock achievement
    unlocked[achievementId] = Date.now();
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));

    // Trigger event
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      window.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: { achievement }
      }));
    }

    return true;
  } catch (e) {
    console.error('Failed to unlock achievement:', e);
    return false;
  }
}

/**
 * Check and unlock achievements based on game progress
 */
export function checkAchievements(
  gamesPlayed: number,
  highScores: Record<string, number>,
  categoryCounts: Record<string, number>
): string[] {
  const newUnlocks: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (achievement.unlocked) continue;

    let shouldUnlock = false;

    switch (achievement.requirement.type) {
      case 'games_played':
        shouldUnlock = gamesPlayed >= achievement.requirement.value;
        break;

      case 'high_score':
        shouldUnlock = Object.values(highScores).some(score => score >= achievement.requirement.value);
        break;

      case 'category':
        shouldUnlock = (categoryCounts[achievement.requirement.category!] || 0) >= achievement.requirement.value;
        break;

      case 'specific_game':
        shouldUnlock = (gamesPlayed >= achievement.requirement.value); // Simplified
        break;
    }

    if (shouldUnlock && unlockAchievement(achievement.id)) {
      newUnlocks.push(achievement.id);
    }
  }

  return newUnlocks;
}

/**
 * Get achievement progress
 */
export function getAchievementProgress(achievementId: string): { current: number; target: number; percentage: number } {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return { current: 0, target: 1, percentage: 0 };

  // This would need to be implemented based on actual stats
  return { current: 0, target: achievement.requirement.value, percentage: 0 };
}

/**
 * Clear all achievements (for testing)
 */
export function clearAchievements(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  } catch (e) {
    console.error('Failed to clear achievements:', e);
  }
}
