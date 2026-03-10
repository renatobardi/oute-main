import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter(),
    alias: {
      $lib: 'src/lib',
      '@oute/design-system': '../../packages/design-system/src/index.ts',
      '@oute/shared': '../../shared/src/index.ts'
    }
  }
};
