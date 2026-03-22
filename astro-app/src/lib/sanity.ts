/**
 * Sanity CMS 客户端配置
 */

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Sanity 客户端配置
export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || 'production',
  useCdn: true, // 使用 CDN 缓存
  apiVersion: '2024-01-01',
  perspective: 'published',
})

// 图片 URL 构建器
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// GROQ 查询
export const queries = {
  // 获取所有游戏（内置 + 第三方）
  allGames: `*[_type in ["game", "externalGame"]] | order(isFeatured desc, title asc) {
    _id,
    _type,
    "gameId": gameId,
    slug,
    title,
    "titleZh": coalesce(titleZh, ""),
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    "descriptionZh": coalesce(descriptionZh, ""),
    howToPlay,
    "howToPlayZh": coalesce(howToPlayZh, ""),
    tips,
    "tipsZh": coalesce(tipsZh, ""),
    "coverImage": coverImage.asset->url,
    releaseDate,
    // 第三方游戏特有字段
    "gameUrl": coalesce(gameUrl, ""),
    "iframeWidth": coalesce(iframeWidth, "100%"),
    "iframeHeight": coalesce(iframeHeight, "600px"),
    "allowFullscreen": coalesce(allowFullscreen, true),
    "sourceName": coalesce(sourceName, ""),
    "sourceUrl": coalesce(sourceUrl, ""),
  }`,

  // 获取单个游戏（内置 + 第三方）
  gameBySlug: `*[_type in ["game", "externalGame"] && slug.current == $slug][0] {
    _id,
    _type,
    "gameId": gameId,
    slug,
    title,
    "titleZh": coalesce(titleZh, ""),
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    "descriptionZh": coalesce(descriptionZh, ""),
    howToPlay,
    "howToPlayZh": coalesce(howToPlayZh, ""),
    tips,
    "tipsZh": coalesce(tipsZh, ""),
    "coverImage": coverImage.asset->url,
    releaseDate,
    // 第三方游戏特有字段
    "gameUrl": coalesce(gameUrl, ""),
    "iframeWidth": coalesce(iframeWidth, "100%"),
    "iframeHeight": coalesce(iframeHeight, "600px"),
    "allowFullscreen": coalesce(allowFullscreen, true),
    "sourceName": coalesce(sourceName, ""),
    "sourceUrl": coalesce(sourceUrl, ""),
  }`,

  // 获取分类下的游戏（内置 + 第三方）
  gamesByCategory: `*[_type in ["game", "externalGame"] && category == $category] | order(isFeatured desc, title asc) {
    _id,
    _type,
    "gameId": gameId,
    slug,
    title,
    "titleZh": coalesce(titleZh, ""),
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    "descriptionZh": coalesce(descriptionZh, ""),
    // 第三方游戏特有字段
    "gameUrl": coalesce(gameUrl, ""),
    "iframeWidth": coalesce(iframeWidth, "100%"),
    "iframeHeight": coalesce(iframeHeight, "600px"),
    "allowFullscreen": coalesce(allowFullscreen, true),
  }`,

  // 获取所有 slug（内置 + 第三方）
  allSlugs: `*[_type in ["game", "externalGame"]].slug.current`,

  // 获取所有分类（内置 + 第三方）
  allCategories: `array::unique(*[_type in ["game", "externalGame"]].category)`,

  // 获取推荐游戏（内置 + 第三方）
  featuredGames: `*[_type in ["game", "externalGame"] && isFeatured == true] | order(title asc) {
    _id,
    _type,
    "gameId": gameId,
    slug,
    title,
    "titleZh": coalesce(titleZh, ""),
    icon,
    category,
    "colorGradient": colorGradient,
    description,
    // 第三方游戏特有字段
    "gameUrl": coalesce(gameUrl, ""),
  }`,

  // 仅获取第三方游戏
  allExternalGames: `*[_type == "externalGame"] | order(isFeatured desc, title asc) {
    _id,
    "gameId": gameId,
    slug,
    title,
    "titleZh": coalesce(titleZh, ""),
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    "descriptionZh": coalesce(descriptionZh, ""),
    howToPlay,
    "howToPlayZh": coalesce(howToPlayZh, ""),
    "gameUrl": coalesce(gameUrl, ""),
    "iframeWidth": coalesce(iframeWidth, "100%"),
    "iframeHeight": coalesce(iframeHeight, "600px"),
    "allowFullscreen": coalesce(allowFullscreen, true),
    "sourceName": coalesce(sourceName, ""),
    "sourceUrl": coalesce(sourceUrl, ""),
  }`,
}

/**
 * 获取所有游戏（内置 + 第三方）
 */
export async function getAllGames() {
  return sanityClient.fetch(queries.allGames)
}

/**
 * 根据 slug 获取单个游戏
 */
export async function getGameBySlug(slug: string) {
  return sanityClient.fetch(queries.gameBySlug, { slug })
}

/**
 * 根据分类获取游戏
 */
export async function getGamesByCategory(category: string) {
  return sanityClient.fetch(queries.gamesByCategory, { category })
}

/**
 * 获取所有游戏 slug (用于 getStaticPaths)
 */
export async function getAllGameSlugs(): Promise<string[]> {
  return sanityClient.fetch(queries.allSlugs)
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<string[]> {
  return sanityClient.fetch(queries.allCategories)
}

/**
 * 获取推荐游戏
 */
export async function getFeaturedGames() {
  return sanityClient.fetch(queries.featuredGames)
}

/**
 * 获取所有第三方游戏
 */
export async function getAllExternalGames() {
  return sanityClient.fetch(queries.allExternalGames)
}

/**
 * 判断是否为第三方游戏
 */
export function isExternalGame(game: any): boolean {
  return game?._type === 'externalGame'
}
