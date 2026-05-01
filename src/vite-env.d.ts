/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_REPO: string;
  readonly VITE_TWITTER_ID: string;
  readonly VITE_DISCORD_ID: string;
  readonly VITE_DISCORD_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
