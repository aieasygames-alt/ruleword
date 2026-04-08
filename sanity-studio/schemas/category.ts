import { defineType, defineField } from 'sanity'
import { localizedStringField, localizedTextField } from './shared/localization'

export const category = defineType({
  name: 'category',
  title: 'Category (分类)',
  type: 'document',
  fields: [
    defineField({
      name: 'categoryId',
      title: 'Category ID',
      type: 'string',
      description: '分类唯一标识 (如 word, logic)',
      validation: (Rule) => Rule.required().regex(/^[a-z0-9-]+$/, {
        name: '小写字母、数字和连字符',
      }),
    }),
    localizedStringField('name', 'Name', {
      description: '分类名称',
      required: true,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'categoryId', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji 图标',
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: '主题色 (如 #FF5722)',
    }),
    localizedTextField('description', 'Description', {
      rows: 3,
      description: '分类描述',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: '排序权重 (越小越靠前)',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: '是否启用',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'categoryId',
      media: 'icon',
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
