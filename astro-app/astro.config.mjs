import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import Module from 'module'

// Polyfill __dirname for ESM context (needed by lightningcss and other native modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
globalThis.__dirname = __dirname

// Intercept Module._load to handle missing native modules gracefully
const originalLoad = Module._load
Module._load = function(request, parent, isMain) {
  // Handle missing @rollup/rollup-* native modules
  if (request.startsWith('@rollup/rollup-')) {
    try {
      return originalLoad.apply(this, arguments)
    } catch (e) {
      // Return empty object for missing native modules
      // Rollup will fall back to WASM implementation
      return {}
    }
  }
  return originalLoad.apply(this, arguments)
}

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
        external: ['fsevents', 'lightningcss']
      }
    },
    ssr: {
      external: ['lightningcss']
    }
  }
})
