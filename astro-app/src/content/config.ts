import { defineCollection, z } from 'astro:content'

// 游戏内容集合
const gamesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    icon: z.string(),
    category: z.enum(['word', 'logic', 'strategy', 'arcade', 'memory', 'skill', 'puzzle']),
    featured: z.boolean().default(false).optional(),
    color: z.string(),

    // 英文内容
    en: z.object({
      name: z.string(),
      desc: z.string(),
      howToPlay: z.string().optional(),
      tips: z.array(z.string()).optional(),
    }),

    // 中文内容
    zh: z.object({
      name: z.string(),
      desc: z.string(),
      howToPlay: z.string().optional(),
      tips: z.array(z.string()).optional(),
    }).optional(),
  }),
})

export const collections = {
  games: gamesCollection,
}
