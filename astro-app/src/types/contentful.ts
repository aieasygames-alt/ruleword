/**
 * Contentful Game Content Model 字段定义
 */

export type GameCategory =
  | 'word'
  | 'logic'
  | 'strategy'
  | 'arcade'
  | 'memory'
  | 'skill'
  | 'puzzle'

export interface ContentfulAsset {
  sys: {
    id: string
    type: 'Asset'
  }
  fields: {
    title: string
    description?: string
    file: {
      url: string
      details: {
        size: number
        image?: {
          width: number
          height: number
        }
      }
      fileName: string
      contentType: string
    }
  }
}

export interface GameFields {
  /** 游戏唯一标识 (如 sudoku, wordle) */
  gameId: string
  /** URL 路径 (如 sudoku) */
  slug: string
  /** 游戏显示名称 */
  title: string
  /** Emoji 图标 */
  icon?: string
  /** 游戏分类 */
  category: GameCategory
  /** Tailwind 渐变类名 */
  colorGradient?: string
  /** 是否首页推荐 */
  isFeatured?: boolean
  /** 游戏介绍 */
  description?: string
  /** 游戏规则 */
  howToPlay?: string
  /** 游戏技巧 */
  tips?: string
  /** 游戏封面图 */
  coverImage?: ContentfulAsset
  /** 游戏截图 */
  screenshots?: ContentfulAsset[]
  /** 发布日期 */
  releaseDate?: string
}

export interface GameEntry {
  sys: {
    id: string
    type: 'Entry'
    createdAt: string
    updatedAt: string
    locale: string
    contentType: {
      sys: {
        id: 'game'
      }
    }
  }
  fields: GameFields
}

/**
 * 转换后的本地化游戏数据格式 (兼容现有组件)
 */
export interface LocalizedGame {
  id: string
  slug: string
  icon: string
  category: string
  featured: boolean
  color: string
  name: string
  desc: string
  howToPlay?: string
  tips?: string
  coverImage?: string
  releaseDate?: string
}

/**
 * 分类信息
 */
export interface CategoryInfo {
  id: GameCategory
  name: string
  nameZh: string
  icon: string
  color: string
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'word',
    name: 'Word',
    nameZh: '文字',
    icon: '📝',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'logic',
    name: 'Logic',
    nameZh: '逻辑',
    icon: '🧩',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'strategy',
    name: 'Strategy',
    nameZh: '策略',
    icon: '♟️',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'arcade',
    name: 'Arcade',
    nameZh: '街机',
    icon: '🎮',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'memory',
    name: 'Memory',
    nameZh: '记忆',
    icon: '🧠',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'skill',
    name: 'Skill',
    nameZh: '技巧',
    icon: '🎯',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'puzzle',
    name: 'Puzzle',
    nameZh: '益智',
    icon: '🔮',
    color: 'from-violet-500 to-purple-600',
  },
]
