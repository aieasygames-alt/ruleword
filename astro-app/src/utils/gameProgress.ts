/**
 * Game Progress Management Utility
 * Handles saving/loading game progress and high scores using localStorage
 */

export interface GameProgress {
  gameId: string;
  highScore?: number;
  bestTime?: number; // in seconds
  gamesPlayed: number;
  lastPlayed: string; // ISO date string
  customData?: Record<string, any>; // For game-specific data
}

export interface GameStats {
  totalGamesPlayed: number;
  totalPlayTime: number; // in seconds
  favoriteGame?: string;
  achievements: string[];
}

const PROGRESS_KEY = 'ruleword_game_progress';
const STATS_KEY = 'ruleword_game_stats';

/**
 * Get all game progress
 */
export function getAllProgress(): Record<string, GameProgress> {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load game progress:', e);
    return {};
  }
}

/**
 * Get progress for a specific game
 */
export function getGameProgress(gameId: string): GameProgress | null {
  const allProgress = getAllProgress();
  return allProgress[gameId] || null;
}

/**
 * Save or update game progress
 */
export function saveGameProgress(gameId: string, progress: Partial<GameProgress>): void {
  if (typeof window === 'undefined') return;

  try {
    const allProgress = getAllProgress();
    const existing = allProgress[gameId] || {
      gameId,
      gamesPlayed: 0,
      lastPlayed: new Date().toISOString()
    };

    const updated: GameProgress = {
      ...existing,
      ...progress,
      lastPlayed: new Date().toISOString()
    };

    // Update high score if new score is higher
    if (progress.highScore !== undefined) {
      updated.highScore = Math.max(progress.highScore, existing.highScore || 0);
    }

    // Update best time if new time is lower (better)
    if (progress.bestTime !== undefined) {
      updated.bestTime = Math.min(progress.bestTime, existing.bestTime || Infinity);
    }

    allProgress[gameId] = updated;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (e) {
    console.error('Failed to save game progress:', e);
  }
}

/**
 * Record a game play session
 */
export function recordGamePlay(gameId: string, score?: number, time?: number): void {
  const existing = getGameProgress(gameId);

  saveGameProgress(gameId, {
    gamesPlayed: (existing?.gamesPlayed || 0) + 1,
    highScore: score,
    bestTime: time
  });

  // Update overall stats
  const stats = getGameStats();
  saveGameStats({
    totalGamesPlayed: stats.totalGamesPlayed + 1,
    totalPlayTime: stats.totalPlayTime + (time || 0),
    favoriteGame: updateFavoriteGame(stats, gameId)
  });
}

/**
 * Update favorite game based on play count
 */
function updateFavoriteGame(stats: GameStats, gameId: string): string {
  const allProgress = getAllProgress();
  let maxPlays = 0;
  let favorite = gameId;

  for (const [id, progress] of Object.entries(allProgress)) {
    if (progress.gamesPlayed > maxPlays) {
      maxPlays = progress.gamesPlayed;
      favorite = id;
    }
  }

  return favorite;
}

/**
 * Get overall game statistics
 */
export function getGameStats(): GameStats {
  if (typeof window === 'undefined') {
    return { totalGamesPlayed: 0, totalPlayTime: 0, achievements: [] };
  }

  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : { totalGamesPlayed: 0, totalPlayTime: 0, achievements: [] };
  } catch (e) {
    console.error('Failed to load game stats:', e);
    return { totalGamesPlayed: 0, totalPlayTime: 0, achievements: [] };
  }
}

/**
 * Save overall game statistics
 */
export function saveGameStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save game stats:', e);
  }
}

/**
 * Get leaderboard (top scores for a game)
 */
