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
 * 游戏规则结构
 */
export interface GameRules {
  controls?: string
  mechanics?: string[]
  features?: string[]
}

/**
 * 游戏FAQ结构
 */
export interface GameFAQ {
  question: string
  answer: string
}

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
  // 新增详细描述字段
  description?: string
  descriptionZh?: string
  objectives?: string
  objectivesZh?: string
  howToPlay?: string
  howToPlayZh?: string
  rules?: GameRules
  rulesZh?: GameRules
  tips?: string[]
  tipsZh?: string[]
  faq?: GameFAQ[]
  faqZh?: GameFAQ[]
  // 第三方游戏特有字段
  isExternal?: boolean
  gameUrl?: string
  iframeWidth?: string
  iframeHeight?: string
  allowFullscreen?: boolean
  sourceName?: string
  sourceUrl?: string
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
    // 新增详细描述字段
    description: data.en?.description || data.en?.desc || '',
    descriptionZh: data.zh?.description || data.zh?.desc || data.en?.description || data.en?.desc || '',
    objectives: data.en?.objectives || '',
    objectivesZh: data.zh?.objectives || data.en?.objectives || '',
    howToPlay: data.en?.howToPlay,
    howToPlayZh: data.zh?.howToPlay,
    rules: data.en?.rules || {},
    rulesZh: data.zh?.rules || data.en?.rules || {},
    tips: data.en?.tips || [],
    tipsZh: data.zh?.tips || data.en?.tips || [],
    faq: data.en?.faq || [],
    faqZh: data.zh?.faq || data.en?.faq || [],
  }
}

/**
 * 从 Sanity 转换为 GameData
 * 兼容两种数据格式：
 * 1. 简单字段: { title: "Wordle", description: "..." }
 * 2. 多语言对象: { title: { en: "Wordle", zh_CN: "猜词" }, description: { ... } }
 */
