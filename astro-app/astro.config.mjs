import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

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

// Empty module for Rollup native fallback
const emptyNativeModule = 'export default {}; export const sync = undefined;'

// Vite plugin to handle Rollup native modules
const rollupNativeFallback = {
  name: 'rollup-native-fallback',
  enforce: 'pre',
  resolveId(id) {
    // Handle lightningcss ../pkg imports
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
    plugins: [rollupNativeFallback],
    resolve: {
      alias: {
        // Redirect all @rollup/rollup-* imports to empty module
        '@rollup/rollup-linux-x64-gnu': 'data:text/javascript,' + encodeURIComponent(emptyNativeModule),
        '@rollup/rollup-linux-x64-musl': 'data:text/javascript,' + encodeURIComponent(emptyNativeModule),
        '@rollup/rollup-darwin-x64': 'data:text/javascript,' + encodeURIComponent(emptyNativeModule),
        '@rollup/rollup-darwin-arm64': 'data:text/javascript,' + encodeURIComponent(emptyNativeModule),
        '@rollup/rollup-win32-x64-msvc': 'data:text/javascript,' + encodeURIComponent(emptyNativeModule),
      }
    },
    build: {
      rollupOptions: {
        external: [
          'fsevents',
          'lightningcss'
        ]
      }
    },
    ssr: {
      external: ['lightningcss'],
      noExternal: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-x64-musl']
    }
  }
})
