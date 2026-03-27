/**
 * 安全工具 - 输入验证和XSS防护
 */

/**
 * 清理用户输入，防止XSS攻击
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  return input
    // 移除潜在的HTML标签
    .replace(/<[^>]*>/g, '')
    // 移除JavaScript事件处理器
    .replace(/on\w+\s*=/gi, '')
    // 移除javascript: 协议
    .replace(/javascript:/gi, '')
    // 移除表达式
    .replace(/expression\(/gi, '')
    // 转义特殊字符
    .replace(/[&<>"'/]/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;',
        '=': '&#x3D;'
      }
      return entities[char] || char
    })
}

/**
 * 验证游戏名称（只允许字母、数字、空格和连字符）
 */
export function validateGameName(name: string): boolean {
  const regex = /^[a-zA-Z0-9\s-]+$/
  return regex.test(name) && name.length <= 50
}

/**
 * 验证URL
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    // 只允许HTTP和HTTPS协议
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 验证邮箱地址
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 254
}

/**
 * 验证分数值
 */
export function validateScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 999999999
}

/**
 * 验证语言代码
 */
export function validateLanguage(lang: string): boolean {
  const validLangs = ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'es', 'ru', 'ja']
  return validLangs.includes(lang)
}

/**
 * CSP（内容安全策略）头生成器
 */
export function getCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://api.emailjs.com https://static.cloudflareinsights.com",
      "frame-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https:",
      "upgrade-insecure-requests"
    ].join('; ')
  }
}

/**
 * 防止点击劫持
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...getCSPHeaders(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
}

/**
 * 安全的localStorage包装器
 */
export const secureStorage = {
  setItem(key: string, value: any): boolean {
    try {
      // 验证键名
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        console.warn('Invalid localStorage key:', key)
        return false
      }

      // 限制大小（localStorage通常限制5MB）
      const data = JSON.stringify(value)
      if (data.length > 5 * 1024 * 1024) {
        console.warn('Data too large for localStorage')
        return false
      }

      localStorage.setItem(key, data)
      return true
    } catch (error) {
      console.error('localStorage.setItem failed:', error)
      return false
    }
  },

  getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key)
      if (data === null) return null

      const parsed = JSON.parse(data)
      return parsed as T
    } catch (error) {
      console.error('localStorage.getItem failed:', error)
      return null
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('localStorage.removeItem failed:', error)
      return false
    }
  },

  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('localStorage.clear failed:', error)
      return false
    }
  },

  // 获取存储使用情况
  getUsageInfo(): { used: number, total: number, percentage: number } {
    try {
      let total = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      return {
        used: total,
        total: maxSize,
        percentage: (total / maxSize) * 100
      }
    } catch (error) {
      return { used: 0, total: 5242880, percentage: 0 }
    }
  }
}

/**
 * 防止JSON注入
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json)

    // 验证解析结果是否为预期类型
    if (typeof parsed !== 'object' || parsed === null) {
      return fallback
    }

    return parsed as T
  } catch (error) {
    console.error('JSON parse failed:', error)
    return fallback
  }
}

/**
 * 验证和清理用户生成内容
 */
export function sanitizeUserContent(content: string, maxLength: number = 1000): string {
  if (typeof content !== 'string') return ''

  // 截断到最大长度
  const truncated = content.slice(0, maxLength)

  return sanitizeInput(truncated)
}

/**
 * 检查是否为安全的外部URL
 */
export function isSafeExternalURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // 允许的外部域名白名单
    const allowedDomains = [
      'youtube.com',
      'vimeo.com',
      'wikipedia.org',
      'github.com',
      'gitlab.com'
    ]

    // 检查是否在白名单中
    const isAllowed = allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )

    return isAllowed && (parsed.protocol === 'http:' || parsed.protocol === 'https:')
  } catch {
    return false
  }
}
