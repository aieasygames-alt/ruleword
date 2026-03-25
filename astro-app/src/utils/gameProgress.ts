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