export function getLeaderboard(gameId: string, limit = 10): Array<{ name: string; score: number; date: string }> {
  if (typeof window === 'undefined') return [];

  try {
    const key = `ruleword_leaderboard_${gameId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load leaderboard:', e);
    return [];
  }
}

/**
 * Save a score to the leaderboard
 */
export function saveToLeaderboard(gameId: string, name: string, score: number): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `ruleword_leaderboard_${gameId}`;
    const leaderboard = getLeaderboard(gameId);

    leaderboard.push({
      name,
      score,
      date: new Date().toISOString()
    });

    // Sort by score descending and keep top scores
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmed = leaderboard.slice(0, limit);

    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save to leaderboard:', e);
  }
}

/**
 * Clear all game progress (for testing or user request)
 */
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(STATS_KEY);
    // Clear all leaderboards
    Object.keys(localStorage)
      .filter(key => key.startsWith('ruleword_leaderboard_'))
      .forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to clear progress:', e);
  }
}

// === Stats Dashboard Helpers ===

export interface Achievement {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENT_DEFS: Array<Omit<Achievement, 'unlocked'>> = [
  { id: 'first-game', name: 'First Steps', nameZh: '第一步', description: 'Play your first game', descriptionZh: '玩第一个游戏', icon: '🎮' },
  { id: 'getting-started', name: 'Getting Started', nameZh: '初学者', description: 'Play 10 games', descriptionZh: '玩 10 个游戏', icon: '🚀' },
  { id: 'dedicated', name: 'Dedicated Player', nameZh: '忠实玩家', description: 'Play 50 games', descriptionZh: '玩 50 个游戏', icon: '💪' },
  { id: 'centurion', name: 'Centurion', nameZh: '百战勇士', description: 'Play 100 games', descriptionZh: '玩 100 个游戏', icon: '⚡' },
  { id: 'explorer', name: 'Explorer', nameZh: '探索者', description: 'Try 5 different games', descriptionZh: '尝试 5 个不同游戏', icon: '🗺️' },
  { id: 'high-scorer', name: 'High Scorer', nameZh: '高分达人', description: 'Score 1000+ in any game', descriptionZh: '在任何游戏中得分 1000+', icon: '🏆' },
  { id: 'marathon', name: 'Marathon Runner', nameZh: '马拉松选手', description: 'Play for over 1 hour total', descriptionZh: '总游戏时间超过 1 小时', icon: '⏱️' },
  { id: 'collector', name: 'Game Collector', nameZh: '收藏家', description: 'Favorite 5+ games', descriptionZh: '收藏 5+ 个游戏', icon: '❤️' },
  { id: 'speed-demon', name: 'Speed Demon', nameZh: '速度恶魔', description: 'Get a best time under 30s', descriptionZh: '最佳时间低于 30 秒', icon: '🏃' },
  { id: 'perfectionist', name: 'Perfectionist', nameZh: '完美主义者', description: 'Score 5000+ in any game', descriptionZh: '在任何游戏中得分 5000+', icon: '💎' },
];

export function getAchievements(stats: GameStats, progress: Record<string, GameProgress>): Achievement[] {
  const uniqueGames = Object.keys(progress).length;
  const hasHighScore = Object.values(progress).some(p => (p.highScore || 0) >= 1000);
  const hasUltraScore = Object.values(progress).some(p => (p.highScore || 0) >= 5000);
  const hasFastTime = Object.values(progress).some(p => (p.bestTime || 999) < 30);

  // Count favorites
  let favCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const favs = localStorage.getItem('ruleword_favorites');
      favCount = favs ? JSON.parse(favs).length : 0;
    } catch { /* ignore */ }
  }

  return ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    unlocked: (
      (def.id === 'first-game' && stats.totalGamesPlayed >= 1) ||
      (def.id === 'getting-started' && stats.totalGamesPlayed >= 10) ||
      (def.id === 'dedicated' && stats.totalGamesPlayed >= 50) ||
      (def.id === 'centurion' && stats.totalGamesPlayed >= 100) ||
      (def.id === 'explorer' && uniqueGames >= 5) ||
      (def.id === 'high-scorer' && hasHighScore) ||
      (def.id === 'marathon' && stats.totalPlayTime >= 3600) ||
      (def.id === 'collector' && favCount >= 5) ||
      (def.id === 'speed-demon' && hasFastTime) ||
      (def.id === 'perfectionist' && hasUltraScore)
    ),
  }));
}

export function formatPlayTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export interface GamerLevel {
  level: number;
  title: string;
  titleZh: string;
  progress: number;
  nextTitle: string;
  nextTitleZh: string;
}

const LEVEL_THRESHOLDS = [0, 1, 5, 15, 30, 50, 75, 100, 200, 500];
const LEVEL_TITLES = [
  { title: 'Newcomer', titleZh: '新手' },
  { title: 'Beginner', titleZh: '初学者' },
  { title: 'Casual', titleZh: '休闲玩家' },
  { title: 'Regular', titleZh: '常客' },
  { title: 'Enthusiast', titleZh: '爱好者' },
  { title: 'Veteran', titleZh: '老玩家' },
  { title: 'Expert', titleZh: '专家' },
  { title: 'Master', titleZh: '大师' },
  { title: 'Legend', titleZh: '传奇' },
  { title: 'Champion', titleZh: '冠军' },
];

export function getGamerLevel(stats: GameStats): GamerLevel {
  const total = stats.totalGamesPlayed;
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level];
  const nextThreshold = level < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[level + 1] : currentThreshold * 2;
  const progress = nextThreshold > currentThreshold
    ? Math.round(((total - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    : 100;

  const levelInfo = LEVEL_TITLES[level];
  const nextInfo = level < LEVEL_TITLES.length - 1 ? LEVEL_TITLES[level + 1] : levelInfo;

  return {
    level: level + 1,
    title: levelInfo.title,
    titleZh: levelInfo.titleZh,
    progress: Math.min(progress, 100),
    nextTitle: nextInfo.title,
    nextTitleZh: nextInfo.titleZh,
  };
}
