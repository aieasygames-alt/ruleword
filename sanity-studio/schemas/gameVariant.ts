import { defineType, defineField } from 'sanity'
import { seoFields } from './shared/seo'
import { localizedStringField, localizedTextField } from './shared/localization'

export const gameVariant = defineType({
  name: 'gameVariant',
  title: 'Game Variant (游戏变体)',
  type: 'document',
  fields: [
    localizedStringField('title', 'Title', {
      description: '变体标题',
      required: true,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL 路径',
      options: { maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'game',
      title: 'Parent Game',
      type: 'reference',
      description: '所属游戏',
      to: [{ type: 'game' }, { type: 'externalGame' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variantId',
      title: 'Variant ID',
      type: 'string',
      description: '变体标识 (如 "4x4", "6x6", "daily")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      description: '难度',
      options: {
        list: [
          { title: 'Easy 简单', value: 'easy' },
          { title: 'Medium 中等', value: 'medium' },
          { title: 'Hard 困难', value: 'hard' },
          { title: 'Expert 专家', value: 'expert' },
        ],
        layout: 'radio',
      },
    }),
    localizedTextField('description', 'Description', {
      rows: 3,
      description: '变体描述',
    }),
    localizedTextField('tips', 'Tips', {
      rows: 3,
      description: '变体专属技巧',
    }),
    seoFields(),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'variantId',
    },
    prepare(selection: any) {
      const { title, subtitle } = selection
      return {
        title: title?.en || title,
        subtitle,
      }
    },
  },
})
