import { defineType, defineField } from 'sanity'
import { seoFields } from './shared/seo'
import { localizedStringField, localizedTextField, localizedStringArrayField } from './shared/localization'

export const gameGuide = defineType({
  name: 'gameGuide',
  title: 'Game Guide (游戏攻略)',
  type: 'document',
  fields: [
    localizedStringField('title', 'Title', {
      description: '攻略标题',
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
      title: 'Related Game',
      type: 'reference',
      description: '关联游戏',
      to: [{ type: 'game' }, { type: 'externalGame' }],
    }),
    localizedTextField('intro', 'Introduction', {
      rows: 5,
      description: '攻略简介',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      description: '攻略章节',
      of: [
        {
          type: 'object',
          fields: [
            localizedStringField('heading', 'Heading', { description: '章节标题' }),
            localizedTextField('content', 'Content', { rows: 5, description: '章节内容' }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'content' },
          },
        },
      ],
    }),
    localizedStringArrayField('tips', 'Tips', { description: '技巧列表' }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      description: '难度级别',
      options: {
        list: [
          { title: 'Beginner 初级', value: 'beginner' },
          { title: 'Intermediate 中级', value: 'intermediate' },
          { title: 'Advanced 高级', value: 'advanced' },
        ],
        layout: 'radio',
      },
    }),
    seoFields(),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'difficulty',
    },
    prepare(selection: any) {
      const { title, subtitle } = selection
      return {
        title: title?.en || title,
        subtitle: subtitle || '',
      }
    },
  },
})
