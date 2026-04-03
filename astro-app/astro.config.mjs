import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

// Polyfill __dirname for ESM context (needed by lightningcss)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
globalThis.__dirname = __dirname

// Create a global require with error handling for missing native modules
const nodeRequire = createRequire(import.meta.url)

// Intercept require to handle missing @rollup/rollup-* modules
globalThis.require = function patchedRequire(id) {
  if (id && id.startsWith('@rollup/rollup-')) {
    try {
      return nodeRequire(id)
    } catch {
      // Return empty object for missing native modules
      // Rollup will fall back to WASM implementation
      return { default: {}, load: () => null }
    }
  }
  return nodeRequire(id)
}

// Copy over resolve and other properties
Object.setPrototypeOf(globalThis.require, nodeRequire)
for (const key of Object.keys(nodeRequire)) {
  if (key !== 'require') {
    try {
      globalThis.require[key] = nodeRequire[key]
    } catch {}
  }
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
