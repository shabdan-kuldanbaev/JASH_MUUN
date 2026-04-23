<script lang="ts">
  import { resolve } from '$app/paths';
  import PracticeCard from '$components/ui/PracticeCard.svelte';
  import { m } from '$i18n';
  import type { PracticeSummary } from '$lib/types/datocms';

  let {
    practices = [],
    locale = 'ru',
  }: { practices?: PracticeSummary[]; locale?: string } = $props();
</script>

<section class="panel panel--w-hero hero" data-scroll-screen aria-label="01 Hero">
  <div class="hero-layout">
    <div class="hero-text">
      <div class="eyebrow">{m.hero_eyebrow()}</div>
      <h1>
        {m.hero_title_line_1()}<br>
        {m.hero_title_line_2()}<br>
        {m.hero_title_line_3()}<br>
        <em>{m.hero_title_emphasis()}</em>
      </h1>
      <p class="hero-lede">{m.hero_lede()}</p>
      <div class="hero-ctas">
        <a href={resolve(`/${locale}/practices/`)} class="cta">
          <span class="arrow">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </span>
          {m.hero_enter_cta()}
        </a>
      </div>
    </div>

    {#if practices.length > 0}
      <div class="cards-row">
        {#each practices as practice, i (practice.id)}
          <PracticeCard {practice} {locale} index={i} total={practices.length} />
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
  .panel--w-hero { width: auto; }

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
    max-width: 580px;
  }
  .eyebrow {
    font-family: 'Noto Sans', sans-serif;
    font-size: 12px;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 44px;
  }
  .eyebrow::before {
    content: "";
    width: 44px; height: 1px;
    background: var(--ink);
    opacity: .4;
    display: inline-block;
  }
  h1 {
    font-family: 'Noto Sans', sans-serif;
    font-weight: 700;
    font-size: clamp(46px, 4.6vw, 78px);
    line-height: 1.04;
    letter-spacing: -.025em;
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
  .hero-ctas {
    margin-top: 44px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .cta {
    font-size: 15px;
    letter-spacing: .01em;
    color: var(--ink);
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    transition: gap .25s ease;
  }
  .cta:hover { gap: 18px; }
  .arrow {
    display: inline-grid;
    place-items: center;
    width: 22px; height: 22px;
    border: 1px solid var(--ink);
    border-radius: 50%;
    transition: background .25s, color .25s;
  }
  .cta:hover .arrow { background: var(--ink); color: var(--paper); }
.cta :global(svg) { width: 14px; height: 14px; }

  .cards-row {
    display: flex;
    gap: clamp(24px, 2vw, 40px);
    align-items: flex-start;
    height: 100%;
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

    /* Cards become a horizontal scroll strip, bleeding to panel edges. */
    .cards-row {
      margin-left: calc(-1 * var(--panel-pad));
      margin-right: calc(-1 * var(--panel-pad));
      padding-left: var(--panel-pad);
      padding-right: var(--panel-pad);
      padding-bottom: 4px;
      overflow-x: auto;
      overflow-y: visible;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      height: auto;
      align-items: stretch;
    }
    .cards-row::-webkit-scrollbar { display: none; }
  }
</style>
