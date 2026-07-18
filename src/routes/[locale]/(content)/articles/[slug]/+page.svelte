<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { m } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import ArticleSections from '$components/sections/ArticleSections.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead
  title={data.article.seo?.title ?? `${data.article.title} — Jash-Muun`}
  description={data.article.seo?.description ?? data.article.excerpt}
  seo={data.article.seo}
  locale={data.locale}
  type="article"
/>

<ArticleSections sections={data.sections} />

<nav class="article-foot" aria-label={m.articles_navigation_aria()}>
  <a href={resolve(`/${data.locale}/articles/`)} class="back-link"
    >← {m.common_back_to_articles()}</a
  >
</nav>

<style>
  .article-foot {
    padding: 40px var(--gutter) clamp(24px, 4vw, 48px);
  }

  .back-link {
    font-size: 13px;
    letter-spacing: 0.06em;
    color: var(--muted);
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--ink);
  }
</style>
