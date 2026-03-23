import { defineConfig } from 'sanity'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'RuleWord CMS',
  projectId: '0dvqdd4m',
  dataset: 'production',
  plugins: [],
  schema: {
    types: schemaTypes,
  },
})
