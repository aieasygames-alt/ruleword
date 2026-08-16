import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRulewordEvent } from '../src/utils/analytics'

describe('trackRulewordEvent', () => {
  beforeEach(() => {
    window.dataLayer = []
    window.gtag = vi.fn()
  })

  it('sends events to gtag, dataLayer, and local listeners', () => {
    const listener = vi.fn()
    window.addEventListener('rulewordAnalytics', listener)

    trackRulewordEvent('boggle_start', {
      mode: 'daily',
      board_size: 5,
    })

    expect(window.gtag).toHaveBeenCalledWith('event', 'boggle_start', {
      mode: 'daily',
      board_size: 5,
    })
    expect(window.dataLayer).toContainEqual({
      event: 'boggle_start',
      mode: 'daily',
      board_size: 5,
    })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].detail).toEqual({
      event: 'boggle_start',
      mode: 'daily',
      board_size: 5,
    })

    window.removeEventListener('rulewordAnalytics', listener)
  })
})
