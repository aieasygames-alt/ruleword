/**
 * 安全的游戏加载器包装器
 * 包含错误边界和安全检查
 */

import { Component, ComponentType, ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { secureStorage } from '../utils/security'

type SafeGameLoaderProps = {
  gameId: string
  gameName: string
  gameSlug: string
  children: ReactNode
}

/**
 * 安全的游戏组件加载器
 * 验证输入并包裹错误边界
 */
export function withSafeGameLoader<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & { gameId: string; gameName: string; gameSlug: string }> {
  return function SafeGameLoader(props: P & { gameId: string; gameName: string; gameSlug: string }) {
    const { gameId, gameName, gameSlug } = props

    // 验证输入
    const validateProps = () => {
      // 验证 gameId（只允许字母、数字、连字符）
      if (!/^[a-z0-9-]+$/.test(gameId)) {
        console.error('Invalid gameId:', gameId)
        return false
      }

      // 验证 gameName（防止XSS）
      if (typeof gameName !== 'string' || gameName.length > 100) {
        console.error('Invalid gameName:', gameName)
        return false
      }

      // 验证 gameSlug
      if (!/^[a-z0-9-]+$/.test(gameSlug)) {
        console.error('Invalid gameSlug:', gameSlug)
        return false
      }

      return true
    }

    if (!validateProps()) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Game</h1>
            <p className="text-gray-600 dark:text-slate-400">
              Unable to load game. Please return to the homepage.
            </p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
            >
              Back to Home
            </a>
          </div>
        </div>
      )
    }

    return (
      <ErrorBoundary
        fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Game Error
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Something went wrong while loading {gameName}. Please try refreshing the page.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                >
                  Refresh
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="px-6 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg font-medium text-gray-900 dark:text-white"
                >
                  Home
                </button>
              </div>
            </div>
          </div>
        }
        onError={(error, errorInfo) => {
          // 记录错误到安全存储
          try {
            const errors = secureStorage.getItem<{ timestamp: number; game: string; error: string }[]>('game_errors') || []
            errors.push({
              timestamp: Date.now(),
              game: gameName,
              error: error.message
            })
            // 只保留最近50个错误
            if (errors.length > 50) {
              errors.splice(0, errors.length - 50)
            }
            secureStorage.setItem('game_errors', errors)
          } catch (e) {
            console.error('Failed to save error log:', e)
          }
        }}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

/**
 * 性能监控装饰器
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName?: string
): ComponentType<P> {
  return function PerformanceMonitoredComponent(props: P) {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component'

    if (import.meta.env.DEV) {
      const startTime = performance.now()

      useEffect(() => {
        const endTime = performance.now()
        const renderTime = endTime - startTime

        if (renderTime > 16) {
          console.warn(`[Performance] ${name} rendered in ${renderTime.toFixed(2)}ms (target: 16ms)`)
        }
      })
    }

    return <WrappedComponent {...props} />
  }
}

/**
 * 组合多个 HOC
 */
export function withOptimizations<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    name?: string
    safe?: boolean
    monitorPerformance?: boolean
  } = {}
): ComponentType<P & { gameId: string; gameName: string; gameSlug: string }> {
  let Component = WrappedComponent

  if (options.safe !== false) {
    Component = withSafeGameLoader(Component)
  }

  if (options.monitorPerformance && import.meta.env.DEV) {
    Component = withPerformanceMonitoring(Component, options.name)
  }

  return Component as any
}
