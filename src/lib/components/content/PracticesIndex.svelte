<script lang="ts">
  import { resolve } from '$app/paths';
  import { navigating } from '$app/state';
  import { m } from '$i18n';
  import type { Locale } from '$i18n';
  import type { PracticeSummary, PracticeCategory } from '$lib/types/datocms';
  import SeoHead from '$cms/SeoHead.svelte';
  import CmsImage from '$cms/CmsImage.svelte';
  import Pagination from '$components/ui/Pagination.svelte';
  import BentoSkeleton from '$components/ui/BentoSkeleton.svelte';
  import { reveal } from '$lib/actions/reveal';
  import FilterChips from '$components/ui/FilterChips.svelte';
  import { PRACTICE_CATEGORIES, categoryLabel } from '$lib/categories';
  import {
    PRACTICES_PAGE_SIZE,
    computeTotalPages,
    pageSlice,
    featuredFirst
  } from '$lib/pagination';

  interface Props {
    practices: PracticeSummary[]; // FULL list (all pages) — the client filter needs it
    page: number; // 1-based route page
    locale: Locale;
  }
  let { practices, page, locale }: Props = $props();

  // Category vocabulary + label live in $lib/categories (shared with the archive).

  const href = (slug: string) => resolve(`/${locale}/practices/${slug}/`);
  const pageHref = (n: number) =>
    n <= 1 ? resolve(`/${locale}/practices/`) : resolve(`/${locale}/practices/page/${n}/`);

  const ordered = $derived(featuredFirst(practices));

  // Only offer chips for categories that actually have at least one practice.
  // Keeps the canonical order; hides dead filters (and hides ALL chips until the
  // CMS category field is populated).
  const availableCategories = $derived(
    PRACTICE_CATEGORIES.filter((c) => ordered.some((p) => p.category === c))
  );

  // Client filter state (KD-1). 'all' → route pagination; a category → client pagination.
  let activeCategory = $state<'all' | PracticeCategory>('all');
  let clientPage = $state(1);

  // PR-003: filter is ephemeral (not URL-reflected). Reset it whenever the route page changes,
  // so a route-pagination navigation always lands in a clean unfiltered state.
  $effect(() => {
    if (page >= 1) {
      activeCategory = 'all';
      clientPage = 1;
    }
  });

  function selectCategory(c: 'all' | PracticeCategory) {
    if (c === activeCategory) return;
    activeCategory = c;
    clientPage = 1;
  }

  const filtered = $derived(
    activeCategory === 'all' ? ordered : ordered.filter((p) => p.category === activeCategory)
  );
  const isFiltered = $derived(activeCategory !== 'all');
  const totalPages = $derived(computeTotalPages(filtered.length, PRACTICES_PAGE_SIZE));
  const currentPage = $derived(isFiltered ? Math.min(clientPage, totalPages) : page);
  const cards = $derived(pageSlice(filtered, currentPage, PRACTICES_PAGE_SIZE));

  // Skeleton only while navigating to a practices INDEX route (not a [slug] detail — PR-002).
  const isNavigating = $derived.by(() => {
    const id = navigating.to?.route?.id;
    if (!id) return false;
    return id.endsWith('/practices') || id.includes('/practices/page/');
  });
</script>

<SeoHead title={m.practices_meta_title()} description={m.practices_meta_description()} {locale} />

