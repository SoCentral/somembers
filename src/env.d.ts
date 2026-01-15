/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly OFFICERND_CLIENT_ID: string;
  readonly OFFICERND_CLIENT_SECRET: string;
  readonly OFFICERND_ORG_SLUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
