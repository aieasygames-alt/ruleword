import { game } from './game'
import { externalGame } from './externalGame'
import { blogPost } from './blogPost'
import { gameGuide } from './gameGuide'
import { hubPage } from './hubPage'
import { gameVariant } from './gameVariant'
import { category } from './category'
import { author } from './author'

export const schemaTypes = [
  // 游戏类型
  game,
  externalGame,
  // 内容类型
  blogPost,
  gameGuide,
  // 页面类型
  hubPage,
  gameVariant,
  // 分类和管理
  category,
  author,
]
