/**
 * 性能监控工具
 * 用于跟踪和优化应用性能
 */

type PerformanceMetric = {
  name: string
  value: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private marks: Map<string, number> = new Map()

  /**
   * 开始计时
   */
  startMark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 结束计时并记录指标
   */
  endMark(name: string): number {
    const startTime = this.marks.get(name)
    if (!startTime) {
      console.warn(`Mark "${name}" not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.recordMetric(name, duration)
    this.marks.delete(name)

    return duration
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now()
    }
    this.metrics.push(metric)

    // 在开发环境中输出到控制台
    if (import.meta.env.DEV) {
      console.log(`⚡ Performance: ${name} = ${value.toFixed(2)}ms`)
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * 获取特定指标
   */
  getMetric(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = []
    this.marks.clear()
  }

  /**
   * 测量异步操作性能
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMark(name)
    try {
      const result = await fn()
      this.endMark(name)
      return result
    } catch (error) {
      this.endMark(name)
      throw error
    }
  }

  /**
   * 测量同步操作性能
   */
  measure<T>(name: string, fn: () => T): T {
    this.startMark(name)
    try {
      const result = fn()
      this.endMark(name)
      return result
    } catch (error) {
      this.endMark(name)
      throw error
    }
  }

  /**
   * 获取 Web Vitals
   */
  getWebVitals(): Promise<{
    FCP?: number
    LCP?: number
    FID?: number
    CLS?: number
  }> {
    return new Promise((resolve) => {
      if (!('PerformanceObserver' in window)) {
        resolve({})
        return
      }

      const vitals: Record<string, number> = {}

      // FCP (First Contentful Paint)
      try {
        const fcpEntries = performance.getEntriesByName('first-contentful-paint')
        if (fcpEntries.length > 0) {
          vitals.FCP = fcpEntries[0].startTime
        }
      } catch (e) {}

      // LCP (Largest Contentful Paint)
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          vitals.LCP = lastEntry.startTime
          resolve(vitals)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {}

      // FID (First Input Delay)
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fid = entries[0] as any
          vitals.FID = fid.processingStart - fid.startTime
          resolve(vitals)
        }).observe({ entryTypes: ['first-input'] })
      } catch (e) {}

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          vitals.CLS = clsValue
          resolve(vitals)
        }).observe({ entryTypes: ['layout-shift'] })
      } catch (e) {}

      // 如果没有观察到任何指标，5秒后返回
      setTimeout(() => resolve(vitals), 5000)
    })
  }
}

// 创建全局实例
export const perfMonitor = new PerformanceMonitor()

/**
 * 性能监控装饰器
 */
export function measurePerformance(metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const name = metricName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      perfMonitor.startMark(name)
      try {
        const result = await originalMethod.apply(this, args)
        perfMonitor.endMark(name)
        return result
      } catch (error) {
        perfMonitor.endMark(name)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * React Hook 用于性能监控
 */
export function usePerformanceMonitor(componentName: string) {
  const startMark = (name: string) => {
    perfMonitor.startMark(`${componentName}.${name}`)
  }

  const endMark = (name: string) => {
    return perfMonitor.endMark(`${componentName}.${name}`)
  }

  const recordMetric = (name: string, value: number) => {
    perfMonitor.recordMetric(`${componentName}.${name}`, value)
  }

  return {
    startMark,
    endMark,
    recordMetric
  }
}
