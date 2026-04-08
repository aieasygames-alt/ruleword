import { defineField } from 'sanity'
import { localizedStringField } from './localization'

/**
 * SEO 字段组 — 可复用到任何 Content Type
 */
export function seoFields() {
  return defineField({
    name: 'seo',
    title: 'SEO',
    type: 'object',
    description: 'SEO 元数据配置',
    options: {
      collapsible: true,
      collapsed: true,
    },
    fields: [
      defineField({
        name: 'title',
        title: 'SEO Title',
        type: 'string',
        description: '搜索引擎标题 (留空则使用默认标题)',
      }),
      defineField({
        name: 'description',
        title: 'SEO Description',
        type: 'text',
        rows: 2,
        description: '搜索引擎描述 (留空则使用默认描述)',
      }),
      defineField({
        name: 'keywords',
        title: 'Primary Keywords',
        type: 'array',
        of: [{ type: 'string' }],
        description: '主要关键词',
      }),
      defineField({
        name: 'secondaryKeywords',
        title: 'Secondary Keywords',
        type: 'array',
        of: [{ type: 'string' }],
        description: '次要关键词',
      }),
      defineField({
        name: 'longTailKeywords',
        title: 'Long-tail Keywords',
        type: 'array',
        of: [{ type: 'string' }],
        description: '长尾关键词',
      }),
      defineField({
        name: 'noIndex',
        title: 'No Index',
        type: 'boolean',
        description: '禁止搜索引擎索引此页面',
        initialValue: false,
      }),
      defineField({
        name: 'canonical',
        title: 'Canonical URL',
        type: 'url',
        description: '自定义 canonical URL (留空则自动生成)',
      }),
    ],
  })
}
