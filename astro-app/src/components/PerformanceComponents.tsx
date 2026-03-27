/**
 * 性能优化组件 - 使用 React.memo 和其他优化技术
 */

import { memo, useCallback, useMemo, useEffect } from 'react'

/**
 * 记忆化的 FavoriteButton 组件
 * 避免不必要重渲染
 */
interface FavoriteButtonProps {
  gameSlug: string
  isFavorite: boolean
  onToggle: (slug: string) => void
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  darkMode?: boolean
}

export const FavoriteButton = memo<FavoriteButtonProps>(({
  gameSlug,
  isFavorite,
  onToggle,
  size = 'md',
  showLabel = false,
  darkMode = true
}) => {
  const handleClick = useCallback(() => {
    onToggle(gameSlug)
  }, [gameSlug, onToggle])

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isFavorite
          ? 'bg-red-100 hover:bg-red-200 text-red-600'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
      }`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
    >
      <span className="text-lg">
        {isFavorite ? '❤️' : '🤍'}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  )
})

FavoriteButton.displayName = 'FavoriteButton'

/**
 * 记忆化的游戏卡片组件
 */
interface GameCardProps {
  game: {
    slug: string
    icon: string
    name: string
    nameZh?: string
    desc: string
    descZh?: string
    color: string
    category: string
  }
  language: 'en' | 'zh'
  onClick: (slug: string) => void
  darkMode?: boolean
}

export const GameCard = memo<GameCardProps>(({ game, language, onClick, darkMode = true }) => {
  const handleClick = useCallback(() => {
    onClick(game.slug)
  }, [game.slug, onClick])

  const name = language === 'zh' && game.nameZh ? game.nameZh : game.name
  const desc = language === 'zh' && game.descZh ? game.descZh : game.desc

  const cardClasses = useMemo(() => ({
    container: `group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
      darkMode ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-gray-200'
    }`,
    title: `font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`,
    desc: `text-sm line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`,
    category: `text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`
  }), [darkMode])

  return (
    <div onClick={handleClick} className={cardClasses.container}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
          <span>{game.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cardClasses.title}>{name}</h3>
          <p className={cardClasses.desc}>{desc}</p>
          <p className={cardClasses.category}>{game.category}</p>
        </div>
      </div>
    </div>
  )
})

GameCard.displayName = 'GameCard'

/**
 * 记忆化的分类卡片组件
 */
interface CategoryCardProps {
  category: {
    id: string
    icon: string
    name: string
    nameZh?: string
  }
  gameCount: number
  language: 'en' | 'zh'
  onClick: (id: string) => void
  darkMode?: boolean
}

export const CategoryCard = memo<CategoryCardProps>(({ category, gameCount, language, onClick, darkMode = true }) => {
  const handleClick = useCallback(() => {
    onClick(category.id)
  }, [category.id, onClick])

  const name = language === 'zh' && category.nameZh ? category.nameZh : category.name

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
        darkMode ? 'bg-slate-900/80 border border-slate-800 hover:border-slate-600' : 'bg-white border border-gray-200 hover:border-gray-300'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${name} category with ${gameCount} games`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="text-3xl mb-2">{category.icon}</div>
      <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</h4>
      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} mt-1`}>
        {gameCount} games
      </p>
    </div>
  )
})

CategoryCard.displayName = 'CategoryCard'

/**
 * 记忆化的搜索结果项组件
 */
interface SearchResultProps {
  game: {
    slug: string
    icon: string
    name: string
    nameZh?: string
    desc: string
    descZh?: string
    color: string
  }
  language: 'en' | 'zh'
  onClick: (slug: string) => void
  darkMode?: boolean
}

export const SearchResult = memo<SearchResultProps>(({ game, language, onClick, darkMode = true }) => {
  const handleClick = useCallback(() => {
    onClick(game.slug)
  }, [game.slug, onClick])

  const name = language === 'zh' && game.nameZh ? game.nameZh : game.name
  const desc = language === 'zh' && game.descZh ? game.descZh : game.desc

  return (
    <div
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors border-b last:border-0 ${
        darkMode
          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700/50'
          : 'bg-white hover:bg-gray-100 border-gray-200'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Play ${name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0`}>
        {game.icon}
      </div>
      <div className="flex-1 text-left">
        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{name}</div>
        <div className={`text-sm line-clamp-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{desc}</div>
      </div>
    </div>
  )
})

SearchResult.displayName = 'SearchResult'

/**
 * 自定义 Hook 用于组件性能监控
 */
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      if (import.meta.env.DEV && renderTime > 16) {
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render (target: 16ms)`)
      }
    }
  }, [componentName])
}

/**
 * 防抖函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  const timeout = useRef<NodeJS.Timeout>()

  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => func(...args), wait)
  }, [func, wait])
}

/**
 * 节流函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false)
  const lastArgs = useRef<Parameters<T>>()

  return useCallback((...args: Parameters<T>) => {
    if (!inThrottle.current) {
      func(...args)
      inThrottle.current = true

      setTimeout(() => {
        inThrottle.current = false
        if (lastArgs.current) {
          func(...lastArgs.current)
          lastArgs.current = undefined
        }
      }, limit)
    } else {
      lastArgs.current = args
    }
  }, [func, limit])
}
