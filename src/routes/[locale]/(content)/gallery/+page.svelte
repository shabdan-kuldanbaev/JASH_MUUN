<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { m, LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import GalleryGrid from '$cms/GalleryGrid.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead
  title={m.gallery_meta_title()}
  description={m.gallery_meta_description()}
  locale={data.locale}
  alternateLocales={LOCALES.map((locale) => ({
    locale,
    url: resolve(`/${locale}/gallery/`)
  }))}
/>

<div class="page">
  <header class="page-header">
    <p class="page-sup">{m.gallery_kicker()}</p>
    <h1 class="page-title">{m.gallery_title()}</h1>
    <p class="page-desc">{m.gallery_description()}</p>
    <div class="page-rule" aria-hidden="true"></div>
  </header>

  {#if data.items.length === 0}
    <div class="empty-state">
      <p>{m.gallery_empty()}</p>
    </div>
  {:else}
    <GalleryGrid items={data.items} locale={data.locale} />
  {/if}
</div>

<style>
  .page {
    max-width: 1520px;
    margin: 0 auto;
    padding: clamp(48px, 6vw, 96px) var(--gutter) clamp(64px, 8vw, 128px);
  }

  .page-header {
    margin-bottom: clamp(40px, 5vw, 72px);
  }

  .page-sup {
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
  }

  .page-title {
    font-size: clamp(36px, 6vw, 80px);
    font-weight: 300;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
    margin-bottom: 20px;
  }

  .page-desc {
    font-size: 16px;
    line-height: 1.6;
    color: var(--muted);
    max-width: 56ch;
    margin-bottom: 32px;
  }

  .page-rule {
    width: 100%;
    height: 1px;
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  .empty-state {
    padding: 80px 0;
    font-size: 16px;
    color: var(--muted);
  }
</style>
