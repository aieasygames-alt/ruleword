import { defineField } from 'sanity'

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'fr', title: 'Français' },
  { id: 'de', title: 'Deutsch' },
  { id: 'es', title: 'Español' },
  { id: 'ru', title: 'Русский' },
  { id: 'ja', title: '日本語' },
  { id: 'zh_CN', title: '简体中文' },
  { id: 'zh_TW', title: '繁體中文' },
] as const

export type LocaleId = typeof SUPPORTED_LOCALES[number]['id']

/**
 * 创建多语言字符串字段
 * @param name 字段名
 * @param title 显示标题
 * @param options 配置选项 (rows, description, validation 等)
 */
export function localizedStringField(
  name: string,
  title: string,
  options?: {
    rows?: number
    description?: string
    required?: boolean
  }
) {
  return defineField({
    name,
    title,
    type: 'object',
    description: options?.description,
    fields: SUPPORTED_LOCALES.map((locale) =>
      defineField({
        name: locale.id,
        title: locale.title,
        type: 'string',
        validation: locale.isDefault && options?.required
          ? (Rule: any) => Rule.required()
          : undefined,
      })
    ),
  })
}

/**
 * 创建多语言文本字段
 */
export function localizedTextField(
  name: string,
  title: string,
  options?: {
    rows?: number
    description?: string
    required?: boolean
  }
) {
  return defineField({
    name,
    title,
    type: 'object',
    description: options?.description,
    fields: SUPPORTED_LOCALES.map((locale) =>
      defineField({
        name: locale.id,
        title: locale.title,
        type: 'text',
        rows: options?.rows || 3,
        validation: locale.isDefault && options?.required
          ? (Rule: any) => Rule.required()
          : undefined,
      })
    ),
  })
}

/**
 * 创建多语言字符串数组字段
 */
export function localizedStringArrayField(
  name: string,
  title: string,
  options?: {
    description?: string
  }
) {
  return defineField({
    name,
    title,
    type: 'object',
    description: options?.description,
    fields: SUPPORTED_LOCALES.map((locale) =>
      defineField({
        name: locale.id,
        title: locale.title,
        type: 'array',
        of: [{ type: 'string' }],
      })
    ),
  })
}

/**
 * 创建多语言 FAQ 数组字段
 */
export function localizedFaqField(
  name: string,
  title: string,
  options?: {
    description?: string
  }
) {
  return defineField({
    name,
    title,
    type: 'object',
    description: options?.description,
    fields: SUPPORTED_LOCALES.map((locale) =>
      defineField({
        name: locale.id,
        title: locale.title,
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              defineField({
                name: 'question',
                title: 'Question',
                type: 'string',
              }),
              defineField({
                name: 'answer',
                title: 'Answer',
                type: 'text',
                rows: 2,
              }),
            ],
            preview: {
              select: {
                title: 'question',
                subtitle: 'answer',
              },
            },
          },
        ],
      })
    ),
  })
}
