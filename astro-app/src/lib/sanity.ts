/**
 * Sanity CMS 客户端配置
 * 支持多语言 (8 种语言)、博客、攻略、Hub 页面、游戏变体
 */

import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

// Sanity 客户端配置
export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
  perspective: 'published',
})

// 图片 URL 构建器
const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// 支持的语言
export const LOCALES = ['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh_CN', 'zh_TW'] as const
export type Locale = typeof LOCALES[number]

// 通用游戏字段投影 (不做多语言投影，保留原始结构)
const gameFields = `
  _id,
  _type,
  "gameId": gameId,
  slug,
  title,
  icon,
  category,
  "colorGradient": colorGradient,
  "isFeatured": coalesce(isFeatured, false),
  description,
  objectives,
  howToPlay,
  tips,
  "coverImageUrl": coalesce(coverImage.asset->url, ogImage.asset->url, ""),
  "screenshots": screenshots[].asset->url,
  "ogImageUrl": coalesce(ogImage.asset->url, coverImage.asset->url, ""),
  releaseDate,
  seo,
  rules {
    controls,
    mechanics,
    features,
  },
  faq
`

// 第三方游戏额外字段
const externalFields = `
  "gameUrl": coalesce(gameUrl, ""),
  "iframeWidth": coalesce(iframeWidth, "100%"),
  "iframeHeight": coalesce(iframeHeight, "600px"),
  "allowFullscreen": coalesce(allowFullscreen, true),
  "sourceName": coalesce(sourceName, ""),
  "sourceUrl": coalesce(sourceUrl, "")
`

// GROQ 查询
export const queries = {
  // 获取所有游戏（内置 + 第三方）
  allGames: `*[_type in ["game", "externalGame"]] | order(isFeatured desc, _id asc) {
    ${gameFields},
    ${externalFields}
  }`,

  // 获取单个游戏
  gameBySlug: `*[_type in ["game", "externalGame"] && slug.current == $slug][0] {
    ${gameFields},
    ${externalFields}
  }`,

  // 按分类获取游戏
  gamesByCategory: `*[_type in ["game", "externalGame"] && category == $category] | order(isFeatured desc, _id asc) {
    _id, _type, "gameId": gameId, slug, title, icon, category, "colorGradient": colorGradient, "isFeatured": coalesce(isFeatured, false), description,
    ${externalFields}
  }`,

  // 获取所有 slug
  allSlugs: `*[_type in ["game", "externalGame"]].slug.current`,

  // 获取所有分类
  allCategories: `array::unique(*[_type in ["game", "externalGame"]].category)`,

  // 获取推荐游戏
  featuredGames: `*[_type in ["game", "externalGame"] && isFeatured == true] | order(_id asc) {
    _id, _type, "gameId": gameId, slug, title, icon, category, "colorGradient": colorGradient, description,
    ${externalFields}
  }`,

  // ===== 博客 =====
  allBlogPosts: `*[_type == "blogPost"] | order(publishedAt desc) {
    _id, slug, title, excerpt, category,
    "coverImageUrl": coalesce(coverImage.asset->url, ""),
    "authorName": author->name,
    publishedAt,
    tags,
    seo,
  }`,

  blogPostBySlug: `*[_type == "blogPost" && slug.current == $slug][0] {
    _id, slug, title, excerpt, category, content,
    "coverImageUrl": coalesce(coverImage.asset->url, ""),
    "author": author-> { name, slug, "avatarUrl": avatar.asset->url, bio },
    publishedAt,
    "relatedGames": relatedGames[]-> { _id, "gameId": gameId, slug, title, icon, category },
    tags,
    seo,
  }`,

  // ===== 攻略 =====
  allGameGuides: `*[_type == "gameGuide"] | order(_id asc) {
    _id, slug, title, difficulty,
    "gameTitle": game->title,
    seo,
  }`,

  gameGuideBySlug: `*[_type == "gameGuide" && slug.current == $slug][0] {
    _id, slug, title, intro, sections, tips, difficulty,
    "game": game-> { _id, "gameId": gameId, slug, title },
    seo,
  }`,

  // ===== Hub 页面 =====
  allHubPages: `*[_type == "hubPage"] | order(_id asc) {
    _id, slug, title, tagline, icon, colorGradient,
  }`,

  hubPageBySlug: `*[_type == "hubPage" && slug.current == $slug][0] {
    _id, slug, title, tagline, icon, colorGradient,
    whatIs, benefits, gettingStarted,
    "featuredGames": featuredGames[]-> { _id, "gameId": gameId, slug, title, icon, category },
    faq,
    seo,
  }`,

  // ===== 游戏变体 =====
  variantsByGameId: `*[_type == "gameVariant" && game->gameId == $gameId] {
    _id, slug, variantId, title, difficulty, description, seo,
  }`,

  // ===== 分类 =====
  allCategoryDocs: `*[_type == "category"] | order(order asc) {
    _id, categoryId, name, slug, icon, color, description, order, isPublished,
  }`,
}

// ===== 查询函数 =====

export async function getAllGames() {
  return sanityClient.fetch(queries.allGames)
}

export async function getGameBySlug(slug: string) {
  return sanityClient.fetch(queries.gameBySlug, { slug })
}

export async function getGamesByCategory(category: string) {
  return sanityClient.fetch(queries.gamesByCategory, { category })
}

export async function getAllGameSlugs(): Promise<string[]> {
  return sanityClient.fetch(queries.allSlugs)
}

export async function getCategories(): Promise<string[]> {
  return sanityClient.fetch(queries.allCategories)
}

export async function getFeaturedGames() {
  return sanityClient.fetch(queries.featuredGames)
}

export async function getAllBlogPosts() {
  return sanityClient.fetch(queries.allBlogPosts)
}

export async function getBlogPostBySlug(slug: string) {
  return sanityClient.fetch(queries.blogPostBySlug, { slug })
}

export async function getAllGameGuides() {
  return sanityClient.fetch(queries.allGameGuides)
}

export async function getGameGuideBySlug(slug: string) {
  return sanityClient.fetch(queries.gameGuideBySlug, { slug })
}

export async function getAllHubPages() {
  return sanityClient.fetch(queries.allHubPages)
}

export async function getHubPageBySlug(slug: string) {
  return sanityClient.fetch(queries.hubPageBySlug, { slug })
}

export async function getVariantsByGameId(gameId: string) {
  return sanityClient.fetch(queries.variantsByGameId, { gameId })
}

export async function getAllCategoryDocs() {
  return sanityClient.fetch(queries.allCategoryDocs)
}

export function isExternalGame(game: any): boolean {
  return game?._type === 'externalGame'
}

/**
 * 从多语言字段中获取指定语言的内容，回退到英语
 * 兼容两种格式：
 * 1. 多语言对象: { en: "...", zh_CN: "...", fr: "..." }
 * 2. 简单字符串: "..."
 */
export function getLocalizedValue(obj: any, field: string, locale: string): string {
  if (!obj?.[field]) return ''
  const val = obj[field]
  if (typeof val === 'string') return val
  if (typeof val === 'object') return val[locale] || val['en'] || ''
  return ''
}