<div class="page">
  <header class="masthead">
    <h1 class="page-title">{m.practices_title()}</h1>
    <p class="lede">{m.practices_lede()}</p>

    <FilterChips
      options={availableCategories.map((c) => ({ value: c, label: categoryLabel(c) ?? c }))}
      active={activeCategory}
      allLabel={m.practices_filter_all()}
      ariaLabel={m.practices_filter_aria()}
      onselect={(v) => selectCategory(v as 'all' | PracticeCategory)}
    />
  </header>

  {#if practices.length === 0}
    <div class="empty"><p>{m.practices_empty()}</p></div>
  {:else if isNavigating}
    <BentoSkeleton variant="practices" />
  {:else if cards.length === 0}
    <!-- practices exist, but none in the active category -->
    <div class="empty"><p>{m.practices_filter_empty()}</p></div>
  {:else}
    <div class="bento" aria-label={m.practices_list_aria()}>
      {#each cards as practice, i (practice.id)}
        {@const label = practice.category ? categoryLabel(practice.category) : null}
        <a class="card" href={href(practice.slug)} use:reveal={i * 40}>
          {#if practice.coverImage}
            <CmsImage image={practice.coverImage} sizes="(min-width: 900px) 50vw, 100vw" />
          {/if}
          <span class="tint" aria-hidden="true"></span>
          <div class="caption">
            <h2 class="card-title">{practice.title}</h2>
            {#if label}
              <span class="badge">{label}</span>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    {#if isFiltered}
      <Pagination
        page={currentPage}
        {totalPages}
        ariaLabel={m.practices_navigation_aria()}
        mode="button"
        onnavigate={(n) => (clientPage = n)}
      />
    {:else}
      <Pagination
        page={currentPage}
        {totalPages}
        ariaLabel={m.practices_navigation_aria()}
        mode="link"
        hrefFor={pageHref}
      />
    {/if}
  {/if}
</div>

<style>
  .page {
    position: relative;
    max-width: var(--content-w);
    margin: 0 auto;
    padding: clamp(24px, 3vw, 48px) var(--gutter) clamp(64px, 8vw, 120px);
  }

  /* ── Masthead ─────────────────────────────── */
  .masthead {
    margin-bottom: clamp(28px, 4vw, 48px);
  }
  .page-title {
    font-weight: 600;
    font-size: clamp(30px, 4vw, 42px);
    letter-spacing: -1px;
    line-height: 1;
    color: var(--ink);
  }
  .lede {
    margin-top: 18px;
    max-width: 60ch;
    font-size: clamp(14px, 1.4vw, 16px);
    line-height: 1.6;
    color: var(--ink-2);
  }

  .empty {
    padding: 120px 0;
    color: var(--muted);
    font-size: 16px;
  }

  /* ── Bento ────────────────────────────────── */
  .bento {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 150px;
    gap: clamp(12px, 1.5vw, 24px);
  }
  /* Slot rhythm mirrors the mockup: big / stacked pair / narrow / wide / full panorama. */
  .card:nth-child(6n + 1) {
    grid-column: span 2;
    grid-row: span 2;
  }
  .card:nth-child(6n + 2) {
    grid-row: span 1;
  }
  .card:nth-child(6n + 3) {
    grid-row: span 1;
  }
  .card:nth-child(6n + 4) {
    grid-column: span 1;
    grid-row: span 2;
  }
  .card:nth-child(6n + 5) {
    grid-column: span 2;
    grid-row: span 2;
  }
  .card:nth-child(6n + 6) {
    grid-column: span 3;
    grid-row: span 2;
  }

  .card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: var(--paper-2);
    text-decoration: none;
    display: block;
    min-height: 0;
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
  /* Light SOLID darkening filter (~12%, no gradient) — per final design direction. */
  .tint {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: rgba(13, 11, 9, 0.12);
  }
  .caption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: clamp(16px, 1.6vw, 28px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px; /* title first, badge below */
  }
  .card-title {
    font-size: clamp(22px, 2vw, 30px);
    font-weight: 600;
    letter-spacing: -0.5px;
    line-height: 1.05;
    color: #fff;
  }
  .card:nth-child(6n + 1) .card-title,
  .card:nth-child(6n + 6) .card-title {
    font-size: clamp(28px, 2.6vw, 40px);
  }
  /* Frost badge — translucent white pill, blur, NO border. Below the title. */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    line-height: 1;
  }

  /* ── Reveal ───────────────────────────────── */
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

  /* ── Mobile: single column, EQUAL-size cards ─ */
  @media (max-width: 600px) {
    .bento {
      grid-template-columns: 1fr;
      grid-auto-rows: 220px;
      gap: 16px;
    }
    .card:nth-child(6n + 1),
    .card:nth-child(6n + 2),
    .card:nth-child(6n + 3),
    .card:nth-child(6n + 4),
    .card:nth-child(6n + 5),
    .card:nth-child(6n + 6) {
      grid-column: span 1;
      grid-row: span 1;
    }
    .card-title,
    .card:nth-child(6n + 1) .card-title,
    .card:nth-child(6n + 6) .card-title {
      font-size: 23px;
    }
  }
</style>
