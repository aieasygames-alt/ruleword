import { defineType, defineField } from 'sanity'
import { seoFields } from './shared/seo'
import { localizedStringField, localizedTextField } from './shared/localization'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post (博客文章)',
  type: 'document',
  fields: [
    localizedStringField('title', 'Title', {
      description: '文章标题',
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
      name: 'category',
      title: 'Category',
      type: 'string',
      description: '文章分类',
      options: {
        list: [
          { title: 'Guides 攻略', value: 'guides' },
          { title: 'Comparisons 对比', value: 'comparisons' },
          { title: 'Best Of 最佳', value: 'best-of' },
          { title: 'Educational 教育', value: 'educational' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    localizedTextField('excerpt', 'Excerpt', {
      rows: 3,
      description: '文章摘要',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: '文章正文',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
          },
        },
        { type: 'image' },
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Code Block',
          fields: [
            { name: 'language', type: 'string', title: 'Language' },
            { name: 'code', type: 'text', title: 'Code' },
          ],
        },
      ],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: '封面图',
      options: { hotspot: true },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      description: '作者',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: '发布时间',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedGames',
      title: 'Related Games',
      type: 'array',
      description: '关联游戏',
      of: [{ type: 'reference', to: [{ type: 'game' }, { type: 'externalGame' }] }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: '标签',
      of: [{ type: 'string' }],
    }),
    seoFields(),
  ],
  orderings: [
    {
      title: 'Published Date, Newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
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
        title: title?.en || title,
        subtitle,
        media,
      }
    },
  },
})
