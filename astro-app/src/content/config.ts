import { defineCollection, z } from 'astro:content'

// 游戏规则结构
const GameRulesSchema = z.object({
  controls: z.string().optional(),
  mechanics: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
}).optional()

// 游戏FAQ结构
const GameFAQSchema = z.array(z.object({
  question: z.string(),
  answer: z.string(),
})).optional()

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
      description: z.string().optional(),
      objectives: z.string().optional(),
      howToPlay: z.string().optional(),
      rules: GameRulesSchema,
      tips: z.array(z.string()).optional(),
      faq: GameFAQSchema,
    }),

    // 中文内容
    zh: z.object({
      name: z.string(),
      desc: z.string(),
      description: z.string().optional(),
      objectives: z.string().optional(),
      howToPlay: z.string().optional(),
      rules: GameRulesSchema,
      tips: z.array(z.string()).optional(),
      faq: GameFAQSchema,
    }).optional(),
  }),
})

export const collections = {
  games: gamesCollection,
}
