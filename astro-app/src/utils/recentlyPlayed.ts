/**
 * Recently Played Games Management Utility
 * Tracks and displays recently played games
 */

const RECENT_KEY = 'ruleword_recent';
const MAX_RECENT = 12;

interface RecentGame {
  slug: string;
  timestamp: number;
}

/**
 * Get recently played games
 */
export function getRecentlyPlayed(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(RECENT_KEY);
    if (!data) return [];

    const recent: RecentGame[] = JSON.parse(data);
    // Sort by timestamp descending and return slugs
    return recent
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(r => r.slug)
      .slice(0, MAX_RECENT);
  } catch (e) {
    console.error('Failed to load recently played:', e);
    return [];
  }
}

/**
 * Add a game to recently played
 */
export function addRecentlyPlayed(gameSlug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(RECENT_KEY);
    let recent: RecentGame[] = data ? JSON.parse(data) : [];

    // Remove existing entry if present
    recent = recent.filter(r => r.slug !== gameSlug);

    // Add new entry at the beginning
    recent.unshift({
      slug: gameSlug,
      timestamp: Date.now()
    });

    // Keep only MAX_RECENT entries
    recent = recent.slice(0, MAX_RECENT);

    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));

    // Trigger custom event for UI updates
    window.dispatchEvent(new CustomEvent('recentlyPlayedChanged', {
      detail: { slugs: recent.map(r => r.slug) }
    }));
  } catch (e) {
    console.error('Failed to add recently played:', e);
  }
}

/**
 * Get recently played games data
 */
export function getRecentlyPlayedGames<T extends { slug: string }>(allGames: T[]): T[] {
  const recent = getRecentlyPlayed();
  const gameMap = new Map(allGames.map(g => [g.slug, g]));
  return recent
    .map(slug => gameMap.get(slug))
    .filter((game): game is T => game !== undefined);
}

/**
 * Clear recently played history
 */
export function clearRecentlyPlayed(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENT_KEY);
    window.dispatchEvent(new CustomEvent('recentlyPlayedChanged', {
      detail: { slugs: [] }
    }));
  } catch (e) {
    console.error('Failed to clear recently played:', e);
  }
}
