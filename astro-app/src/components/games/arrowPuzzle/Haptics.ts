// ===== HAPTICS (Vibration Feedback) =====

/**
 * Haptic feedback utility class for mobile devices
 */
export class Haptics {
  static light(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  static medium(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20)
    }
  }

  static heavy(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  static success(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 50, 10])
    }
  }

  static error(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20, 30, 20])
    }
  }

  static slide(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }
  }

  static pop(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([5, 10, 5])
    }
  }

  /**
   * Escalating vibration for combo feedback
   */
  static combo(level: number): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const pattern = Array(Math.min(level, 5))
        .fill(0)
        .flatMap((_, i) => [10 + i * 5, 20])
      navigator.vibrate(pattern)
    }
  }
}
