<script lang="ts">
  import { m } from '$i18n';
  import type { Locale } from '$i18n';
  import type { ArchiveItem, PracticeCategory } from '$lib/types/datocms';
  import { PRACTICE_CATEGORIES, categoryLabel } from '$lib/categories';
  import { datoImg } from '$lib/imgix';
  import SeoHead from '$cms/SeoHead.svelte';
  import CmsImage from '$cms/CmsImage.svelte';
  import FilterChips from '$components/ui/FilterChips.svelte';
  import { reveal } from '$lib/actions/reveal';

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
    openKey = null; // close the lightbox if a filter changes the set
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

  // ── Lightbox ─────────────────────────────────────────────────────────────
  // Keyed on the stable item.key (not an array position), so it stays correct
  // even if `filtered` changes while open.
  let openKey = $state<string | null>(null);
  const openItem = $derived(
    openKey === null ? null : (filtered.find((i) => i.key === openKey) ?? null)
  );
  const isOpen = $derived(openItem !== null);

  let dialogEl = $state<HTMLElement>();
  let closeBtn = $state<HTMLButtonElement>();
  let lastTrigger: HTMLElement | null = null;

  function openFrame(item: ArchiveItem, trigger: HTMLElement) {
    lastTrigger = trigger;
    openKey = item.key;
  }

  function step(delta: number) {
    if (openKey === null || filtered.length === 0) return;
    const i = filtered.findIndex((it) => it.key === openKey);
    if (i === -1) {
      openKey = null;
      return;
    }
    openKey = filtered[(i + delta + filtered.length) % filtered.length].key;
  }

  function onKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') openKey = null;
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') trapTab(e);
  }

  // Keep Tab within the dialog's controls (WCAG 2.4.3 — focus must not fall to
  // the masonry buttons behind the modal overlay).
  function trapTab(e: KeyboardEvent) {
    if (!dialogEl) return;
    const f = Array.from(dialogEl.querySelectorAll<HTMLElement>('button'));
    if (f.length === 0) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Modal lifecycle: lock scroll (a body class that layers over the layout's
  // inline overflow), move focus into the dialog, restore focus to the trigger
  // on close. Keyed on `isOpen` (a boolean) so stepping between images — which
  // keeps isOpen true — does not re-fire and yank focus.
  $effect(() => {
    if (!isOpen) return;
    const trigger = lastTrigger;
    document.body.classList.add('archive-lightbox-open');
    closeBtn?.focus();
    return () => {
      document.body.classList.remove('archive-lightbox-open');
      trigger?.focus();
    };
  });

  // Large, crisp lightbox source (shared DatoCMS/Imgix builder).
  const large = (url: string) => datoImg(url, { w: 1600, fit: 'max' });
</script>

<svelte:window onkeydown={onKeydown} />

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
              aria-label={item.imageAlt}
              onclick={(e) => openFrame(item, e.currentTarget)}
              use:reveal={(ri % 6) * 40}
            >
              <CmsImage
                image={{
                  url: item.imageUrl,
                  alt: item.imageAlt,
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

{#if openItem}
  <div
    class="lightbox"
    role="dialog"
    aria-modal="true"
    aria-label={openItem.imageAlt}
    bind:this={dialogEl}
  >
    <button
      type="button"
      class="lb-zone lb-prev"
      aria-label={m.gallery_view_prev()}
      onclick={() => step(-1)}
    ></button>
    <button
      type="button"
      class="lb-zone lb-next"
      aria-label={m.gallery_view_next()}
      onclick={() => step(1)}
    ></button>
    <button
      type="button"
      class="lb-close"
      aria-label={m.gallery_view_close()}
      onclick={() => (openKey = null)}
      bind:this={closeBtn}
    >
      <img class="lb-img" src={large(openItem.imageUrl)} alt={openItem.imageAlt} />
    </button>
  </div>
{/if}

<style>
  .page {
    position: relative;
    max-width: var(--content-w);
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
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='30'%20height='30'%20viewBox='0%200%20100%20100'%3E%3Cpath%20fill='%231a1a1a'%20d='M30%2087.2H12.8V70H5v25h25zM87.2%2070v17.2H70V95h25V70zM95%2030V5H70v7.8h17.2V30zM5%2030h7.8V12.8H30V5H5z'/%3E%3C/svg%3E")
        15 15,
      zoom-in;
    transition:
      transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1),
      box-shadow 0.28s ease;
  }
  .frame :global(img) {
    width: 100%;
    height: auto;
    display: block;
    filter: saturate(0.96);
    transition: filter 0.3s ease;
  }
  .frame:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px -14px rgba(26, 26, 26, 0.45);
    z-index: 3;
  }
  .frame:hover :global(img) {
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

  /* ── Lightbox — opaque paper, big image, pixel cursors, no chrome ────── */
  /* Scroll lock: a body class that layers over the content layout's inline
     `overflow: auto` (hence !important — the layout owns the inline slot). */
  :global(body.archive-lightbox-open) {
    overflow: hidden !important;
  }
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(12px, 2vw, 28px);
    background: var(--paper);
  }
  .lb-zone {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 50%;
    z-index: 2;
    background: none;
    border: 0;
    padding: 0;
  }
  .lb-prev {
    left: 0;
    cursor:
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='80'%20viewBox='0%200%20100%20100'%3E%3Cpath%20fill='%231a1a1a'%20d='M32%2044v12h12V44zm12%2024h12V56H44zm24%200H56v12h12zM56%2044V32H44v12zm0-12h12V20H56z'/%3E%3C/svg%3E")
        40 40,
      w-resize;
  }
  .lb-next {
    right: 0;
    cursor:
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='80'%20height='80'%20viewBox='0%200%20100%20100'%3E%3Cpath%20fill='%231a1a1a'%20d='M56%2068V56H44v12zm-24%200v12h12V68zm12-24h12V32H44zm24%200H56v12h12zM44%2032V20H32v12z'/%3E%3C/svg%3E")
        40 40,
      e-resize;
  }
  .lb-close {
    position: relative;
    z-index: 3;
    display: block;
    padding: 0;
    border: 0;
    background: none;
    /* Pixel close.svg cursor — click the image to close. */
    cursor:
      url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='46'%20height='46'%20viewBox='0%200%20100%20100'%3E%3Cg%20fill='%231a1a1a'%3E%3Cpath%20d='M4.882%2025.05v-10h9.972v10zM14.882%2015.05v-10h9.972v10zM24.882%2025.05v-10h9.972v10zM34.882%2035.05v-10h9.972v10zM34.864%2075.05v-10h9.972v10zM24.854%2085.05v-10h9.972v10zM14.882%2095.05v-10h9.972v10zM44.882%2045.05v-10h9.972v10zM54.882%2035.05v-10h9.972v10zM64.854%2025.05v-10h9.972v10zM74.882%2015.05v-10h9.972v10zM14.882%2035.05v-10h9.972v10zM24.882%2045.05v-10h9.972v10zM54.882%2075.05v-10h9.972v10z'/%3E%3Cpath%20d='M54.854%2075.05v-10h9.972v10zM64.854%2065.05v-10h10v10zM44.882%2065.05v-10h9.972v10zM74.882%2075.05v-10h9.972v10zM84.882%2085.05v-10h9.972v10zM64.882%2085.05v-10h9.972v10zM74.882%2095.05v-10h9.972v10zM34.882%2055.05v-10h9.972v10zM24.854%2065.05v-10h9.972v10zM14.854%2075.05v-10h9.972v10zM4.854%2085.05v-10h9.972v10zM54.882%2055.05v-10h9.972v10zM64.882%2045.05v-10h9.972v10zM74.882%2035.05v-10h9.972v10zM84.882%2025.05v-10h9.972v10z'/%3E%3C/g%3E%3C/svg%3E")
        23 23,
      pointer;
  }
  .lb-img {
    display: block;
    max-width: 92vw;
    max-height: 86vh;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  .lb-zone:focus-visible,
  .lb-close:focus-visible {
    outline: 2px solid var(--shyrdak);
    outline-offset: -4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .frame {
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
