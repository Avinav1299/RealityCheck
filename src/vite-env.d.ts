/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_MISTRAL_API_KEY: string
  readonly VITE_COHERE_API_KEY: string
  readonly VITE_OLLAMA_BASE_URL: string
  readonly VITE_NEWSAPI_KEY: string
  readonly VITE_BING_IMAGE_API_KEY: string
  readonly VITE_GOOGLE_API_KEY: string
  readonly VITE_WIKI_API_BASE: string
  readonly VITE_USE_FREE_SOURCES_ONLY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}