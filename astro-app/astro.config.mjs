import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'
import path from 'path'

// Polyfill for ESM context - needed by lightningcss and other native modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
globalThis.__dirname = __dirname

// Create require but only for specific allowed modules
const require = createRequire(import.meta.url)

// Intercept require to handle missing native modules gracefully
const originalRequire = require
globalThis.require = (id) => {
  // Allow @rollup/rollup-* modules to fail gracefully
  if (id.startsWith('@rollup/rollup-')) {
    try {
      return originalRequire(id)
    } catch {
      // Return empty module for missing Rollup native bindings
      // Rollup will fall back to WASM implementation
      return {}
    }
  }
  return originalRequire(id)
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

// Create a virtual module for empty Rollup native bindings
const emptyNativeModule = 'export default {}'

const rollupNativeFallback = {
  name: 'rollup-native-fallback',
  enforce: 'pre',
  resolveId(id) {
    // Redirect all @rollup/rollup-* imports to our virtual module
    if (id.startsWith('@rollup/rollup-')) {
      return { id: 'virtual:rollup-native-empty', external: false }
    }
    // Handle lightningcss ../pkg imports
    if (id === '../pkg' || id === '../pkg?commonjs-external') {
      return { id: 'lightningcss', external: true }
    }
    return null
  },
  load(id) {
    if (id === 'virtual:rollup-native-empty') {
      return emptyNativeModule
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
    plugins: [rollupNativeFallback],
    build: {
      rollupOptions: {
        external: [
          'fsevents',
          'lightningcss'
        ]
      }
    },
    ssr: {
      external: ['lightningcss']
    }
  }
})
