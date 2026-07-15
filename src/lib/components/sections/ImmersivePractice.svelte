<script lang="ts">
  import { asset } from '$app/paths';
  import type { PracticeSection } from '$lib/content/sumolok';
  import SilentHero from '$components/sections/SilentHero.svelte';
  import MilestoneTimeline from '$components/ui/MilestoneTimeline.svelte';
  import StickyScrollReveal from '$components/ui/StickyScrollReveal.svelte';

  let { sections }: { sections: PracticeSection[] } = $props();

  const hero = $derived(sections.find((s) => s.type === 'hero'));
  // Everything after the hero flows normally over the pinned hero.
  const rest = $derived(sections.filter((s) => s.type !== 'hero'));
</script>

<div class="immersive">
  {#if hero && hero.type === 'hero'}
    <section class="hero-pin">
      <SilentHero
        word={hero.word}
        subtitle={hero.subtitle}
        image={hero.image}
        imageAlt={hero.imageAlt}
      />
    </section>
  {/if}

  <div class="flow">
    {#each rest as section, i (i)}
      {#if section.type === 'lede'}
        <section class="sec lede">
          <div class="sec-inner">
            {#if section.kicker}<p class="kicker">{section.kicker}</p>{/if}
            <p class="lede-body">{section.body}</p>
          </div>
        </section>
      {:else if section.type === 'timeline'}
        <section class="sec arc">
          <MilestoneTimeline title={section.title} steps={section.steps} />
        </section>
      {:else if section.type === 'ritual'}
        <section class="sec ritual">
          <StickyScrollReveal items={section.items} />
        </section>
      {:else if section.type === 'quote'}
        <section class="sec quote">
          <img
            class="petroglyph quote-petro"
            src={asset('/assets/petroglyphs/4.svg')}
            alt=""
            aria-hidden="true"
          />
          <div class="sec-inner">
            <blockquote class="quote-text">«{section.quote}»</blockquote>
            {#if section.attribution}<p class="quote-by">{section.attribution}</p>{/if}
          </div>
        </section>
      {:else if section.type === 'ingredients'}
        <section class="sec ingredients">
          <div class="sec-inner ing-grid">
            <div class="ing-head">
              {#if section.kicker}<p class="kicker">{section.kicker}</p>{/if}
              <h2 class="ing-title">{section.title}</h2>
              {#if section.note}<p class="ing-note">{section.note}</p>{/if}
            </div>
            <div class="ing-list">
              <dl class="ledger">
                {#each section.items as row, r (r)}
                  <div class="ledger-row">
                    <dt>{row.name}</dt>
                    <dd>{row.qty}</dd>
                  </div>
                {/each}
              </dl>
              {#if section.footnote}<p class="ing-foot">{section.footnote}</p>{/if}
            </div>
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>

<style>
  /*
    Parallax: ONLY the hero is pinned (position: sticky). The `.flow` wrapper is an
    opaque paper block (z above the hero) that scrolls up and covers it — a single
    overlap seam. Inside `.flow` every section flows normally; they do NOT stick or
    overlap each other. (The ritual keeps its own inner sticky-scroll image.)
  */
  .hero-pin {
    position: sticky;
    top: var(--nav-h);
    height: calc(100svh - var(--nav-h));
    z-index: 0;
  }
  .flow {
    position: relative;
    z-index: 1;
    background: var(--paper);
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-pin {
      position: relative;
      top: auto;
      height: 100svh;
    }
  }

  /* shared section rhythm */
  .sec {
    position: relative;
    /*
      `clip` (not `hidden`) contains bleeding petroglyphs WITHOUT establishing a
      scroll container — otherwise the ritual section's inner `position: sticky`
      visual would resolve against `.sec` instead of the viewport and scroll away.
    */
    overflow: clip;
  }
  .sec-inner {
    max-width: var(--content-w);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }
  .kicker {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--madder);
    margin-bottom: 18px;
  }

  /* Lede — editorial manifesto paragraph */
  .lede {
    padding-block: var(--section-py);
  }
  .lede-body {
    font-size: clamp(26px, 3.2vw, 42px);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--ink);
    max-width: 40ch;
  }

  /* Timeline / ritual keep their own component styling; no fixed height —
     the timeline sizes to its content (its own 32px block padding). */

  /* Quote — centred epigraph */
  .quote {
    padding-block: var(--section-py);
    text-align: center;
  }
  .quote-petro {
    top: 12%;
    right: 4%;
    width: clamp(120px, 12vw, 190px);
    opacity: 0.06;
    transform: rotate(-8deg);
  }
  .quote-text {
    font-size: clamp(24px, 3.4vw, 46px);
    font-weight: 500;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--ink);
    max-width: 26ch;
    margin-inline: auto;
  }
  .quote-by {
    margin-top: clamp(24px, 3vh, 40px);
    font-size: 16px;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  /* Ingredients — two-column ledger */
  .ingredients {
    padding-block: var(--section-py);
  }
  .ing-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(40px, 6vw, 96px);
    align-items: start;
  }
  .ing-title {
    font-size: clamp(30px, 3.6vw, 44px);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.02;
    color: var(--ink);
  }
  .ing-note {
    margin-top: 22px;
    max-width: 32ch;
    font-size: 18px;
    line-height: 1.55;
    color: var(--ink-2);
  }
  .ledger {
    border-top: 1px solid var(--ink);
  }
  .ledger-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 28px;
    padding: 18px 0;
    border-bottom: 1px solid var(--line);
  }
  .ledger-row dt {
    flex: 1 1 auto;
    font-size: 17px;
    line-height: 1.45;
    color: var(--ink-2);
  }
  .ledger-row dd {
    flex: 0 1 auto;
    max-width: 46%;
    text-align: right;
    font-size: clamp(17px, 1.6vw, 19px);
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
  .ing-foot {
    margin-top: 24px;
    max-width: 60ch;
    font-size: 14px;
    line-height: 1.55;
    color: var(--muted);
  }

  @media (max-width: 720px) {
    .ing-grid {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }
</style>
