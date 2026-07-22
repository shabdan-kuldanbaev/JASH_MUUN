<script lang="ts">
  import { resolve, asset } from '$app/paths';
  import { m } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import type { ArchiveItem } from '$lib/types/datocms';
  import { ARCHIVE_SCATTER } from '$lib/home/archiveScatter';
  import { rise, rv } from '$lib/actions/editorialReveal';
  import CmsImage from '$cms/CmsImage.svelte';

  let { archive, locale }: { archive: ArchiveItem[]; locale: Locale } = $props();

  const galleryHref = $derived(resolve(`/${locale}/gallery/`));

  // One image per scatter slot; render only slots that have an image.
  const cells = $derived(
    ARCHIVE_SCATTER.map((pos, i) => ({ pos, item: archive[i] })).filter((c) => c.item)
  );
</script>

<section class="archive" id="archive">
  <div class="wrap">
    <header class="shead">
      <div>
        <h2 data-rise use:rise><span class="rise-inner">{m.gallery_title()}</span></h2>
        <p class="shead-lede" data-rise use:rise>
          <span class="rise-inner">{m.gallery_description()}</span>
        </p>
      </div>
    </header>

    <div class="arch-scatter" class:is-empty={!cells.length}>
      <img
        class="petroglyph petro-arch-1"
        src={asset('/assets/petroglyphs/10.svg')}
        alt=""
        aria-hidden="true"
      />
      <img
        class="petroglyph petro-arch-2"
        src={asset('/assets/petroglyphs/5.svg')}
        alt=""
        aria-hidden="true"
      />
      {#each cells as cell (cell.item.key)}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- galleryHref is resolve()'d -->
        <a
          class="arch-cell"
          href={galleryHref}
          use:rv={'up'}
          style={`--l:${cell.pos.left}; --t:${cell.pos.top}; --w:${cell.pos.width}; --ar:${cell.pos.aspect}; --d:${cell.pos.delay}`}
        >
          <CmsImage
            image={{
              url: cell.item.imageUrl,
              alt: cell.item.imageAlt,
              width: cell.item.width,
              height: cell.item.height,
              blurUpThumb: cell.item.blurUpThumb
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
            class="arch-img"
          />
        </a>
      {/each}
    </div>

    <div class="arch-more" data-rise use:rise>
      <span class="rise-inner">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- galleryHref is resolve()'d -->
        <a href={galleryHref}>{m.home_archive_cta()}</a>
      </span>
    </div>
  </div>
</section>

<style>
  .archive {
    position: relative;
    padding: 0 0 var(--section-pad);
  }

  .wrap {
    position: relative;
    z-index: 1;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: 0 var(--gutter);
  }

  /* Section head (shared visual with practices) */
  .shead {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    gap: 20px;
    margin-bottom: clamp(32px, 4vw, 56px);
  }

  .shead h2 {
    display: block;
    font-family: Jost, sans-serif;
    font-weight: 600;
    font-size: clamp(30px, 3.4vw, 52px);
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1;
  }

  .shead-lede {
    display: block;
    max-width: 52ch;
    margin-top: 14px;
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--ink-2);
  }

  /* Free scatter (desktop) — absolute % positions from ARCHIVE_SCATTER */
  .arch-scatter {
    position: relative;
    width: 100%;
    height: clamp(1200px, 132vw, 2020px);
  }

  .arch-scatter.is-empty {
    height: 0;
  }

  .petro-arch-1 {
    top: 5.5%;
    left: 45%;
    width: clamp(88px, 9vw, 140px);
    opacity: 0.07;
    transform: rotate(5deg);
  }

  .petro-arch-2 {
    top: 82%;
    right: 3%;
    width: clamp(110px, 11vw, 180px);
    opacity: 0.06;
    transform: rotate(-9deg);
  }

  .arch-cell {
    position: absolute;
    left: var(--l);
    top: var(--t);
    width: var(--w);
    aspect-ratio: var(--ar); /* fixed box → CMS images can't overflow/overlap */
    display: block;
    overflow: hidden;
    background: var(--paper-2);
  }

  .arch-cell :global(.arch-img) {
    width: 100%;
    height: 100%;
    object-fit: cover; /* fill the fixed box, crop instead of stretch */
    display: block;
    filter: saturate(0.94);
    transition:
      transform 0.8s var(--ease),
      filter 0.4s ease;
  }

  .arch-cell:hover :global(.arch-img) {
    transform: scale(1.04);
    filter: saturate(1.05);
  }

  /* CTA */
  .arch-more {
    display: flex;
    justify-content: center;
    margin-top: clamp(48px, 7vw, 100px);
  }

  .arch-more a {
    position: relative;
    display: inline-block;
    font-family: Jost, sans-serif;
    font-weight: 500;
    font-size: clamp(22px, 2.4vw, 34px);
    letter-spacing: -0.01em;
    color: var(--ink);
    padding-bottom: 6px;
  }

  .arch-more a::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: var(--ink);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.45s var(--ease);
  }

  .arch-more a:hover::after,
  .arch-more a:focus-visible::after {
    transform: scaleX(1);
  }

  /* Tablet / mobile — flat two-column flow, no absolute scatter */
  @media (max-width: 1024px) {
    .arch-scatter {
      height: auto;
      display: flex;
      flex-wrap: wrap;
      gap: clamp(12px, 2vw, 20px);
    }

    .arch-cell {
      position: static;
      left: auto;
      top: auto;
      width: calc(50% - 10px);
      aspect-ratio: 4 / 3; /* uniform box → even two-column grid on mobile */
    }
  }

  @media (max-width: 640px) {
    .shead {
      grid-template-columns: 1fr;
    }

    .arch-cell {
      width: 100%;
    }
  }
</style>
