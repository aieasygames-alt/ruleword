import { defineType, defineField } from 'sanity'
import { seoFields } from './shared/seo'
import {
  SUPPORTED_LOCALES,
  localizedTextField,
  localizedStringField,
  localizedStringArrayField,
  localizedFaqField,
} from './shared/localization'

export const game = defineType({
  name: 'game',
  title: 'Game',
  type: 'document',
  fields: [
    // === 基础标识 ===
    defineField({
      name: 'gameId',
      title: 'Game ID',
      type: 'string',
      description: '游戏唯一标识 (如 sudoku, wordle)',
      validation: (Rule) => Rule.required().regex(/^[a-z0-9-]+$/, {
        name: '小写字母、数字和连字符',
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

    // === 多语言名称 ===
    localizedStringField('title', 'Title', {
      description: '游戏名称 (所有语言)',
      required: true,
    }),

    // === 视觉属性 ===
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
          { title: 'Word 文字', value: 'word' },
          { title: 'Logic 逻辑', value: 'logic' },
          { title: 'Strategy 策略', value: 'strategy' },
          { title: 'Arcade 街机', value: 'arcade' },
          { title: 'Memory 记忆', value: 'memory' },
          { title: 'Skill 技巧', value: 'skill' },
          { title: 'Puzzle 益智', value: 'puzzle' },
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

    // === 多语言内容 ===
    localizedTextField('description', 'Description', {
      rows: 5,
      description: '游戏介绍',
    }),
    localizedTextField('objectives', 'Objectives', {
      rows: 3,
      description: '游戏目标',
    }),
    localizedTextField('howToPlay', 'How to Play', {
      rows: 5,
      description: '游戏规则说明',
    }),

    // === 结构化规则 ===
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
        localizedTextField('controls', 'Controls', {
          rows: 3,
          description: '控制说明',
        }),
        localizedStringArrayField('mechanics', 'Game Mechanics', {
          description: '游戏机制列表',
        }),
        localizedStringArrayField('features', 'Features', {
          description: '游戏特性列表',
        }),
      ],
    }),

    // === 技巧 ===
    localizedStringArrayField('tips', 'Tips', {
      description: '游戏技巧列表',
    }),

    // === FAQ ===
    localizedFaqField('faq', 'FAQ', {
      description: '常见问题',
    }),

    // === 媒体 ===
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: '游戏封面图',
      options: { hotspot: true },
    }),
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      type: 'array',
      description: '游戏截图 (最多 5 张)',
      of: [{ type: 'image' }],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      description: '社交分享图 (留空则使用封面图)',
      options: { hotspot: true },
    }),

    // === SEO ===
    seoFields(),

    // === 元数据 ===
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
    prepare(selection: any) {
      const { title, subtitle, media } = selection
      return {
        title: title?.en || title,
        subtitle: subtitle?.toUpperCase(),
        media,
      }
    },
  },
})
