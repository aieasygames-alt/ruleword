/**
 * Favorite Games Management Utility
 * Handles saving/loading user's favorite games using localStorage
 */

const FAVORITES_KEY = 'ruleword_favorites';

/**
 * Get all favorite game slugs
 */
export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load favorites:', e);
    return [];
  }
}

/**
 * Check if a game is favorited
 */
export function isFavorite(gameSlug: string): boolean {
  return getFavorites().includes(gameSlug);
}

/**
 * Add a game to favorites
 */
export function addFavorite(gameSlug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    if (!favorites.includes(gameSlug)) {
      favorites.push(gameSlug);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

      // Trigger custom event for UI updates
      window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites } }));
    }
  } catch (e) {
    console.error('Failed to add favorite:', e);
  }
}

/**
 * Remove a game from favorites
 */
export function removeFavorite(gameSlug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(gameSlug);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

      // Trigger custom event for UI updates
      window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites } }));
    }
  } catch (e) {
    console.error('Failed to remove favorite:', e);
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(gameSlug: string): boolean {
  if (isFavorite(gameSlug)) {
    removeFavorite(gameSlug);
    return false;
  } else {
    addFavorite(gameSlug);
    return true;
  }
}

/**
 * Get favorite games data
 */
export function getFavoriteGames<T extends { slug: string }>(allGames: T[]): T[] {
  const favorites = getFavorites();
  return allGames.filter(game => favorites.includes(game.slug));
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(FAVORITES_KEY);
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites: [] } }));
  } catch (e) {
    console.error('Failed to clear favorites:', e);
  }
}
