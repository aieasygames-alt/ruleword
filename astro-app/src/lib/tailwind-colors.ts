// Tailwind utility class → hex color lookup for satori (which needs inline styles)
// Covers all gradient colors used in games, stories, and categories

const tailwindColors: Record<string, string> = {
  // Amber
  'from-amber-500': '#f59e0b', 'from-amber-600': '#d97706', 'from-amber-700': '#b45309',
  'to-amber-500': '#f59e0b', 'to-amber-600': '#d97706', 'to-amber-700': '#b45309', 'to-amber-900': '#78350f',
  // Blue
  'from-blue-400': '#60a5fa', 'from-blue-500': '#3b82f6', 'from-blue-600': '#2563eb',
  'to-blue-600': '#2563eb', 'to-blue-700': '#1d4ed8',
  // Cyan
  'from-cyan-400': '#22d3ee', 'from-cyan-500': '#06b6d4',
  'to-cyan-600': '#0891b2',
  // Emerald
  'from-emerald-500': '#10b981', 'from-emerald-600': '#059669',
  'to-emerald-600': '#059669', 'to-emerald-900': '#064e3b',
  // Fuchsia
  'from-fuchsia-500': '#d946ef',
  // Gray
  'from-gray-500': '#6b7280', 'from-gray-600': '#4b5563',
  'to-gray-600': '#4b5563', 'to-gray-800': '#1f2937',
  // Green
  'from-green-400': '#4ade80', 'from-green-500': '#22c55e', 'from-green-600': '#16a34a',
  'to-green-600': '#16a34a',
  // Indigo
  'from-indigo-500': '#6366f1',
  'to-indigo-600': '#4f46e5', 'to-indigo-700': '#4338ca',
  // Lime
  'from-lime-500': '#84cc16',
  'to-lime-600': '#65a30d',
  // Orange
  'from-orange-500': '#f97316',
  'to-orange-600': '#ea580c', 'to-orange-700': '#c2410c',
  // Pink
  'from-pink-500': '#ec4899',
  'to-pink-600': '#db2777',
  // Purple
  'from-purple-500': '#a855f7', 'from-purple-600': '#9333ea',
  'to-purple-600': '#9333ea', 'to-purple-700': '#7e22ce',
  // Red
  'from-red-500': '#ef4444', 'from-red-600': '#dc2626',
  'to-red-600': '#dc2626', 'to-red-700': '#b91c1c',
  // Rose
  'from-rose-400': '#fb7185', 'from-rose-500': '#f43f5e',
  'to-rose-600': '#e11d48', 'to-rose-700': '#be123c',
  // Sky
  'from-sky-500': '#0ea5e9',
  // Slate
  'from-slate-400': '#94a3b8', 'from-slate-500': '#64748b', 'from-slate-600': '#475569', 'from-slate-700': '#334155',
  'to-slate-600': '#475569', 'to-slate-700': '#334155', 'to-slate-800': '#1e293b',
  // Stone
  'from-stone-500': '#78716c',
  // Teal
  'from-teal-500': '#14b8a6',
  'to-teal-600': '#0d9488',
  // Violet
  'from-violet-500': '#8b5cf6',
  'to-violet-600': '#7c3aed',
  // Yellow
  'from-yellow-400': '#facc15', 'from-yellow-500': '#eab308',
  'to-yellow-600': '#ca8a04',
  // Zinc
  'from-zinc-500': '#71717a',
  // Neutral
  'to-neutral-600': '#525252',
}

export function resolveGradient(colorClass: string): { from: string; to: string } {
  const parts = colorClass.split(' ').filter((s: string) => s.startsWith('from-') || s.startsWith('to-'))
  const fromClass = parts.find((s: string) => s.startsWith('from-')) || 'from-slate-700'
  const toClass = parts.find((s: string) => s.startsWith('to-')) || 'to-slate-900'
  return {
    from: tailwindColors[fromClass] || '#334155',
    to: tailwindColors[toClass] || '#0f172a',
  }
}
