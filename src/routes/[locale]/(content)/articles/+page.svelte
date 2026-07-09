<script lang="ts">
  import { resolve, asset } from '$app/paths';
  import type { PageData } from './$types';
  import { m, LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import { reveal } from '$lib/actions/reveal';
  import CmsImage from '$cms/CmsImage.svelte';
  import type { ArticleSummary } from '$lib/types/datocms';

  let { data }: { data: PageData } = $props();

  const href = (slug: string) => resolve(`/${data.locale}/articles/${slug}/`);

  function formatDate(iso?: string | null): string {
    if (!iso) return '';
    const opts: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    try {
      return new Date(iso).toLocaleDateString(data.locale, opts);
    } catch {
      return new Date(iso).toLocaleDateString('ru', opts);
    }
  }

  const PAGE_SIZE = 4;

  // Featured = CMS-flagged article, else the newest (list is publishedDate_DESC).
  const featured = $derived<ArticleSummary | undefined>(
    data.articles.find((a) => a.featured) ?? data.articles[0]
  );
  // Everything else feeds the paginated bento grid.
  const rest = $derived(data.articles.filter((a) => a !== featured));
  const totalPages = $derived(Math.max(1, Math.ceil(rest.length / PAGE_SIZE)));

  let page = $state(1);
  // Keep `page` in range if the article set shrinks (e.g. data refresh).
  $effect(() => {
    if (page > totalPages) page = totalPages;
  });
  const pageCards = $derived(rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

  let gridTop = $state<HTMLElement>();

  function goTo(next: number) {
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped === page) return;
    page = clamped;
    gridTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<SeoHead
  title={m.articles_meta_title()}
  description={m.articles_meta_description()}
  locale={data.locale}
  alternateLocales={LOCALES.map((locale) => ({
    locale,
    url: resolve(`/${locale}/articles/`)
  }))}
/>

<div class="page">
  <img
    src={asset('/assets/petroglyphs/6.svg')}
    aria-hidden="true"
    class="petroglyph articles-petro-1"
    alt=""
  />

  <header class="masthead">
    <h1 class="page-title">{m.articles_title()}</h1>
  </header>

  {#if data.articles.length === 0}
    <div class="empty">
      <p>{m.articles_empty()}</p>
    </div>
  {:else}
    {#if page === 1 && featured}
      <a class="featured" href={href(featured.slug)} use:reveal={0}>
        <div class="featured-text">
          {#if featured.publishedDate}
            <span class="eyebrow">{formatDate(featured.publishedDate)}</span>
          {/if}
          <h2 class="featured-title">{featured.title}</h2>
          {#if featured.excerpt}
            <p class="featured-excerpt">{featured.excerpt}</p>
          {/if}
          <span class="read read--accent">{m.articles_read_full()}</span>
        </div>
        <div class="featured-cover">
          {#if featured.coverImage}
            <CmsImage image={featured.coverImage} eager sizes="(min-width: 900px) 660px, 100vw" />
          {/if}
        </div>
      </a>
    {/if}

    <div class="bento" bind:this={gridTop} aria-label={m.articles_list_aria()}>
      {#each pageCards as article, i (article.id)}
        <a class="card" href={href(article.slug)} use:reveal={i * 40}>
          {#if article.coverImage}
            <CmsImage image={article.coverImage} sizes="(min-width: 900px) 50vw, 100vw" />
          {/if}
          <span class="scrim" aria-hidden="true"></span>
          <div class="caption">
            <h3 class="card-title">{article.title}</h3>
            <span class="card-meta"
              >{article.publishedDate
                ? `${formatDate(article.publishedDate)} · `
                : ''}{m.common_read()}</span
            >
          </div>
        </a>
      {/each}
    </div>

    {#if totalPages > 1}
      <nav class="pagination" aria-label={m.articles_navigation_aria()}>
        <button
          class="pg pg--edge"
          type="button"
          onclick={() => goTo(page - 1)}
          disabled={page === 1}
        >
          ← {m.pagination_prev()}
        </button>
        {#each Array.from({ length: totalPages }, (_, i) => i + 1) as n (n)}
          <button
            class="pg"
            type="button"
            class:active={n === page}
            aria-current={n === page ? 'page' : undefined}
            aria-label="{m.pagination_page_aria()} {n}"
            onclick={() => goTo(n)}
          >
            {n}
          </button>
        {/each}
        <button
          class="pg pg--edge"
          type="button"
          onclick={() => goTo(page + 1)}
          disabled={page === totalPages}
        >
          {m.pagination_next()} →
        </button>
      </nav>
    {/if}
  {/if}
</div>

<style>
  .page {
    position: relative;
    max-width: var(--content-w);
    margin: 0 auto;
    padding: clamp(20px, 2.5vw, 40px) var(--gutter) clamp(48px, 6vw, 80px);
  }

  /* ── Masthead ───────────────────────────────── */
  .masthead {
    position: relative;
    z-index: 1;
    margin-bottom: clamp(28px, 4vw, 56px);
  }
  .page-title {
    font-weight: 600;
    font-size: clamp(34px, 4vw, 42px);
    letter-spacing: -1px;
    line-height: 1;
    color: var(--ink);
  }

  .empty {
    padding: 120px 0;
    color: var(--muted);
    font-size: 16px;
  }

  /* ── Featured hero ──────────────────────────── */
  .featured {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr minmax(0, 660px);
    gap: clamp(24px, 4vw, 60px);
    align-items: center;
    margin-bottom: clamp(32px, 5vw, 60px);
    text-decoration: none;
    color: inherit;
  }
  .featured-text {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .eyebrow {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    color: var(--madder);
  }
  .featured-title {
    font-size: clamp(26px, 3vw, 36px);
    font-weight: 600;
    letter-spacing: -1px;
    line-height: 1.14;
    color: var(--ink);
  }
  .featured-excerpt {
    font-size: 16px;
    line-height: 1.6;
    color: var(--ink-2);
    max-width: 46ch;
  }
  .read {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .read--accent {
    color: var(--madder);
  }
  .featured-cover {
    aspect-ratio: 660 / 500;
    border-radius: 12px;
    overflow: hidden;
    background: var(--paper-2);
  }
  .featured-cover :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .featured:hover .featured-cover :global(img) {
    transform: scale(1.02);
  }

  /* ── Bento grid ─────────────────────────────── */
  .bento {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(12px, 1.5vw, 20px);
  }
  .card {
    position: relative;
    min-height: clamp(240px, 26vw, 360px);
    border-radius: 12px;
    overflow: hidden;
    background: var(--paper-2);
    text-decoration: none;
    display: block;
  }
  /* Mirrored asymmetric rhythm, repeats every 4 cards. */
  .card:nth-child(4n + 1) {
    grid-column: span 2;
  }
  .card:nth-child(4n + 2) {
    grid-column: span 1;
  }
  .card:nth-child(4n + 3) {
    grid-column: span 1;
  }
  .card:nth-child(4n + 4) {
    grid-column: span 2;
  }
  .card :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .card:hover :global(img) {
    transform: scale(1.03);
  }
  .scrim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      0deg,
      rgba(16, 15, 13, 0.94) 0%,
      rgba(16, 15, 13, 0.23) 50%,
      rgba(16, 15, 13, 0) 100%
    );
  }
  .caption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: clamp(18px, 2vw, 28px);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .card-title {
    font-size: clamp(18px, 1.7vw, 22px);
    font-weight: 600;
    letter-spacing: -0.3px;
    line-height: 1.2;
    color: var(--paper);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-meta {
    font-size: 13px;
    font-weight: 500;
    color: #fff;
  }

  /* ── Pagination ─────────────────────────────── */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: clamp(36px, 5vw, 52px) 0 clamp(8px, 1vw, 16px);
  }
  .pg {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: transparent;
    color: var(--ink);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }
  .pg:hover:not(:disabled):not(.active) {
    border-color: var(--ink);
  }
  .pg.active {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }
  .pg--edge {
    border-color: transparent;
    color: var(--ink-2);
  }
  .pg:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* ── Petroglyph ─────────────────────────────── */
  .articles-petro-1 {
    top: 40px;
    right: -20px;
    width: clamp(120px, 12vw, 200px);
    transform: rotate(-6deg);
  }

  /* ── Reveal ─────────────────────────────────── */
  .page :global([data-reveal='pending']) {
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.45s ease,
      transform 0.45s ease;
  }
  .page :global([data-reveal='done']) {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.45s ease,
      transform 0.45s ease;
  }

  /* ── Responsive ─────────────────────────────── */
  @media (max-width: 900px) {
    .featured {
      grid-template-columns: 1fr;
    }
    .featured-cover {
      order: -1;
      aspect-ratio: 16 / 9;
    }
    .bento {
      grid-template-columns: repeat(2, 1fr);
    }
    /* Even 2-col grid on tablet — reset the mirrored spans. */
    .card:nth-child(4n + 1),
    .card:nth-child(4n + 2),
    .card:nth-child(4n + 3),
    .card:nth-child(4n + 4) {
      grid-column: span 1;
    }
  }
  @media (max-width: 600px) {
    .bento {
      grid-template-columns: 1fr;
    }
    .card {
      min-height: 210px;
    }
  }
</style>
