<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Locale } from '$lib/i18n';
  import type { PracticeSummary } from '$lib/types/datocms';

  let {
    practice,
    locale
  }: {
    practice: PracticeSummary;
    locale: Locale;
  } = $props();
  const imageUrl = $derived(practice.coverImage?.url ?? '');
  const practiceHref = $derived(resolve(`/${locale}/practices/${practice.slug}/`));
  const truncatedExcerpt = $derived(
    practice.excerpt && practice.excerpt.length > 120
      ? practice.excerpt.slice(0, 120).trimEnd() + '…'
      : practice.excerpt
  );
</script>

<a href={practiceHref} class="p-card-link" aria-label={practice.title}>
  <article class="p-card">
    {#if imageUrl}
      <div class="img" style="background-image: url('{imageUrl}')"></div>
    {:else}
      <div class="img img--empty"></div>
    {/if}
    <div class="shade"></div>
    <div class="content">
      <h3>{practice.title}</h3>
      {#if truncatedExcerpt}
        <p>{truncatedExcerpt}</p>
      {/if}
      <div class="row">
        <span class="explore">Explore <span aria-hidden="true">→</span></span>
      </div>
    </div>
  </article>
</a>

<style>
  .p-card {
    flex: 0 0 auto;
    width: calc(0.54545455 * calc(calc(100vh - 6.875rem) - 5.5vmin - 9vmin));
    height: 100%;
    min-height: 440px;
    background: #000;
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.04),
      0 24px 48px -24px rgba(30, 27, 20, 0.22),
      0 6px 16px -8px rgba(30, 27, 20, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color: #fff;
    transition: box-shadow 0.5s;
  }

  .p-card:hover {
    box-shadow:
      0 1px 0 rgba(0, 0, 0, 0.04),
      0 36px 60px -28px rgba(30, 27, 20, 0.35),
      0 10px 20px -10px rgba(30, 27, 20, 0.18);
  }

  .img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .p-card:hover .img {
    transform: scale(1.04);
  }

  .shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15, 12, 6, 0) 30%,
      rgba(15, 12, 6, 0.25) 55%,
      rgba(15, 12, 6, 0.85) 100%
    );
  }

  .content {
    position: relative;
    padding: 28px 28px 26px;
  }

  h3 {
    font-family: 'Jost', sans-serif;
    font-weight: 600;
    font-size: 30px;
    line-height: 1.05;
    letter-spacing: -0.01em;
    margin-bottom: 12px;
    text-wrap: balance;
  }

  p {
    font-size: 13.5px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.8);
    max-width: 32ch;
  }

  .row {
    margin-top: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .p-card-link {
    display: contents;
  }

  .img--empty {
    background: rgba(15, 12, 6, 0.4);
  }

  .explore {
    color: rgba(255, 255, 255, 0.7);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  /* ── Mobile (< 768px) — compact card for horizontal strip ─────────── */
  @media (max-width: 767px) {
    .p-card {
      width: 100%;
      height: auto;
      min-height: 320px;
      max-height: none;
    }
  }
</style>
