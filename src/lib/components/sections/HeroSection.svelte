<script lang="ts">
  import PracticeCard from '$components/ui/PracticeCard.svelte';
  import { reveal } from '$lib/actions/reveal';
  import { m } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import type { PracticeSummary } from '$lib/types/datocms';

  let { practices = [], locale = 'ru' }: { practices?: PracticeSummary[]; locale?: Locale } =
    $props();
</script>

<section class="panel panel--w-hero hero" data-scroll-screen aria-label="01 Hero">
  <div class="hero-layout">
    <div class="hero-text">
      <h1>
        {m.hero_title_line_1()}<br />
        {m.hero_title_line_2()}<br />
        {m.hero_title_line_3()}<br />
        <em>{m.hero_title_emphasis()}</em>
      </h1>
      <p class="hero-lede">{m.hero_lede()}</p>
    </div>

    {#if practices.length > 0}
      <div class="cards-row">
        {#each practices as practice, i (practice.id)}
          <div use:reveal={i * 120} class="reveal">
            <PracticeCard {practice} {locale} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .panel {
    display: inline-flex;
    vertical-align: top;
    height: 100dvh;
    position: relative;
    padding: var(--panel-pad);
    padding-top: calc(var(--nav-h) + 16px);
    padding-bottom: var(--ui-bottom);
    align-items: stretch;
    background: var(--paper);
    white-space: normal;
  }

  .panel--w-hero {
    width: auto;
  }

  .hero-layout {
    display: grid;
    grid-template-columns: minmax(420px, 560px) 1fr;
    gap: clamp(48px, 6vw, 120px);
    align-items: end;
    min-height: calc(100dvh - var(--nav-h) - 16px - var(--ui-bottom));
    margin-right: 48px;
  }

  .hero-text {
    align-self: center;
    max-width: 500px;
  }

  h1 {
    font-family: 'Noto Sans', sans-serif;
    font-weight: 700;
    font-size: clamp(46px, 4.6vw, 78px);
    line-height: 1.04;
    letter-spacing: -0.025em;
    color: var(--ink);
    text-wrap: balance;
  }

  h1 :global(em) {
    font-style: normal;
    font-weight: 700;
    color: var(--ochre-2);
  }

  .hero-lede {
    margin-top: 40px;
    font-size: 15.5px;
    line-height: 1.7;
    color: var(--ink-2);
    max-width: 44ch;
    text-wrap: pretty;
  }

  .cards-row {
    display: flex;
    gap: clamp(24px, 2vw, 40px);
    align-items: flex-start;
    height: 100%;
  }

  .reveal {
    height: 100%;
  }

  /* Reveal: slides in from right */
  .cards-row :global([data-reveal='pending']) {
    opacity: 0;
    transform: translateX(48px);
    transition:
      opacity 0.65s ease,
      transform 0.65s ease;
  }

  .cards-row :global([data-reveal='done']) {
    opacity: 1;
    transform: translateX(0);
    transition:
      opacity 0.65s ease,
      transform 0.65s ease;
  }

  /* ── Mobile (< 768px) — vertical stacked layout ───────────────────── */
  @media (max-width: 767px) {
    .panel {
      display: flex;
      flex-direction: column;
      height: auto;
      min-height: 100dvh;
      width: 100%;

      /* Contain the horizontal card strip — prevent page-level horizontal scroll. */
      overflow-x: hidden;
    }

    .hero-layout {
      grid-template-columns: 1fr;
      margin-right: 0;
      min-height: auto;
      align-items: start;
      gap: 32px;
    }

    .hero-text {
      max-width: 100%;
    }

    h1 {
      font-size: clamp(36px, 10vw, 56px);
    }

    .hero-lede {
      max-width: 100%;
    }

    /* Cards stack vertically, full-width. */
    .cards-row {
      flex-direction: column;
      gap: 20px;
      height: auto;
      align-items: stretch;
    }
  }
</style>
