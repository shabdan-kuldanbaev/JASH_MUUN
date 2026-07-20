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
  let lastTrigger: HTMLElement | null = null;

  // Closing plays an outro (backdrop fades, photo eases down + blurs — the mirror
  // of the open "develop") before the dialog unmounts. `closing` gates that window.
  let closing = $state(false);
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const CLOSE_MS = 520;

  function openFrame(item: ArchiveItem, trigger: HTMLElement) {
    clearTimeout(closeTimer); // abort a pending outro if reopened mid-close
    closing = false;
    lastTrigger = trigger;
    openKey = item.key;
    cursorVisible = false; // reveal on first pointer move, at the real position
  }

  function requestClose() {
    if (openKey === null || closing) return;
    cursorVisible = false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      openKey = null; // no outro under reduced motion
      return;
    }
    closing = true;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      openKey = null;
      closing = false;
    }, CLOSE_MS);
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
    if (!isOpen || closing) return;
    if (e.key === 'Escape') requestClose();
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
  // on close. Focus lands on the dialog container (not the image/close button)
  // so no focus ring is drawn around the photo on open. Keyed on `isOpen` (a
  // boolean) so stepping between images — which keeps isOpen true — does not
  // re-fire and yank focus.
  $effect(() => {
    if (!isOpen) return;
    const trigger = lastTrigger;
    document.body.classList.add('archive-lightbox-open');
    dialogEl?.focus();
    return () => {
      document.body.classList.remove('archive-lightbox-open');
      trigger?.focus();
    };
  });

  // Large, crisp lightbox source (shared DatoCMS/Imgix builder).
  const large = (url: string) => datoImg(url, { w: 1600, fit: 'max' });

  // URLs whose full-size source has finished decoding — the "warm" set. A
  // stepped-to image that is already warm renders at full opacity in the same
  // frame (instant swap); one that isn't gets the soft develop fade below.
  const warm = new Set<string>();

  // Prefetch the neighbours (±1, ±2 in both directions) so stepping is instant —
  // each finished decode joins `warm`. Re-runs on every openKey change, keeping
  // the two photos on each side of the current one primed as you page through.
  $effect(() => {
    if (openKey === null || filtered.length < 2) return;
    const i = filtered.findIndex((it) => it.key === openKey);
    if (i === -1) return;
    const n = filtered.length;
    for (const delta of [1, -1, 2, -2]) {
      const src = large(filtered[(i + delta + n) % n].imageUrl);
      if (warm.has(src)) continue;
      const img = new Image();
      img.onload = () => warm.add(src);
      img.src = src;
      if (img.complete) warm.add(src);
    }
  });

  // ── Load state of the CURRENTLY shown photo ──────────────────────────────
  // `imgReady` drives the develop fade. It flips true synchronously for a warm
  // photo (fast click that beat the preload still lands soft, not blank), and
  // via onload otherwise. Element persists across steps, so a warm step never
  // leaves the ready state → no fade, instant swap.
  let imgEl = $state<HTMLImageElement>();
  let imgReady = $state(false);

  $effect(() => {
    void openKey; // re-evaluate on every open / step
    const el = imgEl;
    if (openKey === null || !el) return;
    const src = large(openItem!.imageUrl);
    imgReady = warm.has(src) || (el.complete && el.naturalWidth > 0);
  });

  function onImgLoad() {
    if (openItem) warm.add(large(openItem.imageUrl));
    imgReady = true;
  }

  // ── Cursor (over the open image) ─────────────────────────────────────────
  // A pixel glyph that follows the pointer — white × over the image, ink
  // prev/next arrows on the paper margins. `cursorMode` picks the glyph.
  let cursorX = $state(-100);
  let cursorY = $state(-100);
  let cursorVisible = $state(false);
  let cursorMode = $state<'close' | 'prev' | 'next'>('close');

  function onPointerMove(e: PointerEvent) {
    if (e.pointerType === 'touch') return; // no hover cursor on touch
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursorVisible = true;
    const r = imgEl?.getBoundingClientRect();
    const overImage =
      !!r &&
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    cursorMode = overImage ? 'close' : e.clientX < window.innerWidth / 2 ? 'prev' : 'next';
  }

  function onPointerLeave() {
    cursorVisible = false;
  }
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
    class:is-closing={closing}
    role="dialog"
    aria-modal="true"
    aria-label={openItem.imageAlt}
    tabindex="-1"
    bind:this={dialogEl}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
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
    {#if !imgReady}
      <span class="lb-loading" aria-hidden="true"></span>
    {/if}
    <button
      type="button"
      class="lb-close"
      aria-label={m.gallery_view_close()}
      onclick={requestClose}
    >
      <img
        class="lb-img"
        class:is-ready={imgReady}
        src={large(openItem.imageUrl)}
        alt={openItem.imageAlt}
        width={openItem.width}
        height={openItem.height}
        bind:this={imgEl}
        onload={onImgLoad}
      />
    </button>

    <!-- Cursor glyph — white × over the image, black arrows on the paper margins -->
    <div
      class="lb-cursor"
      class:is-visible={cursorVisible}
      class:is-nav={cursorMode !== 'close'}
      style="left:{cursorX}px; top:{cursorY}px"
      aria-hidden="true"
    >
      {#if cursorMode === 'close'}
        <svg width="46" height="46" viewBox="0 0 100 100">
          <g fill="currentColor">
            <path
              d="M4.882 25.05v-10h9.972v10zM14.882 15.05v-10h9.972v10zM24.882 25.05v-10h9.972v10zM34.882 35.05v-10h9.972v10zM34.864 75.05v-10h9.972v10zM24.854 85.05v-10h9.972v10zM14.882 95.05v-10h9.972v10zM44.882 45.05v-10h9.972v10zM54.882 35.05v-10h9.972v10zM64.854 25.05v-10h9.972v10zM74.882 15.05v-10h9.972v10zM14.882 35.05v-10h9.972v10zM24.882 45.05v-10h9.972v10zM54.882 75.05v-10h9.972v10z"
            />
            <path
              d="M54.854 75.05v-10h9.972v10zM64.854 65.05v-10h10v10zM44.882 65.05v-10h9.972v10zM74.882 75.05v-10h9.972v10zM84.882 85.05v-10h9.972v10zM64.882 85.05v-10h9.972v10zM74.882 95.05v-10h9.972v10zM34.882 55.05v-10h9.972v10zM24.854 65.05v-10h9.972v10zM14.854 75.05v-10h9.972v10zM4.854 85.05v-10h9.972v10zM54.882 55.05v-10h9.972v10zM64.882 45.05v-10h9.972v10zM74.882 35.05v-10h9.972v10zM84.882 25.05v-10h9.972v10z"
            />
          </g>
        </svg>
      {:else if cursorMode === 'prev'}
        <svg width="80" height="80" viewBox="0 0 100 100">
          <path
            fill="currentColor"
            d="M32 44v12h12V44zm12 24h12V56H44zm24 0H56v12h12zM56 44V32H44v12zm0-12h12V20H56z"
          />
        </svg>
      {:else}
        <svg width="80" height="80" viewBox="0 0 100 100">
          <path
            fill="currentColor"
            d="M56 68V56H44v12zm-24 0v12h12V68zm12-24h12V32H44zm24 0H56v12h12zM44 32V20H32v12z"
          />
        </svg>
      {/if}
    </div>
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
    /* Entry only: the dialog mounts fresh per open, so the paper fades in once.
       Stepping keeps it mounted (src swaps), so this never replays. */
    animation: lb-backdrop 0.32s ease both;
    /* Native cursor is hidden — the white .lb-cursor glyph replaces it. */
    cursor: none;
  }
  /* Outro — mirror of the open develop: paper fades while the photo eases down a
     touch and softens back into blur, then the dialog unmounts (JS, CLOSE_MS).
     Same soft curve + reversed end-state as the open fade, so in and out read as
     one gentle motion. Keep the 0.52s here in sync with CLOSE_MS. */
  .lightbox.is-closing {
    animation: lb-close 0.52s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
    pointer-events: none;
  }
  .lightbox.is-closing .lb-img {
    transition:
      transform 0.52s cubic-bezier(0.2, 0.7, 0.2, 1),
      filter 0.52s ease;
    transform: scale(0.965);
    filter: saturate(0.55) brightness(1.05) blur(7px);
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
    cursor: none;
  }
  .lb-next {
    right: 0;
    cursor: none;
  }
  .lb-close {
    position: relative;
    z-index: 3;
    display: block;
    padding: 0;
    border: 0;
    background: none;
    cursor: none;
  }

  /* White cursor glyph following the pointer; painted last (top z),
     `pointer-events: none` keeps clicks flowing to the zones. */
  .lb-cursor {
    position: fixed;
    z-index: 10;
    transform: translate(-50%, -50%);
    line-height: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s ease;
    color: #fff;
  }
  .lb-cursor.is-visible {
    opacity: 1;
  }
  /* prev/next arrows sit on the light paper margins → keep them ink-black. */
  .lb-cursor.is-nav {
    color: var(--ink);
  }
  .lb-cursor svg {
    display: block;
  }
  .lb-img {
    display: block;
    max-width: 92vw;
    max-height: 86vh;
    width: auto;
    height: auto;
    object-fit: contain;
    /* Loading → ready: the photo resolves out of a soft, desaturated blur into
       focus (a quiet "develop" fade). A warm image flips straight to .is-ready
       in the same frame → no transition start → instant swap when stepping. */
    opacity: 0;
    transform: scale(0.965);
    filter: saturate(0.55) brightness(1.05) blur(7px);
    transition:
      opacity 0.55s ease,
      transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1),
      filter 0.55s ease;
  }
  .lb-img.is-ready {
    opacity: 1;
    transform: none;
    filter: none;
  }

  /* Soft loading cue for a cold image (fast-click that outran the preload) — a
     low-contrast paper glow breathing in place, no hard skeleton bar. */
  .lb-loading {
    position: fixed;
    inset: 0;
    z-index: 1;
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .lb-loading::after {
    content: '';
    width: clamp(120px, 20vw, 260px);
    aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(26, 26, 26, 0.11), rgba(26, 26, 26, 0) 68%);
    animation: lb-breathe 1.7s ease-in-out infinite;
  }

  @keyframes lb-backdrop {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes lb-close {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  @keyframes lb-breathe {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.9);
    }
    50% {
      opacity: 0.75;
      transform: scale(1.06);
    }
  }
  /* The dialog receives focus on open (for keyboard/scroll trapping) but must
     not paint a ring around the photo. */
  .lightbox:focus,
  .lightbox:focus-visible,
  .lb-close:focus-visible {
    outline: none;
  }
  .lb-zone:focus-visible {
    outline: 2px solid var(--shyrdak);
    outline-offset: -4px;
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
    .lightbox {
      animation: none;
    }
    .lb-img {
      transition: none;
      transform: none;
      filter: none;
    }
    .lb-loading::after {
      animation: none;
    }
  }
</style>
