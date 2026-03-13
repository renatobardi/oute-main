import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
    }),
    paths: {
      base: '/chat',
    },
    alias: {
      $lib: 'src/lib',
      '@oute/design-system': '../../packages/design-system/src/lib/index.ts',
      '@oute/shared': '../../shared',
    },
  },
};

export default config;
