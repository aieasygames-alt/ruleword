import { defineType, defineField } from 'sanity'
import { seoFields } from './shared/seo'
import { localizedStringField, localizedTextField, localizedFaqField } from './shared/localization'

export const hubPage = defineType({
  name: 'hubPage',
  title: 'Hub Page (主题页)',
  type: 'document',
  fields: [
    localizedStringField('title', 'Title', {
      description: '页面标题',
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
    localizedStringField('tagline', 'Tagline', { description: '标语' }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji 图标',
    }),
    defineField({
      name: 'colorGradient',
      title: 'Color Gradient',
      type: 'string',
      description: 'Tailwind 渐变类名',
    }),
    localizedTextField('whatIs', 'What Is', {
      rows: 5,
      description: '什么是... (介绍段落)',
    }),
    localizedTextField('benefits', 'Benefits', {
      rows: 5,
      description: '好处/优势',
    }),
    localizedTextField('gettingStarted', 'Getting Started', {
      rows: 5,
      description: '入门指南',
    }),
    defineField({
      name: 'featuredGames',
      title: 'Featured Games',
      type: 'array',
      description: '推荐游戏',
      of: [{ type: 'reference', to: [{ type: 'game' }, { type: 'externalGame' }] }],
    }),
    localizedFaqField('faq', 'FAQ', { description: '常见问题' }),
    seoFields(),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug',
    },
    prepare(selection: any) {
      const { title, subtitle } = selection
      return {
        title: title?.en || title,
        subtitle: subtitle?.current || subtitle,
      }
    },
  },
})
