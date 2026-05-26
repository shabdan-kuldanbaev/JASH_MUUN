<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { m, LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import { reveal } from '$lib/actions/reveal';
  import CmsImage from '$cms/CmsImage.svelte';

  let { data }: { data: PageData } = $props();

  const ACCENTS = [
    'var(--shyrdak)',
    'var(--indigo)',
    'var(--steppe)',
    'var(--valley)',
    'var(--clay)'
  ] as const;
  const href = (slug: string) => resolve(`/${data.locale}/practices/${slug}/`);
</script>

<SeoHead
  title={m.practices_meta_title()}
  description={m.practices_meta_description()}
  locale={data.locale}
  alternateLocales={LOCALES.map((locale) => ({
    locale,
    url: resolve(`/${locale}/practices/`)
  }))}
/>

<div class="page">
  <h1 class="page-title">{m.practices_title()}</h1>

  {#if data.practices.length === 0}
    <div class="empty">
      <p>{m.practices_empty()}</p>
    </div>
  {:else}
    <div class="grid" aria-label={m.practices_list_aria()}>
      {#each data.practices as practice, i (practice.id)}
        {@const accent = ACCENTS[i % ACCENTS.length]}
        <a href={href(practice.slug)} class="item" style="--accent: {accent}" use:reveal={i * 40}>
          <div class="card">
            {#if practice.coverImage}
              <CmsImage
                image={practice.coverImage}
                sizes="(min-width: 1200px) 30vw, (min-width: 700px) 45vw, 90vw"
              />
            {/if}
          </div>

          <div class="item-body">
            <h2 class="item-title">{practice.title}</h2>
            {#if practice.excerpt}
              <p class="item-excerpt">{practice.excerpt}</p>
            {/if}
          </div>
        </a>
      {/each}
    </div>
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

  /* ── Grid ───────────────────────────────────── */

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }

  /* ── Item (link wrapper) ────────────────────── */

  .item {
    display: block;
  }

  /* ── Card (image = the card) ────────────────── */

  .card {
    aspect-ratio: 4 / 3;
    border-radius: 1rem;
    overflow: hidden;
    background: var(--paper-2);
    position: relative;
  }

  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15, 12, 6, 0) 30%,
      rgba(15, 12, 6, 0.25) 55%,
      rgba(15, 12, 6, 0.85) 100%
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .item:hover .card::after {
    opacity: 1;
  }

  .card :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .item:hover .card :global(img) {
    transform: scale(1.03);
  }

  /* ── Text below card ────────────────────────── */

  .item-body {
    padding-top: 14px;
  }

  .item-title {
    font-weight: 600;
    font-size: 18px;
    line-height: 1.4;
    height: calc(18px * 1.4 * 2); /* ровно 2 строки */
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-excerpt {
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    height: calc(13px * 1.5 * 2); /* ровно 2 строки */
    color: var(--muted);
    margin-top: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

  /* ── Responsive ─────────────────────────────── */

  @media (max-width: 1024px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }
</style>
