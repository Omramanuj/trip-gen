/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROMPT_SERVICE_URL: string;
  readonly VITE_PROMPT_SERVICE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
