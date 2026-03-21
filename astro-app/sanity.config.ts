/**
 * Sanity Schema 定义
 *
 * 这些 schema 定义了 Game 内容类型的结构
 * 可以在 Sanity Studio 中使用，或在初始化 Sanity 项目时使用
 */

// Game Schema
export const gameSchema = {
  name: 'game',
  title: 'Game',
  type: 'document',
  fields: [
    {
      name: 'gameId',
      title: 'Game ID',
      type: 'string',
      description: '游戏唯一标识 (如 sudoku, wordle)',
      validation: (Rule: any) => Rule.required().regex(/^[a-z0-9-]+$/, {
        name: '小写字母、数字和连字符'
      }),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL 路径',
      options: {
        source: 'gameId',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: '游戏显示名称',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji 图标',
    },
    {
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'colorGradient',
      title: 'Color Gradient',
      type: 'string',
      description: 'Tailwind 渐变类名 (如 from-orange-500 to-red-600)',
    },
    {
      name: 'isFeatured',
      title: 'Is Featured',
      type: 'boolean',
      description: '是否在首页推荐',
      initialValue: false,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: '游戏介绍',
      rows: 3,
    },
    {
      name: 'howToPlay',
      title: 'How to Play',
      type: 'text',
      description: '游戏规则说明',
      rows: 5,
    },
    {
      name: 'tips',
      title: 'Tips',
      type: 'text',
      description: '游戏技巧 (每行一条)',
      rows: 5,
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: '游戏封面图',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
      description: '发布日期',
    },
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
        title: title,
        subtitle: subtitle?.toUpperCase(),
        media: media,
      }
    },
  },
}

// 多语言支持 - 使用 Sanity 的国际化插件
// 需要安装: sanity-plugin-internationalized-array
export const localizedGameSchema = {
  name: 'game',
  title: 'Game (Localized)',
  type: 'document',
  fields: [
    // ... 同上字段 ...
    // 但将 title, description, howToPlay, tips 改为国际化数组
    {
      name: 'title',
      type: 'internationalizedArrayString',
      title: 'Title',
    },
    {
      name: 'description',
      type: 'internationalizedArrayText',
      title: 'Description',
    },
    // ...
  ],
}

// 导出所有 schema
export const schemaTypes = [gameSchema]
