import { defineType, defineField } from 'sanity'

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
    defineField({
      name: 'description',
      title: 'Description (English)',
      type: 'text',
      description: '游戏英文介绍',
      rows: 3,
    }),
    defineField({
      name: 'descriptionZh',
      title: 'Description (Chinese)',
      type: 'text',
      description: '游戏中文介绍',
      rows: 3,
    }),
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
    defineField({
      name: 'tips',
      title: 'Tips (English)',
      type: 'text',
      description: '英文游戏技巧 (每行一条)',
      rows: 5,
    }),
    defineField({
      name: 'tipsZh',
      title: 'Tips (Chinese)',
      type: 'text',
      description: '中文游戏技巧 (每行一条)',
      rows: 5,
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
