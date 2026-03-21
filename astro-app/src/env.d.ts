/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Sanity CMS
  readonly SANITY_PROJECT_ID?: string
  readonly SANITY_DATASET?: string
  readonly SANITY_API_TOKEN?: string

  // Contentful CMS (备选)
  readonly CONTENTFUL_SPACE_ID?: string
  readonly CONTENTFUL_DELIVERY_TOKEN?: string
  readonly CONTENTFUL_PREVIEW_TOKEN?: string
  readonly CONTENTFUL_ENVIRONMENT?: string
  readonly CONTENTFUL_MANAGEMENT_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
