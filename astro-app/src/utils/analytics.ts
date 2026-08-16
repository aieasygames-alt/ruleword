type AnalyticsValue = string | number | boolean | null | undefined

type RulewordEventPayload = Record<string, AnalyticsValue>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function trackRulewordEvent(name: string, payload: RulewordEventPayload = {}) {
  if (typeof window === 'undefined') return

  const detail = {
    event: name,
    ...payload,
  }

  window.dispatchEvent(new CustomEvent('rulewordAnalytics', { detail }))

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload)
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(detail)
  }
}
