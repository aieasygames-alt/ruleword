/**
 * 无障碍访问 (Accessibility) 工具
 * 帮助实现 ARIA 标签和键盘导航
 */

/**
 * ARIA 属性生成器
 */
export const aria = {
  /**
   * 为按钮生成 ARIA 属性
   */
  button: (label: string, pressed?: boolean, expanded?: boolean) => ({
    role: 'button' as const,
    'aria-label': label,
    ...(pressed !== undefined && { 'aria-pressed': pressed }),
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    tabIndex: 0
  }),

  /**
   * 为模态框生成 ARIA 属性
   */
  dialog: (label: string, describedBy?: string) => ({
    role: 'dialog' as const,
    'aria-modal': 'true',
    'aria-label': label,
    ...(describedBy && { 'aria-describedby': describedBy }),
  }),

  /**
   * 为下拉菜单生成 ARIA 属性
   */
  menu: (label: string, expanded: boolean) => ({
    role: 'menu' as const,
    'aria-label': label,
    'aria-expanded': expanded,
  }),

  /**
   * 为列表项生成 ARIA 属性
   */
  menuItem: (index: number, total: number) => ({
    role: 'menuitem' as const,
    tabIndex: index === 0 ? 0 : -1,
    'aria-posinset': index + 1,
    'aria-setsize': total,
  }),

  /**
   * 为输入框生成 ARIA 属性
   */
  input: (label: string, required?: boolean, invalid?: boolean, describedBy?: string) => ({
    'aria-label': label,
    ...(required && { 'aria-required': 'true' }),
    ...(invalid && { 'aria-invalid': 'true' }),
    ...(describedBy && { 'aria-describedby': describedBy }),
  }),

  /**
   * 为加载状态生成 ARIA 属性
   */
  loading: (label: string = 'Loading...') => ({
    role: 'status' as const,
    'aria-live': 'polite' as const,
    'aria-busy': 'true',
    'aria-label': label,
  }),

  /**
   * 为通知生成 ARIA 属性
   */
  alert: (role: 'alert' | 'status' = 'status') => ({
    role,
    'aria-live': role === 'alert' ? 'assertive' : 'polite',
  }),

  /**
   * 为导航生成 ARIA 属性
   */
  navigation: (label: string) => ({
    role: 'navigation' as const,
    'aria-label': label,
  }),

  /**
   * 为搜索生成 ARIA 属性
   */
  search: (label: string = 'Search games') => ({
    role: 'search' as const,
    'aria-label': label,
  }),
}

/**
 * 键盘导航工具
 */
export class KeyboardNav {
  private focusableElements: string[] = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]

  /**
   * 获取容器内所有可聚焦元素
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableElements.join(','))
    ) as HTMLElement[]
  }

  /**
   * 将焦点限制在容器内（用于模态框）
   */
  trapFocus(container: HTMLElement) {
    const focusable = this.getFocusableElements(container)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
  }

  /**
   * 焦点到第一个元素
   */
  focusFirst(container: HTMLElement) {
    const focusable = this.getFocusableElements(container)
    if (focusable.length > 0) {
      focusable[0].focus()
    }
  }

  /**
   * ESC 键关闭处理
   */
  onEscape(callback: () => void) {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }

  /**
   * 全局快捷键
   */
  registerShortcut(keys: string[], callback: () => void, description?: string) {
    const handler = (e: KeyboardEvent) => {
      // 检查是否按下了所有需要的键
      const keyMatch = keys.every(key => {
        if (key === 'Ctrl') return e.ctrlKey || e.metaKey
        if (key === 'Shift') return e.shiftKey
        if (key === 'Alt') return e.altKey
        return e.key === key
      })

      if (keyMatch) {
        e.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handler)

    // 如果提供了描述，添加到 ARIA
    if (description) {
      // 可以将快捷键信息添加到页面中供屏幕阅读器使用
      let shortcutsList = document.getElementById('keyboard-shortcuts')
      if (!shortcutsList) {
        shortcutsList = document.createElement('ul')
        shortcutsList.id = 'keyboard-shortcuts'
        shortcutsList.setAttribute('aria-label', 'Keyboard shortcuts')
        shortcutsList.className = 'sr-only' // 屏幕阅读器专用
        document.body.appendChild(shortcutsList)
      }

      const shortcut = document.createElement('li')
      shortcut.textContent = `${keys.join('+')}: ${description}`
      shortcutsList.appendChild(shortcut)
    }

    return () => document.removeEventListener('keydown', handler)
  }
}

/**
 * 屏幕阅读器专用样式
 */
export const srOnly = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`

/**
 * 跳过链接工具
 */
export function addSkipLink(targetId: string, label: string = 'Skip to main content') {
  // 检查是否已存在
  if (document.querySelector('a.skip-link')) return

  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.className = 'skip-link'
  skipLink.textContent = label
  skipLink.setAttribute('aria-label', label)

  // 添加样式
  const style = document.createElement('style')
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    }
    .skip-link:focus {
      top: 0;
    }
  `
  document.head.appendChild(style)
  document.body.insertBefore(skipLink, document.body.firstChild)

  // 确保目标元素有 ID
  const target = document.getElementById(targetId)
  if (target) {
    target.setAttribute('tabindex', '-1')
  }
}

/**
 * 焦点管理器
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null

  /**
   * 保存当前焦点
   */
  save() {
    this.previousFocus = document.activeElement as HTMLElement
  }

  /**
   * 恢复之前保存的焦点
   */
  restore() {
    if (this.previousFocus) {
      this.previousFocus.focus()
    }
  }

  /**
   * 将焦点移到指定元素
   */
  focus(element: HTMLElement | string) {
    const el = typeof element === 'string'
      ? document.querySelector(element) as HTMLElement
      : element

    if (el) {
      el.focus()
    }
  }
}

/**
 * 颜色对比度检查
 */
export function checkContrastRatio(foreground: string, background: string): number {
  // 将颜色转换为 RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (!fg || !bg) return 0

  // 计算相对亮度
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(v => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return rs * 0.2126 + gs * 0.7152 + bs * 0.0722
  }

  const L1 = getLuminance(fg.r, fg.g, fg.b)
  const L2 = getLuminance(bg.r, bg.g, bg.b)

  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)

  // 返回对比度比率
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 检查对比度是否符合 WCAG 标准
 */
export function isValidContrast(ratio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  }

  return ratio >= requirements[level][size]
}

// 创建全局实例
export const keyboardNav = new KeyboardNav()
export const focusManager = new FocusManager()
