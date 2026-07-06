<script lang="ts">
  import { resolve } from '$app/paths';
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
  <!-- Hero -->
  <header class="hero">
    {#if date}
      <div class="hero-meta">
        <time datetime={data.article.publishedDate ?? undefined}>{date}</time>
      </div>
    {/if}

    <h1 class="hero-title">{data.article.title}</h1>

    {#if data.article.excerpt}
      <p class="hero-excerpt">{data.article.excerpt}</p>
    {/if}
  </header>

  <!-- Full-width cover band -->
  {#if data.article.coverImage}
    <div class="hero-cover">
      <CmsImage image={data.article.coverImage} sizes="100vw" eager={true} />
    </div>
  {/if}

  <!-- Body — rendered from the linear DAST in document order -->
  {#if data.article.content}
    <div class="article-body">
      <StructuredTextRenderer content={data.article.content} variant="cinematic" />
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
    /* No big bottom padding — ContentFooter already provides its own top margin,
       so stacking both left a huge empty band above the footer. */
    padding: clamp(40px, 5vw, 72px) var(--gutter) clamp(16px, 2vw, 28px);
  }

  /* ── Hero ── */
  .hero {
    margin-bottom: clamp(36px, 5vw, 64px);
  }

  .hero-meta {
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 22px;
  }

  .hero-title {
    font-size: clamp(32px, 4.4vw, 52px);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.08;
    color: var(--ink);
    max-width: 100%;
  }

  .hero-excerpt {
    margin-top: clamp(20px, 3vw, 34px);
    font-size: clamp(17px, 1.9vw, 22px);
    font-weight: 300;
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 46ch;
  }

  /* Full-width cover band (~2.4:1) — breaks out of the centered column */
  .hero-cover {
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
    margin-bottom: clamp(48px, 7vw, 96px);
    overflow: hidden;
  }

  .hero-cover :global(img) {
    width: 100%;
    height: clamp(340px, 62vh, 720px);
    object-fit: cover;
    display: block;
  }

  .article-body {
    position: relative;
  }

  .article-nav {
    clear: both;
    border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    padding-top: 32px;
    margin-top: clamp(48px, 6vw, 80px);
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
