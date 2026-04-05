// ===== UTILITY FUNCTIONS =====

/**
 * Seeded random number generator for reproducible level generation
 */
export function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 12345) % 2147483647
    return (s & 0x7fffffff) / 0x7fffffff
  }
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate star rating based on mistakes
 */
export function getStarRating(mistakes: number): number {
  return mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1
}

/**
 * Lighten a hex color by percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)
}

/**
 * Darken a hex color by percentage
 */
export function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent)
}
