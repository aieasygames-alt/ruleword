import { defineField } from 'sanity'
import { localizedTextField, localizedStringField } from './localization'

/**
 * 通用内容字段组 — 描述、目标、玩法、技巧
 */
export function contentFields() {
  return [
    localizedTextField('title', 'Title', { description: '游戏名称', required: true }),
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
    localizedTextField('tips', 'Tips', {
      rows: 3,
      description: '游戏技巧',
    }),
  ]
}
