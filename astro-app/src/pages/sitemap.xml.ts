import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { categories } from '../data/categories'
import { gameGuides } from '../data/gameGuidesSEO'
import { hubPages } from '../data/hubPages'
import { blogPosts } from '../data/blogPosts'
import { storyGenres } from '../data/storyGenres'
import { storyVariants } from '../data/storyVariants'
import { getAllVariants } from '../data/gameVariants'

// Featured games get higher priority
const featuredSlugs = ['wordle', 'sudoku', '2048', 'tetris', 'chess', 'pac-man', 'minesweeper', 'snake', 'nonogram', 'spelling-bee', 'connections', 'word-search', 'boggle', 'mastermind', 'chimp-test', 'stroop-test', 'aim-trainer', 'typing-test']
const growthGuideSlugs = ['boggle', 'wordle', 'spelling-bee', 'sudoku', '2048', 'reaction-time', 'typing-test', 'checkers', 'chess', 'kakuro', 'killer-sudoku', 'slitherlink', 'heyawake']
const growthBlogSlugs = ['boggle-strategy-guide', 'what-are-ai-story-games', 'japanese-logic-puzzles-guide', 'best-brain-training-games-2026', 'wordle-vs-connections-vs-spelling-bee', '2048-strategy-guide', 'how-to-win-at-sudoku-every-time']
const growthHubSlugs = ['word-games', 'number-puzzles', 'japanese-logic', 'brain-training', 'ai-games']

type SitemapEntry = {
  loc: string
  lastmod: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
  image?: {
    loc: string
    title: string
  }
}

function renderUrl(entry: SitemapEntry) {
  return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${entry.image ? `
    <image:image>
      <image:loc>${entry.image.loc}</image:loc>
      <image:title>${entry.image.title}</image:title>
    </image:image>` : ''}
  </url>`
}

export const GET: APIRoute = async () => {
  // 获取所有游戏
  const games = await getCollection('games')
  const gameSlugs = games.map(entry => entry.data.slug)

  // 分类
  const categoryIds = categories
    .filter(c => c.id !== 'all' && c.id !== 'story')
    .map(c => c.id)

  // 攻略页面
  const guideSlugs = Object.keys(gameGuides)

  // Hub pages
  const hubSlugs = Object.keys(hubPages)

  // Blog posts
  const blogSlugs = Object.keys(blogPosts)
  const gameVariants = getAllVariants()
  const stories = await getCollection('stories')

  const baseUrl = 'https://ruleword.com'
  const lastmod = new Date().toISOString().split('T')[0]
  const entries: SitemapEntry[] = [
    {
      loc: `${baseUrl}/`,
      lastmod,
      changefreq: 'daily',
      priority: '1.0',
      image: {
        loc: `${baseUrl}/og/home.png`,
        title: 'Free Games Hub - Play 100+ Free Online Games',
      },
    },
    { loc: `${baseUrl}/games/`, lastmod, changefreq: 'daily', priority: '0.95' },
    { loc: `${baseUrl}/popular/`, lastmod, changefreq: 'daily', priority: '0.9' },
    { loc: `${baseUrl}/new/`, lastmod, changefreq: 'weekly', priority: '0.85' },
    { loc: `${baseUrl}/guides/`, lastmod, changefreq: 'weekly', priority: '0.9' },
    { loc: `${baseUrl}/hubs/`, lastmod, changefreq: 'weekly', priority: '0.9' },
    { loc: `${baseUrl}/blog/`, lastmod, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/stories/`, lastmod, changefreq: 'weekly', priority: '0.85' },
    { loc: `${baseUrl}/daily/`, lastmod, changefreq: 'daily', priority: '0.8' },
    { loc: `${baseUrl}/stats/`, lastmod, changefreq: 'weekly', priority: '0.5' },
    ...categoryIds.map(cat => ({
      loc: `${baseUrl}/category/${cat}/`,
      lastmod,
      changefreq: 'weekly' as const,
      priority: cat === 'story' ? '0.75' : '0.85',
    })),
    ...gameSlugs.map(slug => ({
      loc: `${baseUrl}/games/${slug}/`,
      lastmod,
      changefreq: featuredSlugs.includes(slug) ? 'weekly' as const : 'monthly' as const,
      priority: featuredSlugs.includes(slug) ? '0.9' : '0.7',
    })),
    ...gameVariants.map(variant => ({
      loc: `${baseUrl}/games/${variant.gameId}/${variant.variant}/`,
      lastmod,
      changefreq: featuredSlugs.includes(variant.gameId) ? 'weekly' as const : 'monthly' as const,
      priority: featuredSlugs.includes(variant.gameId) ? '0.78' : '0.68',
    })),
    ...guideSlugs.map(slug => ({
      loc: `${baseUrl}/guides/${slug}/`,
      lastmod,
      changefreq: growthGuideSlugs.includes(slug) ? 'weekly' as const : 'monthly' as const,
      priority: growthGuideSlugs.includes(slug) ? '0.85' : featuredSlugs.includes(slug) ? '0.8' : '0.65',
    })),
    ...hubSlugs.map(slug => ({
      loc: `${baseUrl}/hubs/${slug}/`,
      lastmod,
      changefreq: 'weekly' as const,
      priority: growthHubSlugs.includes(slug) ? '0.85' : '0.8',
    })),
    ...blogSlugs.map(slug => ({
      loc: `${baseUrl}/blog/${slug}/`,
      lastmod: blogPosts[slug].date,
      changefreq: growthBlogSlugs.includes(slug) ? 'weekly' as const : 'monthly' as const,
      priority: growthBlogSlugs.includes(slug) ? '0.75' : '0.65',
    })),
    ...storyGenres.map(genre => ({
      loc: `${baseUrl}/stories/genre/${genre.slug}/`,
      lastmod,
      changefreq: 'weekly' as const,
      priority: '0.75',
    })),
    ...stories.map(entry => ({
      loc: `${baseUrl}/stories/${entry.data.slug}/`,
      lastmod,
      changefreq: 'weekly' as const,
      priority: '0.8',
    })),
    ...storyVariants.map(variant => ({
      loc: `${baseUrl}/stories/${variant.storySlug}/${variant.variant}/`,
      lastmod,
      changefreq: variant.variantType === 'seasonal' ? 'weekly' as const : 'monthly' as const,
      priority: variant.variantType === 'seasonal' ? '0.72' : '0.7',
    })),
  ]

  const dedupedEntries = entries.filter((entry, index, list) => (
    list.findIndex(candidate => candidate.loc === entry.loc) === index
  ))

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${dedupedEntries.map(renderUrl).join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
