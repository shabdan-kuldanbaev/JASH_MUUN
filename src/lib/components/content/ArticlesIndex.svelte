<script lang="ts">
  import { resolve, asset } from '$app/paths';
  import { navigating } from '$app/state';
  import { m } from '$i18n';
  import type { Locale } from '$i18n';
  import type { ArticleSummary } from '$lib/types/datocms';
  import SeoHead from '$cms/SeoHead.svelte';
  import CmsImage from '$cms/CmsImage.svelte';
  import Pagination from '$components/ui/Pagination.svelte';
  import BentoSkeleton from '$components/ui/BentoSkeleton.svelte';
  import { reveal } from '$lib/actions/reveal';
  import { ARTICLES_PAGE_SIZE, computeTotalPages, pageSlice, featuredFirst } from '$lib/pagination';

  interface Props {
    articles: ArticleSummary[]; // FULL list
    page: number;
    locale: Locale;
  }
  let { articles, page, locale }: Props = $props();

  const href = (slug: string) => resolve(`/${locale}/articles/${slug}/`);
  const pageHref = (n: number) =>
    n <= 1 ? resolve(`/${locale}/articles/`) : resolve(`/${locale}/articles/page/${n}/`);

  function formatDate(iso?: string | null): string {
    if (!iso) return '';
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    try {
      return new Date(iso).toLocaleDateString(locale, opts);
    } catch {
      return new Date(iso).toLocaleDateString('ru', opts);
    }
  }

  // The CMS-flagged article floats to the front and becomes the lead card of page 1;
  // it is no longer carved out of pagination, so the grid rows stay full.
  const ordered = $derived(featuredFirst(articles));
  const totalPages = $derived(computeTotalPages(ordered.length, ARTICLES_PAGE_SIZE));
  const cards = $derived(pageSlice(ordered, page, ARTICLES_PAGE_SIZE));

  // Skeleton only while navigating to an articles INDEX route (not a [slug] detail — PR-002).
  const isNavigating = $derived.by(() => {
    const id = navigating.to?.route?.id;
    if (!id) return false;
    return id.endsWith('/articles') || id.includes('/articles/page/');
  });
</script>

<SeoHead title={m.articles_meta_title()} description={m.articles_meta_description()} {locale} />

<div class="page">
  <img
    src={asset('/assets/petroglyphs/6.svg')}
    aria-hidden="true"
    class="petroglyph articles-petro-1"
    alt=""
  />

  <header class="masthead">
    <h1 class="page-title">{m.articles_title()}</h1>
    <p class="lede">{m.articles_meta_description()}</p>
  </header>

  {#if articles.length === 0}
    <div class="empty">
      <p>{m.articles_empty()}</p>
    </div>
  {:else if isNavigating}
    <BentoSkeleton variant="articles" />
  {:else}
    <ul class="cards" aria-label={m.articles_list_aria()}>
      {#each cards as article, i (article.id)}
        {@const lead = i === 0}
        <li>
          <a class="card" class:card--lead={lead} href={href(article.slug)} use:reveal={i * 60}>
            {#if article.coverImage}
              <div class="card-media">
                <CmsImage
                  image={article.coverImage}
                  alt={article.title}
                  eager={lead}
                  sizes={lead
                    ? '(min-width: 1280px) 50vw, 100vw'
                    : '(min-width: 1280px) 25vw, (min-width: 620px) 50vw, 100vw'}
                />
              </div>
            {/if}
            {#if article.publishedDate}
              <span class="card-date">{formatDate(article.publishedDate)}</span>
            {/if}
            <h2 class="card-title">{article.title}</h2>
            <!-- The lead runs on its headline alone; the excerpt would crowd the wide slot. -->
            {#if !lead && article.excerpt}
              <p class="card-excerpt">{article.excerpt}</p>
            {/if}
          </a>
        </li>
      {/each}
    </ul>

    <Pagination
      {page}
      {totalPages}
      ariaLabel={m.articles_navigation_aria()}
      mode="link"
      hrefFor={pageHref}
    />
  {/if}
</div>

<style>
  /* Same box as the header .nav-inner and footer .footer-inner
     (--home-w + --gutter) so the index lines up with the site chrome. */
  .page {
    position: relative;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: clamp(20px, 2.5vw, 40px) var(--gutter) clamp(48px, 6vw, 80px);
  }

  /* ── Masthead ───────────────────────────────── */
  .masthead {
    position: relative;
    z-index: 1;
    margin-bottom: clamp(36px, 5vw, 72px);
  }
  .page-title {
    font-weight: 400;
    font-size: clamp(32px, 3.4vw, 54px);
    letter-spacing: -0.025em;
    line-height: 1.02;
    color: var(--ink);
  }
  .lede {
    max-width: 46ch;
    margin-top: clamp(18px, 2vw, 28px);
    font-size: clamp(15px, 1.4vw, 18px);
    font-weight: 300;
    line-height: 1.65;
    color: var(--ink-2);
  }

  .empty {
    padding: 120px 0;
    color: var(--muted);
    font-size: 16px;
  }

  /* ── Cards ──────────────────────────────────── */
  /* Four columns, lead spans two. No frames, rules or dividers — the cards are
     held by whitespace alone. Grid items are the <li>, so the span lives there. */
  .cards {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(44px, 4.5vw, 76px) clamp(20px, 2.4vw, 40px);
    list-style: none;
  }
  .cards > li {
    display: flex;
  }
  .cards > li:first-child {
    grid-column: span 2;
  }

  .card {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-decoration: none;
    color: inherit;
  }
  .card-media {
    overflow: hidden;
    background: var(--paper-2);
  }
  .card-media :global(img) {
    width: 100%;
    aspect-ratio: 3 / 2;
    object-fit: cover;
    display: block;
    transition: transform 1.1s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .card:hover .card-media :global(img) {
    transform: scale(1.025);
  }
  .card--lead .card-media :global(img) {
    aspect-ratio: 16 / 9;
  }

  .card-date {
    display: block;
    margin-top: clamp(14px, 1.5vw, 20px);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .card-title {
    margin-top: clamp(10px, 1vw, 14px);
    font-weight: 400;
    font-size: clamp(17px, 1.3vw, 21px);
    line-height: 1.3;
    letter-spacing: -0.008em;
    color: var(--ink);
    text-wrap: pretty;
  }
  .card:hover .card-title {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
    text-decoration-color: var(--line);
  }
  .card--lead .card-title {
    max-width: 30ch;
    font-size: clamp(22px, 1.9vw, 30px);
    line-height: 1.24;
    letter-spacing: -0.015em;
  }
  .card-excerpt {
    margin-top: clamp(10px, 1.1vw, 15px);
    font-size: 13.5px;
    font-weight: 300;
    line-height: 1.7;
    color: var(--ink-2);
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

  /* ── Responsive: 4 → 3 → 2 → 1 ──────────────── */
  @media (max-width: 1280px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 900px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
      gap: clamp(40px, 5vw, 64px) clamp(24px, 3vw, 44px);
    }
  }
  @media (max-width: 620px) {
    .cards {
      grid-template-columns: 1fr;
      gap: clamp(36px, 7vw, 56px);
    }
    .cards > li:first-child {
      grid-column: auto;
    }
    .card--lead .card-title {
      max-width: none;
    }
  }
</style>
