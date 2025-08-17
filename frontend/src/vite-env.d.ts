/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVICE_URL: string
  readonly VITE_COMPANY_SERVICE_URL: string
  readonly VITE_AI_SERVICE_URL: string
  readonly VITE_APP_TITLE: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __DEV__: boolean;
