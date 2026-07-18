<script lang="ts">
  import type { PageData } from './$types';
  import { m } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import GalleryGrid from '$cms/GalleryGrid.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead
  title={m.gallery_meta_title()}
  description={m.gallery_meta_description()}
  locale={data.locale}
/>

<div class="page">
  <h1 class="page-title">{m.gallery_title()}</h1>

  {#if data.items.length === 0}
    <div class="empty">
      <p>{m.gallery_empty()}</p>
    </div>
  {:else}
    <GalleryGrid items={data.items} locale={data.locale} />
  {/if}
</div>

<style>
  .page {
    max-width: var(--content-w);
    margin: 0 auto;
    padding: clamp(24px, 3vw, 48px) var(--gutter) clamp(64px, 8vw, 120px);
  }

  .page-title {
    font-weight: 600;
    font-size: clamp(28px, 3vw, 40px);
    color: var(--ink);
    margin-bottom: clamp(24px, 3vw, 40px);
  }

  .empty {
    padding: 120px 0;
    color: var(--muted);
    font-size: 16px;
  }
</style>
