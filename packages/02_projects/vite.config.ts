import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

const designSystemSrc = path.resolve(__dirname, '../design-system/src/lib/index.ts');
const designSystemTheme = path.resolve(__dirname, '../design-system/src/theme/theme.css');

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    alias: {
      '@oute/design-system/theme': designSystemTheme,
      '@oute/design-system': designSystemSrc,
    },
  },
  ssr: {
    noExternal: ['@oute/design-system'],
  },
  server: {
    port: 3005,
    host: '0.0.0.0',
  },
  build: {
    target: 'es2020',
  },
});
