import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export const languages = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  ru: 'Русский',
  ja: '日本語',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
}

export const defaultLang = 'en'

export default defineConfig({
  site: 'https://ruleword.com',
  integrations: [react()],
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh-TW', 'zh-CN'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      rollupOptions: {
        external: (id) => {
          // Externalize macOS-only fsevents
          if (id === 'fsevents') return true
          // Externalize lightningcss native bindings (../pkg references)
          if (id.includes('../pkg') || id === '../pkg?commonjs-external') return true
          return false
        }
      }
    }
  }
})
