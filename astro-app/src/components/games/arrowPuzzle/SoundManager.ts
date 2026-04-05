// ===== SOUND MANAGER =====

import { Haptics } from './Haptics'

/**
 * Sound effect manager using Web Audio API
 */
export class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true

  setEnabled(v: boolean) {
    this.enabled = v
  }

  private play(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    if (!this.enabled) return
    try {
      if (!this.ctx) this.ctx = new AudioContext()
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch {
      // Audio not supported
    }
  }

  slide() {
    this.play(800, 0.15, 'sine', 0.1)
    Haptics.slide()
  }

  blocked() {
    this.play(200, 0.3, 'square', 0.1)
    Haptics.error()
  }

  pop() {
    this.play(600, 0.1, 'sine', 0.08)
    Haptics.pop()
  }

  win() {
    Haptics.success()
    ;[523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.3, 'sine', 0.12), i * 120)
    })
  }

  fail() {
    Haptics.error()
    ;[400, 350, 300, 200].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.3, 'square', 0.08), i * 150)
    })
  }

  undo() {
    this.play(500, 0.1, 'triangle', 0.08)
    Haptics.light()
  }

  hint() {
    this.play(1000, 0.15, 'sine', 0.06)
    Haptics.light()
  }

  click() {
    this.play(400, 0.05, 'sine', 0.05)
    Haptics.light()
  }

  revive() {
    Haptics.success()
    ;[600, 800, 1000].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.2, 'sine', 0.1), i * 100)
    })
  }

  /**
   * Escalating sound for combo feedback
   */
  combo(level: number) {
    Haptics.combo(level)
    const baseFreq = 600 + level * 100
    this.play(baseFreq, 0.1, 'sine', 0.1)
    setTimeout(() => this.play(baseFreq * 1.25, 0.1, 'sine', 0.08), 50)
  }

  /**
   * Sound for ice freeze effect
   */
  freeze() {
    this.play(1200, 0.2, 'sine', 0.08)
    Haptics.medium()
  }

  /**
   * Sound for ice unfreeze
   */
  unfreeze() {
    this.play(800, 0.15, 'sine', 0.08)
    Haptics.light()
  }

  /**
   * Sound for teleport effect
   */
  teleport() {
    this.play(1500, 0.1, 'sine', 0.1)
    this.play(1000, 0.1, 'sine', 0.08)
    Haptics.pop()
  }

  /**
   * Pause/resume sound
   */
  pause() {
    this.play(300, 0.1, 'triangle', 0.08)
  }
}
