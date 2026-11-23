// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  build: {
    // Legg CSS direkte i HTML-en i stedet for en egen fil som blokkerer visning.
    inlineStylesheets: 'always',
  },
});
