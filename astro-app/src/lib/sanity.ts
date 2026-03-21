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
  // 获取所有游戏
  allGames: `*[_type == "game"] | order(isFeatured desc, title asc) {
    _id,
    "gameId": gameId,
    slug,
    title,
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    howToPlay,
    tips,
    "coverImage": coverImage.asset->url,
    releaseDate,
  }`,

  // 获取单个游戏
  gameBySlug: `*[_type == "game" && slug.current == $slug][0] {
    _id,
    "gameId": gameId,
    slug,
    title,
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    howToPlay,
    tips,
    "coverImage": coverImage.asset->url,
    releaseDate,
  }`,

  // 获取分类下的游戏
  gamesByCategory: `*[_type == "game" && category == $category] | order(isFeatured desc, title asc) {
    _id,
    "gameId": gameId,
    slug,
    title,
    icon,
    category,
    "colorGradient": colorGradient,
    "isFeatured": coalesce(isFeatured, false),
    description,
    howToPlay,
    tips,
    "coverImage": coverImage.asset->url,
    releaseDate,
  }`,

  // 获取所有 slug
  allSlugs: `*[_type == "game"].slug.current`,

  // 获取所有分类
  allCategories: `array::unique(*[_type == "game"].category)`,

  // 获取推荐游戏
  featuredGames: `*[_type == "game" && isFeatured == true] | order(title asc) {
    _id,
    "gameId": gameId,
    slug,
    title,
    icon,
    category,
    "colorGradient": colorGradient,
    description,
  }`,
}

/**
 * 获取所有游戏
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
