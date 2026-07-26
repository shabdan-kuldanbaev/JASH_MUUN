<script lang="ts">
  import { onMount } from 'svelte';
  import { m } from '$i18n';
  import type { Locale } from '$i18n';
  import type { ArchiveItem, PracticeCategory } from '$lib/types/datocms';
  import { PRACTICE_CATEGORIES, categoryLabel } from '$lib/categories';
  import { datoImg } from '$lib/imgix';
  import SeoHead from '$cms/SeoHead.svelte';
  import CmsImage from '$cms/CmsImage.svelte';
  import FilterChips from '$components/ui/FilterChips.svelte';
  import { reveal } from '$lib/actions/reveal';
  import PhotoSwipeLightbox from 'photoswipe/lightbox';
  import 'photoswipe/style.css';

  let { items, locale }: { items: ArchiveItem[]; locale: Locale } = $props();

  // Chips only for categories that actually have images (keeps canonical order);
  // article images (category null) surface only under "all".
  const available = $derived(
    PRACTICE_CATEGORIES.filter((c) => items.some((i) => i.category === c))
  );
  const chipOptions = $derived(available.map((c) => ({ value: c, label: categoryLabel(c) ?? c })));

  let activeCat = $state<'all' | PracticeCategory>('all');
  const filtered = $derived(
    activeCat === 'all' ? items : items.filter((i) => i.category === activeCat)
  );

  function selectCategory(value: string) {
    const next = value as 'all' | PracticeCategory;
    if (activeCat === next) return;
    activeCat = next;
  }

  // ── Staggered masonry ────────────────────────────────────────────────────
  // Explicit columns with per-column start OFFSET + varied per-photo gaps →
  // photos scatter at different heights (album feel) instead of a lined-up grid.
  // NOTE: renders the WHOLE collection at once by design ("show it all in one
  // wall"). No pagination/windowing; if the archive ever grows to many hundreds
  // of assets, add IntersectionObserver windowing over `filtered` here.
  const OFFSETS = [0, 74, 32, 100, 48, 16];
  const GAPS = [56, 72, 60, 84, 52, 68, 58, 80, 54, 66];

  let wallEl = $state<HTMLElement>();
  let colCount = $state(4); // SSR default; refined on mount from real width

  function computeCols() {
    const cw = wallEl?.clientWidth ?? 1200;
    let colW: number;
    let gap: number;
    if (cw >= 1000) {
      colW = 230;
      gap = 52;
    } else if (cw >= 640) {
      colW = 200;
      gap = 34;
    } else {
      colW = 148;
      gap = 20;
    }
    colCount = Math.max(1, Math.floor((cw + gap) / (colW + gap)));
  }

  $effect(() => {
    if (!wallEl) return;
    computeCols();
    const ro = new ResizeObserver(computeCols);
    ro.observe(wallEl);
    return () => ro.disconnect();
  });

  // Round-robin distribute the filtered items into colCount columns.
  const columns = $derived.by(() => {
    const cols: ArchiveItem[][] = Array.from({ length: colCount }, () => []);
    filtered.forEach((item, index) => cols[index % colCount].push(item));
    return cols;
  });

  // ── Lightbox (PhotoSwipe) ─────────────────────────────────────────────────
  // Touch-native gallery: pinch-zoom, swipe, and its own iOS-safe scroll lock.
  // Rendered at <body> level (z-index 100000), so it sits above the fixed header
  // and escapes the content-shell stacking context entirely — no CSS hacks.
  const LB_W = 1600; // imgix caps the long edge here (fit:max never upscales)

  function slide(it: ArchiveItem) {
    const ow = it.width || LB_W;
    const oh = it.height || Math.round(LB_W * 0.66);
    const w = Math.min(LB_W, ow);
    const h = Math.round(oh * (w / ow));
    return {
      src: datoImg(it.imageUrl, { w: LB_W, fit: 'max' }),
      width: w,
      height: h,
      alt: it.imageAlt,
      msrc: it.blurUpThumb || undefined // LQIP placeholder while the full frame loads
    };
  }

  let lightbox: PhotoSwipeLightbox | null = null;

  onMount(() => {
    lightbox = new PhotoSwipeLightbox({
      pswpModule: () => import('photoswipe'),
      mainClass: 'pswp--archive',
      bgOpacity: 1, // opaque paper backdrop
      showHideAnimationType: 'fade',
      arrowPrev: false, // no visible arrow buttons — navigation is the edge zones below
      arrowNext: false
    });
    // Invisible prev/next click zones on the left/right edges (chrome-free, like the
    // old lightbox). appendTo 'wrapper' → PhotoSwipe routes taps here but swipes/pinch
    // still reach the image. onClick fires on tap only, not on a drag.
    lightbox.on('uiRegister', () => {
      const pswp = lightbox?.pswp;
      if (!pswp?.ui) return;
      pswp.ui.registerElement({
        name: 'nav-prev',
        className: 'pswp__nav-zone pswp__nav-zone--prev',
        appendTo: 'wrapper',
        onClick: () => pswp.prev()
      });
      pswp.ui.registerElement({
        name: 'nav-next',
        className: 'pswp__nav-zone pswp__nav-zone--next',
        appendTo: 'wrapper',
        onClick: () => pswp.next()
      });
    });
    // Pause Lenis + lock the page via the shared body attribute (the smoothScroll
    // observer stops Lenis on it). PhotoSwipe covers the viewport, so the header
    // it forces visible underneath never shows.
    lightbox.on('beforeOpen', () => document.body.setAttribute('data-panel-open', ''));
    lightbox.on('destroy', () => document.body.removeAttribute('data-panel-open'));
    lightbox.init();
    return () => {
      lightbox?.destroy();
      lightbox = null;
    };
  });

  function openAt(item: ArchiveItem) {
    if (!lightbox) return;
    const index = filtered.findIndex((i) => i.key === item.key);
    if (index === -1) return;
    // Slide set = the currently filtered images, so prev/next stays in scope.
    lightbox.options.dataSource = filtered.map(slide);
    lightbox.loadAndOpen(index);
  }
