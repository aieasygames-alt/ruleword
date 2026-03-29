import { defineType, defineField } from 'sanity'

// FAQ 子文档
const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description: '问题',
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      description: '回答',
      rows: 3,
    }),
  ],
})

// Game Rules 子文档
const gameRules = defineType({
  name: 'gameRules',
  title: 'Game Rules',
  type: 'object',
  fields: [
    defineField({
      name: 'controls',
      title: 'Controls (English)',
      type: 'text',
      description: '控制说明 (英文)',
      rows: 3,
    }),
    defineField({
      name: 'controlsZh',
      title: 'Controls (Chinese)',
      type: 'text',
      description: '控制说明 (中文)',
      rows: 3,
    }),
    defineField({
      name: 'mechanics',
      title: 'Game Mechanics (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: '游戏机制列表 (英文)',
    }),
    defineField({
      name: 'mechanicsZh',
      title: 'Game Mechanics (Chinese)',
      type: 'array',
      of: [{ type: 'string' }],
      description: '游戏机制列表 (中文)',
    }),
    defineField({
      name: 'features',
      title: 'Features (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: '游戏特性列表 (英文)',
    }),
    defineField({
      name: 'featuresZh',
      title: 'Features (Chinese)',
      type: 'array',
      of: [{ type: 'string' }],
      description: '游戏特性列表 (中文)',
    }),
  ],
})

export const game = defineType({
  name: 'game',
  title: 'Game',
  type: 'document',
  fields: [
    defineField({
      name: 'gameId',
      title: 'Game ID',
      type: 'string',
      description: '游戏唯一标识 (如 sudoku, wordle)',
      validation: (Rule) => Rule.required().regex(/^[a-z0-9-]+$/, {
        name: '小写字母、数字和连字符'
      }),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL 路径',
      options: {
        source: 'gameId',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title (English)',
      type: 'string',
      description: '游戏英文名称',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleZh',
      title: 'Title (Chinese)',
      type: 'string',
      description: '游戏中文名称',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji 图标',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: '游戏分类',
      options: {
        list: [
          { title: 'Word', value: 'word' },
          { title: 'Logic', value: 'logic' },
          { title: 'Strategy', value: 'strategy' },
          { title: 'Arcade', value: 'arcade' },
          { title: 'Memory', value: 'memory' },
          { title: 'Skill', value: 'skill' },
          { title: 'Puzzle', value: 'puzzle' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'colorGradient',
      title: 'Color Gradient',
      type: 'string',
      description: 'Tailwind 渐变类名 (如 from-orange-500 to-red-600)',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Is Featured',
      type: 'boolean',
      description: '是否在首页推荐',
      initialValue: false,
    }),
    // 基本描述
    defineField({
      name: 'description',
      title: 'Description (English)',
      type: 'text',
      description: '游戏英文介绍',
      rows: 5,
    }),
    defineField({
      name: 'descriptionZh',
      title: 'Description (Chinese)',
      type: 'text',
      description: '游戏中文介绍',
      rows: 5,
    }),
    // 游戏目标
    defineField({
      name: 'objectives',
      title: 'Objectives (English)',
      type: 'text',
      description: '游戏目标 (英文)',
      rows: 3,
    }),
    defineField({
      name: 'objectivesZh',
      title: 'Objectives (Chinese)',
      type: 'text',
      description: '游戏目标 (中文)',
      rows: 3,
    }),
    // 如何玩
    defineField({
      name: 'howToPlay',
      title: 'How to Play (English)',
      type: 'text',
      description: '英文游戏规则说明',
      rows: 5,
    }),
    defineField({
      name: 'howToPlayZh',
      title: 'How to Play (Chinese)',
      type: 'text',
      description: '中文游戏规则说明',
      rows: 5,
    }),
    // 游戏规则（结构化）
    defineField({
      name: 'rules',
      title: 'Game Rules',
      type: 'object',
      description: '游戏规则详情',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'controls',
          title: 'Controls (English)',
          type: 'text',
          description: '控制说明 (英文)',
          rows: 3,
        }),
        defineField({
          name: 'controlsZh',
          title: 'Controls (Chinese)',
          type: 'text',
          description: '控制说明 (中文)',
          rows: 3,
        }),
        defineField({
          name: 'mechanics',
          title: 'Game Mechanics (English)',
          type: 'array',
          of: [{ type: 'string' }],
          description: '游戏机制列表 (英文)',
        }),
        defineField({
          name: 'mechanicsZh',
          title: 'Game Mechanics (Chinese)',
          type: 'array',
          of: [{ type: 'string' }],
          description: '游戏机制列表 (中文)',
        }),
        defineField({
          name: 'features',
          title: 'Features (English)',
          type: 'array',
          of: [{ type: 'string' }],
          description: '游戏特性列表 (英文)',
        }),
        defineField({
          name: 'featuresZh',
          title: 'Features (Chinese)',
          type: 'array',
          of: [{ type: 'string' }],
          description: '游戏特性列表 (中文)',
        }),
      ],
    }),
    // 游戏技巧
    defineField({
      name: 'tips',
      title: 'Tips (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: '英文游戏技巧列表',
    }),
    defineField({
      name: 'tipsZh',
      title: 'Tips (Chinese)',
      type: 'array',
      of: [{ type: 'string' }],
      description: '中文游戏技巧列表',
    }),
    // FAQ
    defineField({
      name: 'faq',
      title: 'FAQ (English)',
      type: 'array',
      of: [{ type: 'faqItem' }],
      description: '英文常见问题',
    }),
    defineField({
      name: 'faqZh',
      title: 'FAQ (Chinese)',
      type: 'array',
      of: [{ type: 'faqItem' }],
      description: '中文常见问题',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: '游戏封面图',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
      description: '发布日期',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'coverImage',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection
      return {
        title: title,
        subtitle: subtitle?.toUpperCase(),
        media: media,
      }
    },
  },
})

// 导出子类型供 externalGame 使用
export { faqItem, gameRules }
