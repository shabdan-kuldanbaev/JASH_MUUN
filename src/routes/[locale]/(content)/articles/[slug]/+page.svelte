<script lang="ts">
  import { asset, resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { m, LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import CmsImage from '$cms/CmsImage.svelte';
  import StructuredTextRenderer from '$cms/StructuredTextRenderer.svelte';

  let { data }: { data: PageData } = $props();

  const date = $derived(
    data.article.publishedDate
      ? new Date(data.article.publishedDate).toLocaleDateString(data.locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null
  );
</script>

<SeoHead
  title={data.article.seo?.title ?? `${data.article.title} — Jash-Muun`}
  description={data.article.seo?.description ?? data.article.excerpt}
  seo={data.article.seo}
  locale={data.locale}
  alternateLocales={LOCALES.map((locale) => ({
    locale,
    url: resolve(`/${locale}/articles/${data.article.slug}/`)
  }))}
/>

<article class="article">
  <!-- Header -->
  <header class="article-header">
    <div class="article-meta">
      {#if data.article.featured}
        <span class="article-featured">{m.common_featured()}</span>
        <span class="article-sep" aria-hidden="true">·</span>
      {/if}
      {#if date}
        <time datetime={data.article.publishedDate ?? undefined}>{date}</time>
      {/if}
    </div>

    <h1 class="article-title">{data.article.title}</h1>

    {#if data.article.excerpt}
      <p class="article-excerpt">{data.article.excerpt}</p>
    {/if}
  </header>

  <!-- Petroglyph accent — partial reveal from right edge -->
  <img
    src={asset('/assets/petroglyphs/7.svg')}
    aria-hidden="true"
    class="petroglyph detail-petro"
    alt=""
  />

  <!-- Cover image -->
  {#if data.article.coverImage}
    <div class="article-cover">
      <CmsImage image={data.article.coverImage} sizes="100vw" eager={true} />
    </div>
  {/if}

  <!-- Body -->
  {#if data.article.content}
    <div class="article-body">
      <StructuredTextRenderer content={data.article.content} />
    </div>
  {/if}

  <!-- Back link -->
  <nav class="article-nav" aria-label={m.articles_navigation_aria()}>
    <a href={resolve(`/${data.locale}/articles/`)} class="back-link"
      >← {m.common_back_to_articles()}</a
    >
  </nav>
</article>

<style>
  .article {
    position: relative;
    max-width: var(--article-w);
    margin: 0 auto;
    padding: clamp(48px, 6vw, 80px) var(--gutter) clamp(80px, 10vw, 140px);
  }

  .detail-petro {
    top: 40%;
    right: -40px;
    width: clamp(100px, 10vw, 150px);
    transform: rotate(-10deg);
  }

  .article-header {
    position: relative;
    z-index: 1;
    margin-bottom: clamp(32px, 4vw, 56px);
  }

  .article-meta {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 20px;
  }

  .article-featured {
    color: var(--ochre-2);
  }

  .article-sep {
    opacity: 0.5;
  }

  .article-title {
    font-size: clamp(28px, 4.5vw, 58px);
    font-weight: 300;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--ink);
    margin-bottom: 20px;
    max-width: 22ch;
  }

  .article-excerpt {
    font-size: clamp(16px, 1.8vw, 20px);
    line-height: 1.6;
    color: var(--muted);
    max-width: 54ch;
  }

  .article-cover {
    position: relative;
    z-index: 1;
    margin: 0 calc(var(--gutter) * -1) clamp(40px, 5vw, 72px);
    overflow: hidden;
    max-height: 70vh;
  }

  .article-cover :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .article-body {
    position: relative;
    z-index: 1;
    border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding-top: clamp(32px, 4vw, 56px);
    margin-bottom: clamp(56px, 7vw, 96px);
  }

  .article-nav {
    position: relative;
    z-index: 1;
    border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding-top: 32px;
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
