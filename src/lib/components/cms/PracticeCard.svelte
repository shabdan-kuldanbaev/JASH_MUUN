<script lang="ts">
  import { resolve } from '$app/paths';
  import { m } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import type { PracticeSummary } from '$lib/types/datocms';
  import CmsImage from './CmsImage.svelte';

  let { practice, locale }: { practice: PracticeSummary; locale: Locale } = $props();

  const date = $derived(
    practice.publishedDate
      ? new Date(practice.publishedDate).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null
  );
</script>

<article class="card">
  <a href={resolve(`/${locale}/practices/${practice.slug}/`)} class="card-link" aria-label={practice.title}>
    {#if practice.coverImage}
      <div class="card-image">
        <CmsImage
          image={practice.coverImage}
          sizes="(min-width: 1200px) 600px, (min-width: 768px) 50vw, 100vw"
        />
      </div>
    {:else}
      <div class="card-image card-image--empty" aria-hidden="true"></div>
    {/if}

    <div class="card-body">
      <div class="card-meta">
        {#if practice.featured}
          <span class="card-featured">{m.common_featured()}</span>
          <span class="card-sep" aria-hidden="true">·</span>
        {/if}
        {#if date && practice.publishedDate}
          <time datetime={practice.publishedDate}>{date}</time>
        {/if}
      </div>

      <h2 class="card-title">{practice.title}</h2>

      {#if practice.excerpt}
        <p class="card-excerpt">{practice.excerpt}</p>
      {/if}

      <span class="card-read">{m.common_read()}</span>
    </div>
  </a>
</article>

<style>
  .card { border-top: 1px solid color-mix(in srgb, var(--ink) 15%, transparent); }

  .card-link {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(24px, 3vw, 56px);
    padding: clamp(32px, 4vw, 64px) 0;
    align-items: start;
    transition: opacity .2s;
  }
  .card-link:hover { opacity: .8; }

  .card:nth-child(even) .card-link {
    direction: rtl;
  }
  .card:nth-child(even) .card-link > * { direction: ltr; }

  .card-image {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--paper-2);
  }
  .card-image--empty { background: var(--paper-2); }
  .card-image :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .6s ease;
  }
  .card-link:hover .card-image :global(img) { transform: scale(1.03); }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    padding: clamp(16px, 2vw, 32px) 0;
  }

  .card-meta {
    font-size: 12px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .card-featured { color: var(--ochre-2); }
  .card-sep { opacity: .5; }

  .card-title {
    font-size: clamp(22px, 2.8vw, 38px);
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -.01em;
    color: var(--ink);
  }

  .card-excerpt {
    font-size: 15px;
    line-height: 1.65;
    color: var(--ink-2);
    max-width: 44ch;
  }

  .card-read {
    font-size: 13px;
    letter-spacing: .06em;
    color: var(--muted);
    margin-top: 8px;
  }

  @media (max-width: 700px) {
    .card-link,
    .card:nth-child(even) .card-link {
      grid-template-columns: 1fr;
      direction: ltr;
    }
  }
</style>
