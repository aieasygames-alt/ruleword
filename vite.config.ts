import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'robots.txt'],
      manifest: {
        name: 'RuleWord - Word Guessing Game',
        short_name: 'RuleWord',
        description: 'A fun 5-letter word guessing game. Guess the word in 6 tries!',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        orientation: 'portrait',
        categories: ['games', 'entertainment'],
        lang: 'en-US',
        icons: [
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/icons/screenshot-1.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'RuleWord Gameplay'
          }
        ],
        shortcuts: [
          {
            name: 'Play Game',
            short_name: 'Play',
            description: 'Start a new game',
            url: '/',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }]
          }
        ],
        related_applications: [],
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  base: '/'
})
