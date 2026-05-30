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

// AI 故事模板内容集合
const storiesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    icon: z.string(),
    templateType: z.enum([
      'dating-sim', 'startup-sim', 'detective',
      'horror', 'personality-quiz', 'survival',
      'negotiation', 'open-adventure', 'escape-room',
      'persuasion', 'fantasy-rpg', 'business-sim',
    ]),
    color: z.string(),
    aiModel: z.string().default('@cf/meta/llama-3.1-8b-instruct'),

    systemPrompt: z.object({
      en: z.string(),
      zh: z.string().optional(),
    }),

    storySkeleton: z.object({
      setting: z.string(),
      characters: z.array(z.object({
        id: z.string(),
        name: z.string(),
        personality: z.string(),
        relationship: z.string().optional(),
      })),
      opening: z.string(),
      chapters: z.array(z.object({
        id: z.string(),
        title: z.string().optional(),
        goal: z.string(),
        minTurns: z.number().default(3),
        maxTurns: z.number().default(10),
        fallbackTexts: z.array(z.string()).default([]),
        fallbackChoices: z.array(z.array(z.object({
          id: z.string(),
          text: z.string(),
        }))).default([]),
      })),
      endings: z.array(z.object({
        id: z.string(),
        condition: z.string(),
        title: z.string(),
        description: z.string(),
      })),
      maxTotalTurns: z.number().default(30),
    }),

    uiConfig: z.object({
      showStats: z.boolean().default(true),
      stats: z.array(z.object({
        id: z.string(),
        label: z.string(),
        icon: z.string(),
        initialValue: z.number(),
        min: z.number().optional(),
        max: z.number().optional(),
      })).default([]),
      theme: z.enum(['dark', 'light', 'romantic', 'horror', 'business', 'mystery', 'fantasy']).default('dark'),
    }),

    en: z.object({
      name: z.string(),
      desc: z.string(),
      description: z.string(),
      howToPlay: z.string(),
      tips: z.array(z.string()).optional(),
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })).optional(),
    }),
    zh: z.object({
      name: z.string(),
      desc: z.string(),
      description: z.string().optional(),
      howToPlay: z.string().optional(),
      tips: z.array(z.string()).optional(),
      faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })).optional(),
    }).optional(),
  }),
})

export const collections = {
  games: gamesCollection,
  stories: storiesCollection,
}
