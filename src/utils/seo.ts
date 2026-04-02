// SEO utility functions for RuleWord

/**
 * Generate SEO-friendly H1 title for game pages
 * Format: "Play [Game Name] Online Free" (EN) or "免费在线玩 [游戏名称]" (ZH)
 */
export function getSeoH1(gameName: string, gameNameZh: string, language: 'en' | 'zh'): string {
  if (language === 'zh') {
    return `免费在线玩 ${gameNameZh}`
  }
  return `Play ${gameName} Online Free`
}

/**
 * Generate SEO-friendly meta title for game pages
 * Format: "[Game Name] - Play Online Free | RuleWord" (EN) or "[游戏名称] - 免费在线玩 | RuleWord" (ZH)
 */
export function getSeoTitle(gameName: string, gameNameZh: string, language: 'en' | 'zh'): string {
  if (language === 'zh') {
    return `${gameNameZh} - 免费在线玩 | RuleWord`
  }
  return `${gameName} - Play Online Free | RuleWord`
}

/**
 * Generate SEO-optimized description for game pages
 */
export function getSeoDescription(
  gameName: string,
  gameNameZh: string,
  shortDesc: string,
  shortDescZh: string,
  language: 'en' | 'zh'
): string {
  if (language === 'zh') {
    return `免费在线玩${gameNameZh}！${shortDescZh}。无需下载，打开即玩。`
  }
  return `Play ${gameName} online for free! ${shortDesc}. No download required.`
}

/**
 * Generate keywords for a game
 */
export function getSeoKeywords(
  gameName: string,
  gameNameZh: string,
  category: string,
  language: 'en' | 'zh'
): string {
  const baseKeywords = language === 'zh'
    ? `${gameNameZh}, 在线游戏, 免费游戏, ${category}`
    : `${gameName}, online game, free game, ${category}`

  const modifierKeywords = language === 'zh'
    ? '无需下载, 网页游戏, 益智游戏'
    : 'no download, browser game, puzzle game'

  return `${baseKeywords}, ${modifierKeywords}`
}

/**
 * Game categories with SEO-friendly names
 */
export const categorySeoNames = {
  en: {
    word: 'Word Games',
    logic: 'Logic & Number Puzzles',
    strategy: 'Strategy Games',
    arcade: 'Classic Arcade Games',
    memory: 'Memory & Brain Training',
    tools: 'Utility Tools'
  },
  zh: {
    word: '文字游戏',
    logic: '数字逻辑谜题',
    strategy: '策略对战游戏',
    arcade: '经典街机游戏',
    memory: '记忆脑力训练',
    tools: '实用工具'
  }
}

/**
 * Generate homepage H1 with dynamic keyword
 */
export function getHomepageH1(gameCount: number, language: 'en' | 'zh'): string {
  if (language === 'zh') {
    return `${gameCount}+免费在线游戏 - 无需下载`
  }
  return `${gameCount}+ Free Online Games - No Download Required`
}
