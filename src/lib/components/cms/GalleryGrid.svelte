<script lang="ts">
  import { base } from '$app/paths';
  import type { GalleryItem } from '$lib/types/datocms';
  import CmsImage from './CmsImage.svelte';

  let {
    items,
    locale,
  }: {
    items: GalleryItem[];
    locale: string;
  } = $props();
</script>

{#if items.length === 0}
  <p class="empty">No images in the archive yet.</p>
{:else}
  <div class="grid">
    {#each items as item (item.imageUrl)}
      <figure class="grid-item">
        <a href={`${base}/${locale}/practices/${item.postSlug}/`} class="grid-link" aria-label={item.postTitle}>
          <CmsImage
            image={{
              url: item.imageUrl,
              alt: item.imageAlt,
              width: 800,
              height: 600,
              blurUpThumb: null,
            }}
            sizes="(min-width: 1200px) 400px, (min-width: 768px) 33vw, 50vw"
          />
        </a>
        <figcaption class="grid-caption">
          <span class="caption-title">{item.postTitle}</span>
        </figcaption>
      </figure>
    {/each}
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2px;
  }

  .grid-item { margin: 0; overflow: hidden; }

  .grid-link { display: block; }
  .grid-link :global(img) {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
    transition: transform .5s ease;
  }
  .grid-link:hover :global(img) { transform: scale(1.04); }

  .grid-caption {
    padding: 12px 0 20px;
  }

  .caption-title {
    font-size: 13px;
    line-height: 1.4;
    color: var(--ink);
    display: block;
  }

  .empty {
    font-size: 15px;
    color: var(--muted);
    padding: 40px 0;
  }
</style>
