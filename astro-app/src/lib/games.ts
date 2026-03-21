/**
 * 统一游戏数据获取层
 *
 * 支持 Sanity CMS、Contentful 和本地 JSON 文件三种数据源
 * 根据环境变量自动切换数据源
 *
 * 优先级:
 * 1. SANITY_PROJECT_ID 设置 → 使用 Sanity
 * 2. CONTENTFUL_SPACE_ID 设置 → 使用 Contentful
 * 3. 默认 → 使用本地 JSON 文件
 */

import { getCollection } from 'astro:content'
import type { LocalizedGame } from '../types/contentful'

// 检查可用的数据源
const USE_SANITY = !!import.meta.env.SANITY_PROJECT_ID
const USE_CONTENTFUL = !!import.meta.env.CONTENTFUL_SPACE_ID

console.log('Data source:', USE_SANITY ? 'Sanity' : USE_CONTENTFUL ? 'Contentful' : 'Local')

/**
 * 游戏数据结构 (兼容现有格式)
 */
export interface GameData {
  id: string
  slug: string
  icon: string
  category: string
  featured?: boolean
  color: string
  name: string
  nameZh: string
  desc: string
  descZh: string
  howToPlay?: string
  howToPlayZh?: string
  tips?: string[]
  tipsZh?: string[]
}

/**
 * 从本地 JSON 转换为 GameData
 */
function localToGameData(data: any): GameData {
  return {
    id: data.id,
    slug: data.slug,
    icon: data.icon || '',
    category: data.category,
    featured: data.featured || false,
    color: data.color || 'from-gray-600 to-gray-800',
    name: data.en?.name || data.name || '',
    nameZh: data.zh?.name || data.en?.name || '',
    desc: data.en?.desc || data.desc || '',
    descZh: data.zh?.desc || data.en?.desc || '',
    howToPlay: data.en?.howToPlay,
    howToPlayZh: data.zh?.howToPlay,
    tips: data.en?.tips || [],
    tipsZh: data.zh?.tips || data.en?.tips || [],
  }
}

/**
 * 从 Sanity 转换为 GameData
 */
function sanityToGameData(data: any): GameData {
  return {
    id: data.gameId,
    slug: data.slug?.current || data.slug,
    icon: data.icon || '',
    category: data.category,
    featured: data.isFeatured || false,
    color: data.colorGradient || 'from-gray-600 to-gray-800',
    name: data.title || '',
    nameZh: data.title || '', // Sanity 多语言需要单独处理
    desc: data.description || '',
    descZh: data.description || '',
    howToPlay: data.howToPlay,
    howToPlayZh: data.howToPlay,
    tips: data.tips?.split('\n').filter(Boolean) || [],
    tipsZh: data.tips?.split('\n').filter(Boolean) || [],
  }
}

/**
 * 从 Contentful Entry 转换为 GameData
 */
function contentfulToGameData(entry: any): GameData {
  const fields = entry.fields
  return {
    id: fields.gameId,
    slug: fields.slug,
    icon: fields.icon || '',
    category: fields.category,
    featured: fields.isFeatured || false,
    color: fields.colorGradient || 'from-gray-600 to-gray-800',
    name: fields.title || '',
    nameZh: fields.title || '',
    desc: fields.description || '',
    descZh: fields.description || '',
    howToPlay: fields.howToPlay,
    howToPlayZh: fields.howToPlay,
    tips: fields.tips?.split('\n\n').map((t: string) => t.replace('• ', '')) || [],
    tipsZh: fields.tips?.split('\n\n').map((t: string) => t.replace('• ', '')) || [],
  }
}

/**
 * 获取所有游戏
 */
export async function getAllGames(): Promise<GameData[]> {
  // Sanity 数据源
  if (USE_SANITY) {
    try {
      const { getAllGames: getSanityGames } = await import('./sanity')
      const games = await getSanityGames()
      return games.map(sanityToGameData)
    } catch (error) {
      console.warn('Sanity fetch failed, falling back to local data:', error)
    }
  }

  // Contentful 数据源
  if (USE_CONTENTFUL) {
    try {
      const { getAllGames: getContentfulGames } = await import('./contentful')
      const entries = await getContentfulGames('en-US')
      return entries.map(contentfulToGameData)
    } catch (error) {
      console.warn('Contentful fetch failed, falling fallback to local data:', error)
    }
  }

  // 本地数据源
  const gamesCollection = await getCollection('games')
  return gamesCollection.map((entry) => localToGameData(entry.data))
}

