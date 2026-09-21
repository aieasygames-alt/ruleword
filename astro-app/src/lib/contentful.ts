import { createClient, type EntryFieldTypes, type EntrySkeletonType } from 'contentful'
import type { GameEntry, GameFields, LocalizedGame } from '../types/contentful'

type GameSkeleton = EntrySkeletonType<{
  gameId: EntryFieldTypes.Symbol
  slug: EntryFieldTypes.Symbol
  title: EntryFieldTypes.Symbol
  icon?: EntryFieldTypes.Symbol
  category: EntryFieldTypes.Symbol
  colorGradient?: EntryFieldTypes.Symbol
  isFeatured?: EntryFieldTypes.Boolean
  description?: EntryFieldTypes.Text
  howToPlay?: EntryFieldTypes.Text
  tips?: EntryFieldTypes.Text
  coverImage?: EntryFieldTypes.AssetLink
  releaseDate?: EntryFieldTypes.Date
}, 'game'>

// Contentful Delivery API 客户端 (生产环境)
export const contentfulClient = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: import.meta.env.CONTENTFUL_DELIVERY_TOKEN ?? '',
  environment: import.meta.env.CONTENTFUL_ENVIRONMENT || 'master',
})

// Contentful Preview API 客户端 (草稿预览)
export const contentfulPreviewClient = createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID ?? '',
  accessToken: import.meta.env.CONTENTFUL_PREVIEW_TOKEN || '',
  host: 'preview.contentful.com',
  environment: import.meta.env.CONTENTFUL_ENVIRONMENT || 'master',
})

/**
 * 将 Contentful locale 代码转换为应用内部 locale
 */
export function toAppLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    'en-US': 'en',
    'zh-CN': 'zh',
  }
  return localeMap[locale] || locale
}

/**
 * 将应用内部 locale 转换为 Contentful locale 代码
 */
export function toContentfulLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    zh: 'zh-CN',
  }
  return localeMap[locale] || locale
}

/**
 * 获取所有游戏
 */
export async function getAllGames(locale: string = 'en'): Promise<GameEntry[]> {
  const cfLocale = toContentfulLocale(locale)
  const entries = await contentfulClient.getEntries<GameSkeleton>({
    content_type: 'game',
    locale: cfLocale,
    order: ['-fields.isFeatured', 'fields.title'],
  })
  return entries.items as unknown as GameEntry[]
}

/**
 * 根据 slug 获取单个游戏
 */
export async function getGameBySlug(
  slug: string,
  locale: string = 'en'
): Promise<GameEntry | null> {
  const cfLocale = toContentfulLocale(locale)
  const entries = await contentfulClient.getEntries<GameSkeleton>({
    content_type: 'game',
    'fields.slug': slug,
    locale: cfLocale,
    limit: 1,
  })
  return (entries.items[0] as unknown as GameEntry) || null
}

/**
 * 根据分类获取游戏列表
 */
export async function getGamesByCategory(
  category: string,
  locale: string = 'en'
): Promise<GameEntry[]> {
  const cfLocale = toContentfulLocale(locale)
  const entries = await contentfulClient.getEntries<GameSkeleton>({
    content_type: 'game',
    'fields.category': category,
    locale: cfLocale,
    order: ['-fields.isFeatured', 'fields.title'],
  })
  return entries.items as unknown as GameEntry[]
}

/**
 * 获取所有游戏分类
 */
export async function getCategories(): Promise<string[]> {
  const entries = await contentfulClient.getEntries<GameSkeleton>({
    content_type: 'game',
    select: ['fields.category'],
  })

  const categories = new Set(
    entries.items.map((item) => String(item.fields.category))
  )
  return Array.from(categories)
}

/**
 * 获取所有游戏的 slug (用于 getStaticPaths)
 */
export async function getAllGameSlugs(): Promise<string[]> {
  const entries = await contentfulClient.getEntries<GameSkeleton>({
    content_type: 'game',
    select: ['fields.slug'],
  })
  return entries.items.map((item) => String(item.fields.slug))
}

/**
 * 获取推荐游戏
 */
export async function getFeaturedGames(
  locale: string = 'en'
): Promise<GameEntry[]> {
  const cfLocale = toContentfulLocale(locale)
  const entries = await contentfulClient.getEntries<GameSkeleton>({
    content_type: 'game',
    'fields.isFeatured': true,
    locale: cfLocale,
    order: ['fields.title'],
  })
  return entries.items as unknown as GameEntry[]
}

/**
 * 转换 Contentful Entry 为本地化游戏数据格式
 */
export function transformGameEntry(entry: GameEntry): LocalizedGame {
  const { fields } = entry

  return {
    id: fields.gameId,
    slug: fields.slug,
    icon: fields.icon || '',
    category: fields.category,
    featured: fields.isFeatured || false,
    color: fields.colorGradient || 'from-gray-600 to-gray-800',
    name: fields.title,
    desc: fields.description || '',
    howToPlay: fields.howToPlay,
    tips: fields.tips,
    coverImage: fields.coverImage?.fields?.file?.url,
    releaseDate: fields.releaseDate,
  }
}

/**
 * 批量转换游戏数据
 */
export function transformAllGames(entries: GameEntry[]): LocalizedGame[] {
  return entries.map(transformGameEntry)
}
