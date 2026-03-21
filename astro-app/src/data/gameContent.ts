/**
 * CMS 内容加载工具
 * 从 Astro Content Collections 加载游戏内容，与现有代码兼容
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import type { Language } from './i18n'

// 游戏内容类型（来自 CMS）
export interface GameContent {
  id: string
  slug: string
  icon: string
  category: 'word' | 'logic' | 'strategy' | 'arcade' | 'memory' | 'skill' | 'puzzle'
  featured?: boolean
  color: string
  en: {
    name: string
    desc: string
    howToPlay?: string
    tips?: string[]
  }
  zh?: {
    name: string
    desc: string
    howToPlay?: string
    tips?: string[]
  }
}

/**
 * 获取所有游戏内容
 */
export async function getAllGames(): Promise<GameContent[]> {
  const collection = await getCollection('games')
  return collection.map(entry => entry.data as GameContent)
}

/**
 * 根据 slug 获取游戏内容
 */
export async function getGameBySlug(slug: string): Promise<GameContent | null> {
  const entry = await getEntry('games', slug)
  return entry?.data as GameContent | null
}

/**
 * 获取本地化的游戏名称
 */
export function getGameName(game: GameContent, lang: Language): string {
  if ((lang === 'zh-CN' || lang === 'zh-TW') && game.zh) {
    return game.zh.name
  }
  return game.en.name
}

/**
 * 获取本地化的游戏描述
 */
export function getGameDesc(game: GameContent, lang: Language): string {
  if ((lang === 'zh-CN' || lang === 'zh-TW') && game.zh) {
    return game.zh.desc
  }
  return game.en.desc
}

/**
 * 获取本地化的游戏指南
 */
export function getGameGuideContent(game: GameContent, lang: Language) {
  const content = (lang === 'zh-CN' || lang === 'zh-TW') && game.zh ? game.zh : game.en
  return {
    intro: content.desc,
    howToPlay: content.howToPlay || '',
    tips: content.tips || [],
  }
}

/**
 * 按分类筛选游戏
 */
export async function getGamesByCategory(category: string): Promise<GameContent[]> {
  const allGames = await getAllGames()
  if (category === 'all') return allGames
  return allGames.filter(game => game.category === category)
}

/**
 * 获取精选游戏
 */
export async function getFeaturedGames(): Promise<GameContent[]> {
  const allGames = await getAllGames()
  return allGames.filter(game => game.featured)
}