</script>

<SeoHead title={m.gallery_meta_title()} description={m.gallery_meta_description()} {locale} />

<div class="page">
  <header class="masthead">
    <h1 class="page-title">{m.gallery_title()}</h1>
    <p class="lede">{m.gallery_description()}</p>

    {#if available.length}
      <FilterChips
        options={chipOptions}
        active={activeCat}
        allLabel={m.practices_filter_all()}
        ariaLabel={m.practices_filter_aria()}
        onselect={selectCategory}
      />
    {/if}
  </header>

  {#if items.length === 0}
    <div class="empty"><p>{m.gallery_empty()}</p></div>
  {:else}
    <div class="wall" bind:this={wallEl}>
      {#each columns as col, ci (ci)}
        <div class="col" style="margin-top:{OFFSETS[ci % OFFSETS.length]}px">
          {#each col as item, ri (item.key)}
            <button
              type="button"
              class="frame"
              style="--gap:{GAPS[(ci * 7 + ri) % GAPS.length]}px"
              aria-label={item.imageAlt || categoryLabel(item.category) || m.gallery_title()}
              onclick={() => openAt(item)}
              use:reveal={(ri % 6) * 40}
            >
              <CmsImage
                image={{
                  url: item.imageUrl,
                  alt: item.imageAlt || categoryLabel(item.category) || m.gallery_title(),
                  width: item.width,
                  height: item.height,
                  blurUpThumb: item.blurUpThumb
                }}
                sizes="(min-width: 1000px) 230px, (min-width: 640px) 200px, 45vw"
              />
            </button>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Same box as the header .nav-inner and footer .footer-inner
     (--home-w + --gutter) so the wall lines up with the site chrome. */
  .page {
    position: relative;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: clamp(24px, 3vw, 48px) var(--gutter) clamp(64px, 8vw, 120px);
  }

  /* ── Masthead (matches the practices/articles index) ─────────────────── */
  .masthead {
    margin-bottom: clamp(28px, 4vw, 52px);
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

  /* ── Wall — airy "photo-album" masonry (staggered offset columns) ────── */
  .wall {
    display: flex;
    align-items: flex-start;
    gap: clamp(20px, 3.4vw, 52px);
  }
  .col {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .frame {
    position: relative;
    display: block;
    width: 100%;
    margin: 0 0 var(--gap, 40px);
    padding: 0;
    border: 0;
    font: inherit;
    color: inherit;
    background: var(--paper-2);
    /* Pixel target.svg cursor — hover a photo to enlarge. */
    cursor:
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='45'%20height='45'%20viewBox='0%200%20100%20100'%3E%3Cpath%20fill='%23ffffff'%20d='M30%2087.2H12.8V70H5v25h25zM87.2%2070v17.2H70V95h25V70zM95%2030V5H70v7.8h17.2V30zM5%2030h7.8V12.8H30V5H5z'/%3E%3C/svg%3E")
        22 22,
      zoom-in;
  }
  /* Hover treatment lives on the IMG, not the .frame — the frame carries the
     reveal action's `[data-reveal='done'] { transform }`, which has equal
     specificity and wins by source order, so a transform here never applies. */
  .frame :global(img) {
    width: 100%;
    height: auto;
    display: block;
    filter: saturate(0.96);
    transition:
      transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1),
      box-shadow 0.28s ease,
      filter 0.3s ease;
  }
  .frame:hover {
    z-index: 3;
  }
  .frame:hover :global(img) {
    transform: scale(1.1);
    box-shadow: 0 18px 42px -16px rgba(26, 26, 26, 0.45);
    filter: saturate(1.06);
  }
  .frame:focus-visible {
    outline: 2px solid var(--shyrdak);
    outline-offset: 2px;
  }

  /* ── Reveal (component-scoped, matches the index pages) ──────────────── */
  .page :global([data-reveal='pending']) {
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.5s ease,
      transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .page :global([data-reveal='done']) {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.5s ease,
      transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  /* ── PhotoSwipe (archive lightbox) — paper backdrop, ink icons ───────── */
  :global(.pswp--archive) {
    --pswp-bg: var(--paper);
    --pswp-icon-color: var(--ink);
    --pswp-icon-color-secondary: var(--paper);
  }
  /* Flat icons on the light backdrop — drop the dark outline meant for photos. */
  :global(.pswp--archive .pswp__icn-shadow) {
    display: none;
  }
  /* Quiet museum chrome — no slide counter, no default arrow buttons. */
  :global(.pswp--archive .pswp__counter),
  :global(.pswp--archive .pswp__button--arrow--prev),
  :global(.pswp--archive .pswp__button--arrow--next) {
    display: none;
  }

  /* Invisible edge navigation zones — click the sides to page prev/next. The
     pixel arrow cursor is the only hint (matches the archive's pixel cursors). */
  :global(.pswp--archive .pswp__nav-zone) {
    position: absolute;
    top: 0;
    bottom: 0;
    width: clamp(60px, 22%, 320px);
    background: none;
    border: 0;
  }
  :global(.pswp--archive .pswp__nav-zone--prev) {
    left: 0;
    cursor:
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='60'%20viewBox='0%200%20100%20100'%3E%3Cpath%20fill='%231a1a1a'%20d='M32%2044v12h12V44zm12%2024h12V56H44zm24%200H56v12h12zM56%2044V32H44v12zm0-12h12V20H56z'/%3E%3C/svg%3E")
        30 30,
      w-resize;
  }
  :global(.pswp--archive .pswp__nav-zone--next) {
    right: 0;
    cursor:
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='60'%20height='60'%20viewBox='0%200%20100%20100'%3E%3Cpath%20fill='%231a1a1a'%20d='M56%2068V56H44v12zm-24%200v12h12V68zm12-24h12V32H44zm24%200H56v12h12zM44%2032V20H32v12z'/%3E%3C/svg%3E")
        30 30,
      e-resize;
  }

  @media (prefers-reduced-motion: reduce) {
    .frame :global(img) {
      transition: none;
    }
    .page :global([data-reveal='pending']),
    .page :global([data-reveal='done']) {
      transition: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
