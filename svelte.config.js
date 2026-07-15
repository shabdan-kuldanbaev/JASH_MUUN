import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build'
    }),
    alias: {
      $i18n: 'src/lib/i18n',
      $components: 'src/lib/components',
      $cms: 'src/lib/components/cms'
    },
    prerender: {
      handleMissingId: 'warn',
      handleUnseenRoutes: 'warn'
    }
  }
};

export default config;
