import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const designSystemSrc = path.resolve(__dirname, '../design-system/src/lib/index.ts');

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      '@oute/design-system': designSystemSrc
    }
  },
  ssr: {
    noExternal: ['@oute/design-system']
  },
  server: {
    port: 3004,
    host: '0.0.0.0'
  },
  build: {
    target: 'es2020'
  }
});
