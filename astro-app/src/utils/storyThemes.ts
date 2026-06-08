import type { StoryTheme, StoryStat } from '../types'

export interface StoryThemeConfig {
  bgGradient: string
  primaryButton: string
  primaryButtonHover: string
  primaryShadow: string
  accent: string
  accentLight: string
  cardBg: string
  cardBgHover: string
  headerBg: string
  headerBorder: string
  endEmoji: string
  loadingText: string
  loadingDotColor: string
  statColors: string[]
}

const THEME_MAP: Record<StoryTheme, StoryThemeConfig> = {
  romantic: {
    bgGradient: 'bg-gradient-to-b from-rose-950 to-slate-900',
    primaryButton: 'bg-pink-500',
    primaryButtonHover: 'hover:bg-pink-600',
    primaryShadow: 'shadow-pink-500/20',
    accent: 'text-pink-400',
    accentLight: 'text-pink-300',
    cardBg: 'bg-rose-900/30',
    cardBgHover: 'hover:bg-rose-800/40',
    headerBg: 'bg-rose-950/80',
    headerBorder: 'border-rose-800/50',
    endEmoji: '❤️',
    loadingText: 'The story continues...',
    loadingDotColor: 'bg-pink-400',
    statColors: ['bg-pink-500', 'bg-rose-400', 'bg-fuchsia-400', 'bg-pink-300', 'bg-rose-500'],
  },
  horror: {
    bgGradient: 'bg-gradient-to-b from-gray-950 to-red-950/30',
    primaryButton: 'bg-red-600',
    primaryButtonHover: 'hover:bg-red-700',
    primaryShadow: 'shadow-red-600/20',
    accent: 'text-red-400',
    accentLight: 'text-red-300',
    cardBg: 'bg-gray-800/60',
    cardBgHover: 'hover:bg-gray-700/70',
    headerBg: 'bg-gray-950/80',
    headerBorder: 'border-red-900/40',
    endEmoji: '💀',
    loadingText: 'Something lurks in the shadows...',
    loadingDotColor: 'bg-red-400',
    statColors: ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-500', 'bg-red-400'],
  },
  mystery: {
    bgGradient: 'bg-gradient-to-b from-indigo-950 to-slate-900',
    primaryButton: 'bg-indigo-500',
    primaryButtonHover: 'hover:bg-indigo-600',
    primaryShadow: 'shadow-indigo-500/20',
    accent: 'text-indigo-400',
    accentLight: 'text-indigo-300',
    cardBg: 'bg-indigo-900/30',
    cardBgHover: 'hover:bg-indigo-800/40',
    headerBg: 'bg-indigo-950/80',
    headerBorder: 'border-indigo-800/50',
    endEmoji: '🔍',
    loadingText: 'Investigating...',
    loadingDotColor: 'bg-indigo-400',
    statColors: ['bg-indigo-500', 'bg-violet-400', 'bg-blue-400', 'bg-cyan-400', 'bg-purple-400'],
  },
  fantasy: {
    bgGradient: 'bg-gradient-to-b from-purple-950 to-slate-900',
    primaryButton: 'bg-purple-500',
    primaryButtonHover: 'hover:bg-purple-600',
    primaryShadow: 'shadow-purple-500/20',
    accent: 'text-purple-400',
    accentLight: 'text-purple-300',
    cardBg: 'bg-purple-900/30',
    cardBgHover: 'hover:bg-purple-800/40',
    headerBg: 'bg-purple-950/80',
    headerBorder: 'border-purple-800/50',
    endEmoji: '✨',
    loadingText: 'The magic unfolds...',
    loadingDotColor: 'bg-purple-400',
    statColors: ['bg-purple-500', 'bg-violet-400', 'bg-fuchsia-400', 'bg-amber-400', 'bg-emerald-400'],
  },
  business: {
    bgGradient: 'bg-gradient-to-b from-slate-900 to-slate-800',
    primaryButton: 'bg-cyan-500',
    primaryButtonHover: 'hover:bg-cyan-600',
    primaryShadow: 'shadow-cyan-500/20',
    accent: 'text-cyan-400',
    accentLight: 'text-cyan-300',
    cardBg: 'bg-slate-700/60',
    cardBgHover: 'hover:bg-slate-600/80',
    headerBg: 'bg-slate-900/80',
    headerBorder: 'border-slate-700/50',
    endEmoji: '🎯',
    loadingText: 'Crunching the numbers...',
    loadingDotColor: 'bg-cyan-400',
    statColors: ['bg-cyan-500', 'bg-emerald-400', 'bg-amber-400', 'bg-blue-400', 'bg-teal-400'],
  },
  dark: {
    bgGradient: 'bg-gradient-to-b from-slate-900 to-slate-800',
    primaryButton: 'bg-amber-500',
    primaryButtonHover: 'hover:bg-amber-600',
    primaryShadow: 'shadow-amber-500/20',
    accent: 'text-amber-400',
    accentLight: 'text-amber-300',
    cardBg: 'bg-slate-700/60',
    cardBgHover: 'hover:bg-slate-600/80',
    headerBg: 'bg-slate-900/80',
    headerBorder: 'border-slate-700/50',
    endEmoji: '⭐',
    loadingText: 'Thinking...',
    loadingDotColor: 'bg-amber-400',
    statColors: ['bg-amber-500', 'bg-emerald-400', 'bg-blue-400', 'bg-rose-400', 'bg-violet-400'],
  },
}

export function getThemeConfig(theme: StoryTheme): StoryThemeConfig {
  return THEME_MAP[theme] || THEME_MAP.dark
}

export function getStatColor(stats: StoryStat[], statIndex: number, theme: StoryTheme): string {
  const config = THEME_MAP[theme] || THEME_MAP.dark
  return config.statColors[statIndex % config.statColors.length]
}

const SPEAKER_TEXT_COLORS = [
  'text-blue-400',
  'text-amber-400',
  'text-emerald-400',
  'text-violet-400',
  'text-rose-400',
  'text-cyan-400',
]

const SPEAKER_BORDER_COLORS = [
  'border-l-blue-400/60',
  'border-l-amber-400/60',
  'border-l-emerald-400/60',
  'border-l-violet-400/60',
  'border-l-rose-400/60',
  'border-l-cyan-400/60',
]

export function buildSpeakerColorMap(characters: Array<{ id: string; name: string }>): Map<string, { text: string; border: string }> {
  const map = new Map<string, { text: string; border: string }>()
  characters.forEach((char, i) => {
    map.set(char.name, {
      text: SPEAKER_TEXT_COLORS[i % SPEAKER_TEXT_COLORS.length],
      border: SPEAKER_BORDER_COLORS[i % SPEAKER_BORDER_COLORS.length],
    })
  })
  return map
}

export function getSpeakerColor(
  speaker: string,
  colorMap: Map<string, { text: string; border: string }>,
  nextIndex: { current: number },
): { text: string; border: string } {
  if (colorMap.has(speaker)) return colorMap.get(speaker)!
  const color = {
    text: SPEAKER_TEXT_COLORS[nextIndex.current % SPEAKER_TEXT_COLORS.length],
    border: SPEAKER_BORDER_COLORS[nextIndex.current % SPEAKER_BORDER_COLORS.length],
  }
  nextIndex.current++
  colorMap.set(speaker, color)
  return color
}
