import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  site: 'https://ruleword.com',
  integrations: [react()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  }
})
