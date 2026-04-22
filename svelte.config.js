import adapter from '@sveltejs/adapter-static';

const repoName = 'ALIPH_x_JASH_MOON';
const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build'
    }),
    alias: {
      $components: 'src/lib/components',
      $cms: 'src/lib/components/cms'
    },
    paths: {
      base: isGithubPages ? `/${repoName}` : ''
    },
    prerender: {
      handleMissingId: 'warn',
      handleUnseenRoutes: 'warn'
    }
  }
};

export default config;
