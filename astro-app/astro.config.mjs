import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Polyfill __dirname for ESM context (needed by some dependencies)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Only expose __dirname globally, NOT require (to avoid Rollup native module issues)
globalThis.__dirname = __dirname

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

// https://github.com/parcel-bundler/lightningcss/issues/874
const lightningcssFix = {
  name: 'lightningcss-fix',
  enforce: 'pre',
  resolveId(id) {
    if (id === '../pkg' || id === '../pkg?commonjs-external') {
      return { id: 'lightningcss', external: true }
    }
    return null
  }
}

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
    plugins: [lightningcssFix],
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
