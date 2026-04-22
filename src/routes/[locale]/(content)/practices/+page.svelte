<script lang="ts">
  import type { PageData } from './$types';
  import SeoHead from '$cms/SeoHead.svelte';
  import PracticeCard from '$cms/PracticeCard.svelte';

  let { data }: { data: PageData } = $props();
</script>

<SeoHead
  title="Practices — Jash-Muun"
  description="Documented cultural practices, field research, and heritage records from Kyrgyz mountain communities."
  locale={data.locale}
/>

<div class="page">
  <header class="page-header">
    <p class="page-sup">Archive</p>
    <h1 class="page-title">Practices</h1>
    <div class="page-rule" aria-hidden="true"></div>
  </header>

  {#if data.practices.length === 0}
    <div class="empty-state">
      <p>No practices published yet.</p>
    </div>
  {:else}
    <section class="practice-list" aria-label="Practice list">
      {#each data.practices as practice (practice.id)}
        <PracticeCard {practice} locale={data.locale} />
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
    letter-spacing: .24em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
  }

  .page-title {
    font-size: clamp(36px, 6vw, 80px);
    font-weight: 300;
    letter-spacing: -.02em;
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

  .empty-state {
    padding: 80px 0;
    font-size: 16px;
    color: var(--muted);
  }
</style>
