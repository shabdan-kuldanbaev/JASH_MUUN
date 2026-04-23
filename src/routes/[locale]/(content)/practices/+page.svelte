<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageData } from './$types';
  import { m, LOCALES } from '$i18n';
  import SeoHead from '$cms/SeoHead.svelte';
  import PracticeCard from '$cms/PracticeCard.svelte';
  import { reveal } from '$lib/actions/reveal';

  let { data }: { data: PageData } = $props();
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
  <header class="page-header">
    <p class="page-sup">{m.practices_kicker()}</p>
    <h1 class="page-title">{m.practices_title()}</h1>
    <div class="page-rule" aria-hidden="true"></div>
  </header>

  {#if data.practices.length === 0}
    <div class="empty-state">
      <p>{m.practices_empty()}</p>
    </div>
  {:else}
    <section class="practice-list" aria-label={m.practices_list_aria()}>
      {#each data.practices as practice, i (practice.id)}
        <div use:reveal={i * 120}>
          <PracticeCard {practice} locale={data.locale} />
        </div>
      {/each}
    </section>
  {/if}
</div>

<style>
  .page {
    max-width: 1320px;
    margin: 0 auto;
    padding: clamp(48px, 6vw, 96px) var(--gutter) clamp(64px, 8vw, 128px);
  }

  .page-header {
    margin-bottom: clamp(48px, 6vw, 80px);
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
    margin-bottom: 32px;
  }

  .page-rule {
    width: 100%;
    height: 1px;
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  .practice-list {
    display: flex;
    flex-direction: column;
  }

  /* Reveal animation: slides in from right */
  .practice-list :global([data-reveal='pending']) {
    opacity: 0;
    transform: translateY(40px);
    transition:
      opacity 0.65s ease,
      transform 0.65s ease;
  }

  .practice-list :global([data-reveal='done']) {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.65s ease,
      transform 0.65s ease;
  }

  .empty-state {
    padding: 80px 0;
    font-size: 16px;
    color: var(--muted);
  }
</style>