/**
 * 根据 slug 获取单个游戏
 */
export async function getGameBySlug(slug: string): Promise<GameData | null> {
  // Sanity 数据源
  if (USE_SANITY) {
    try {
      const { getGameBySlug: getSanityGame } = await import('./sanity')
      const game = await getSanityGame(slug)
      return game ? sanityToGameData(game) : null
    } catch (error) {
      console.warn('Sanity fetch failed, falling back to local data:', error)
    }
  }

  // Contentful 数据源
  if (USE_CONTENTFUL) {
    try {
      const { getGameBySlug: getContentfulGame } = await import('./contentful')
      const entry = await getContentfulGame(slug, 'en-US')
      return entry ? contentfulToGameData(entry) : null
    } catch (error) {
      console.warn('Contentful fetch failed, falling back to local data:', error)
    }
  }

  // 本地数据源
  const gamesCollection = await getCollection('games')
  const game = gamesCollection.find((entry) => entry.data.slug === slug)
  return game ? localToGameData(game.data) : null
}

/**
 * 根据分类获取游戏
 */
export async function getGamesByCategory(category: string): Promise<GameData[]> {
  // Sanity 数据源
  if (USE_SANITY) {
    try {
      const { getGamesByCategory: getSanityGamesByCategory } = await import('./sanity')
      const games = await getSanityGamesByCategory(category)
      return games.map(sanityToGameData)
    } catch (error) {
      console.warn('Sanity fetch failed, falling back to local data:', error)
    }
  }

  // Contentful 数据源
  if (USE_CONTENTFUL) {
    try {
      const { getGamesByCategory: getContentfulGamesByCategory } = await import('./contentful')
      const entries = await getContentfulGamesByCategory(category, 'en-US')
      return entries.map(contentfulToGameData)
    } catch (error) {
      console.warn('Contentful fetch failed, falling back to local data:', error)
    }
  }

  // 本地数据源
  const gamesCollection = await getCollection('games')
  return gamesCollection
    .filter((entry) => entry.data.category === category)
    .map((entry) => localToGameData(entry.data))
}

/**
 * 获取所有游戏 slug (用于 getStaticPaths)
 */
export async function getAllGameSlugs(): Promise<string[]> {
  // Sanity 数据源
  if (USE_SANITY) {
    try {
      const { getAllGameSlugs: getSanitySlugs } = await import('./sanity')
      return await getSanitySlugs()
    } catch (error) {
      console.warn('Sanity fetch failed, falling back to local data:', error)
    }
  }

  // Contentful 数据源
  if (USE_CONTENTFUL) {
    try {
      const { getAllGameSlugs: getContentfulSlugs } = await import('./contentful')
      return await getContentfulSlugs()
    } catch (error) {
      console.warn('Contentful fetch failed, falling back to local data:', error)
    }
  }

  // 本地数据源
  const gamesCollection = await getCollection('games')
  return gamesCollection.map((entry) => entry.data.slug)
}

/**
 * 获取推荐游戏
 */
export async function getFeaturedGames(): Promise<GameData[]> {
  const allGames = await getAllGames()
  return allGames.filter((game) => game.featured)
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<string[]> {
  // Sanity 数据源
  if (USE_SANITY) {
    try {
      const { getCategories: getSanityCategories } = await import('./sanity')
      return await getSanityCategories()
    } catch (error) {
      console.warn('Sanity fetch failed, falling back to local data:', error)
    }
  }

  // Contentful 数据源
  if (USE_CONTENTFUL) {
    try {
      const { getCategories: getContentfulCategories } = await import('./contentful')
      return await getContentfulCategories()
    } catch (error) {
      console.warn('Contentful fetch failed, falling back to local data:', error)
    }
  }

  // 本地数据源
  const gamesCollection = await getCollection('games')
  const categories = new Set(gamesCollection.map((entry) => entry.data.category))
  return Array.from(categories)
}

/**
 * 数据源状态
 */
export function getDataSource(): 'sanity' | 'contentful' | 'local' {
  if (USE_SANITY) return 'sanity'
  if (USE_CONTENTFUL) return 'contentful'
  return 'local'
}
