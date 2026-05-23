import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Polyfill __dirname for ESM context (needed by lightningcss)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
globalThis.__dirname = __dirname

export const languages = {
  en: 'English',
  'zh-CN': '简体中文',
}

export const defaultLang = 'en'

export default defineConfig({
  site: 'https://ruleword.com',
  integrations: [react()],
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
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
        external: ['fsevents', 'lightningcss']
      }
    },
    ssr: {
      external: ['lightningcss']
    }
  }
})