function sanityToGameData(data: any): GameData {
  // 从字段中提取字符串值，兼容简单字符串和多语言对象
  const str = (field: any, locale: string = 'en'): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    if (typeof field === 'object' && !Array.isArray(field)) {
      return field[locale] || field['en'] || ''
    }
    return ''
  }

  // 处理 tips 字段
  const parseTips = (tips: any): string[] => {
    if (!tips) return []
    if (Array.isArray(tips)) return tips.filter(Boolean)
    if (typeof tips === 'string') return tips.split('\n').filter(Boolean)
    if (typeof tips === 'object') {
      // 多语言对象: { en: [...], zh_CN: [...] }
      const arr = tips['en'] || Object.values(tips)[0] || []
      return Array.isArray(arr) ? arr.filter(Boolean) : []
    }
    return []
  }

  // 处理 FAQ 字段
  const parseFaq = (faq: any): GameFAQ[] => {
    if (!faq) return []
    let items = faq
    if (typeof faq === 'object' && !Array.isArray(faq)) {
      items = faq['en'] || Object.values(faq)[0] || []
    }
    if (!Array.isArray(items)) return []
    return items.map((item: any) => ({
      question: item.question || '',
      answer: item.answer || '',
    }))
  }

  // 处理 Rules 字段
  const parseRules = (rules: any): GameRules => {
    if (!rules) return {}
    return {
      controls: str(rules.controls),
      mechanics: parseTips(rules.mechanics),
      features: parseTips(rules.features),
    }
  }

  const isExternal = data._type === 'externalGame'

  return {
    id: data.gameId,
    slug: data.slug?.current || data.slug,
    icon: data.icon || '',
    category: data.category,
    featured: data.isFeatured || false,
    color: data.colorGradient || 'from-gray-600 to-gray-800',
    name: str(data.title, 'en'),
    nameZh: str(data.title, 'zh_CN') || str(data.title, 'zh_TW') || str(data.title, 'en'),
    desc: str(data.description, 'en'),
    descZh: str(data.description, 'zh_CN') || str(data.description, 'zh_TW') || str(data.description, 'en'),
    description: str(data.description, 'en'),
    descriptionZh: str(data.description, 'zh_CN') || str(data.description, 'zh_TW') || str(data.description, 'en'),
    objectives: str(data.objectives, 'en'),
    objectivesZh: str(data.objectives, 'zh_CN') || str(data.objectives, 'en'),
    howToPlay: str(data.howToPlay, 'en') || undefined,
    howToPlayZh: str(data.howToPlay, 'zh_CN') || str(data.howToPlay, 'en') || undefined,
    rules: parseRules(data.rules),
    rulesZh: {}, // TODO: 多语言规则支持
    tips: parseTips(data.tips),
    tipsZh: [], // TODO: 多语言 tips 支持
    faq: parseFaq(data.faq),
    faqZh: [], // TODO: 多语言 FAQ 支持
    // 第三方游戏特有字段
    isExternal,
    gameUrl: data.gameUrl || '',
    iframeWidth: data.iframeWidth || '100%',
    iframeHeight: data.iframeHeight || '600px',
    allowFullscreen: data.allowFullscreen ?? true,
    sourceName: data.sourceName || '',
    sourceUrl: data.sourceUrl || '',
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
 * 合并 CMS 和本地数据，确保本地独有游戏也能被获取
 */
export async function getAllGames(): Promise<GameData[]> {
  // 获取本地游戏 (始终包含)
  const gamesCollection = await getCollection('games')
  const localGames = gamesCollection.map((entry) => localToGameData(entry.data))

  // Sanity 数据源 - 合并到本地数据
  if (USE_SANITY) {
    try {
      const { getAllGames: getSanityGames } = await import('./sanity')
      const sanityGames = await getSanityGames()
      const cmsGames = sanityGames.map(sanityToGameData)
      // 合并：本地游戏优先（用于覆盖），然后添加 CMS 独有的游戏
      const localSlugs = new Set(localGames.map(g => g.slug))
      const uniqueCmsGames = cmsGames.filter(g => !localSlugs.has(g.slug))
      return [...localGames, ...uniqueCmsGames]
    } catch (error: any) {
      console.warn('Sanity fetch failed, falling back to local data:', error?.message || error)
    }
  }

  // Contentful 数据源 - 合并到本地数据
  if (USE_CONTENTFUL) {
    try {
      const { getAllGames: getContentfulGames } = await import('./contentful')
      const entries = await getContentfulGames('en-US')
      const cmsGames = entries.map(contentfulToGameData)
      // 合并：本地游戏优先（用于覆盖），然后添加 CMS 独有的游戏
      const localSlugs = new Set(localGames.map(g => g.slug))
      const uniqueCmsGames = cmsGames.filter(g => !localSlugs.has(g.slug))
      return [...localGames, ...uniqueCmsGames]
    } catch (error) {
      console.warn('Contentful fetch failed, falling fallback to local data:', error)
    }
  }

  // 仅本地数据源
  return localGames
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
    } catch (error: any) {
      console.warn('Sanity fetch failed, falling back to local data:', error?.message || error)
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
    } catch (error: any) {
      console.warn('Sanity fetch failed, falling back to local data:', error?.message || error)
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
 * 合并 CMS 和本地数据，确保本地独有游戏也能生成页面
 */
export async function getAllGameSlugs(): Promise<string[]> {
  // 获取本地 slugs (始终包含)
  const gamesCollection = await getCollection('games')
  const localSlugs = gamesCollection.map((entry) => entry.data.slug)

  // Sanity 数据源 - 合并到本地数据
  if (USE_SANITY) {
    try {
      const { getAllGameSlugs: getSanitySlugs } = await import('./sanity')
      const sanitySlugs = await getSanitySlugs()
      // 合并并去重
      return [...new Set([...localSlugs, ...sanitySlugs])]
    } catch (error: any) {
      console.warn('Sanity fetch failed, falling back to local data:', error?.message || error)
    }
  }

  // Contentful 数据源 - 合并到本地数据
  if (USE_CONTENTFUL) {
    try {
      const { getAllGameSlugs: getContentfulSlugs } = await import('./contentful')
      const contentfulSlugs = await getContentfulSlugs()
      // 合并并去重
      return [...new Set([...localSlugs, ...contentfulSlugs])]
    } catch (error) {
      console.warn('Contentful fetch failed, falling back to local data:', error)
    }
  }

  // 仅本地数据源
  return localSlugs
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
    } catch (error: any) {
      console.warn('Sanity fetch failed, falling back to local data:', error?.message || error)
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
