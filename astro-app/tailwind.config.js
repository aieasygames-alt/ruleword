/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-up-delay-1': 'slideUp 0.4s ease-out 0.1s forwards',
        'slide-up-delay-2': 'slideUp 0.4s ease-out 0.2s forwards',
        'slide-up-delay-3': 'slideUp 0.4s ease-out 0.3s forwards',
        'pulse-bar': 'pulseBar 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseBar: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.08)' },
        },
      },
    },
  },
  plugins: [],
}
