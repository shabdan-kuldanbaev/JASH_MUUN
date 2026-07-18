<script lang="ts">
  /**
   * ArticleSections — modular article renderer (final "day → night → dawn" design).
   *
   * Fully block-driven flow layout (no pinning): the `hero` block renders the
   * masthead (title + ornament + lede) and the uncropped lead photo; body blocks
   * follow in normal document flow. Consecutive sections flagged `night` (via the
   * CMS `kicker` variant channel) are wrapped into a single dark band with dusk
   * and dawn gradient edges, film grain, drifting ember sparks and an
   * ember-accented pullquote.
   */
  import type { ArticleSection } from '$lib/types/datocms';
  import CmsImage from '$cms/CmsImage.svelte';
  import { reveal } from '$lib/actions/reveal';

  let { sections }: { sections: ArticleSection[] } = $props();

  /** Split a text field into paragraphs (blank-line separated). */
  function paragraphs(body: string): string[] {
    return body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  /** Consecutive same-mood sections collapse into one band (night → dark). */
  interface Band {
    night: boolean;
    items: { section: ArticleSection; index: number }[];
  }

  const bands = $derived(
    sections.reduce<Band[]>((acc, section, index) => {
      const last = acc.at(-1);
      if (last && last.night === section.night) {
        last.items.push({ section, index });
      } else {
        acc.push({ night: section.night, items: [{ section, index }] });
      }
      return acc;
    }, [])
  );

  /** First text block gets the drop cap (the article intro). */
  const firstTextIndex = $derived(sections.findIndex((s) => s.type === 'text'));
</script>

<div class="article-sections">
  {#each bands as band, b (b)}
    {#if band.night}
      <div class="dusk" aria-hidden="true"></div>
    {/if}

    <div class="band" class:night={band.night}>
      {#if band.night}
        <div class="sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      {/if}

      {#each band.items as { section, index } (index)}
        {#if section.type === 'hero'}
          <header class="masthead">
            <h1 class="masthead-title">{section.title}</h1>
            <svg class="ornament" viewBox="0 0 150 18" fill="none" aria-hidden="true">
              <path
                d="M2 9 H52 M148 9 H98 M52 9 C60 9 64 3.6 59.4 2 C55.6 0.7 53 5 57.6 6.4 M98 9 C90 9 86 3.6 90.6 2 C94.4 0.7 97 5 92.4 6.4"
                stroke="currentColor"
                stroke-width="1.1"
                stroke-linecap="round"
              />
              <path
                d="M75 4.4 L79.6 9 L75 13.6 L70.4 9 Z"
                stroke="currentColor"
                stroke-width="1.1"
              />
            </svg>
          </header>
          {#if section.image}
            <figure class="plate plate--lead">
              <CmsImage
                image={section.image}
                sizes="(min-width: 1200px) 1152px, 100vw"
                eager={true}
              />
            </figure>
          {/if}
          {#if section.lede}
            <div class="lede" use:reveal>
              <p>{section.lede}</p>
            </div>
          {/if}
        {:else if section.type === 'photo'}
          <figure class="plate" class:plate--pair={section.imageSecondary} use:reveal>
            {#if section.imageSecondary}
              <div class="pair">
                {#if section.image}
                  <CmsImage image={section.image} sizes="(min-width: 1200px) 640px, 100vw" />
                {/if}
                <CmsImage image={section.imageSecondary} sizes="(min-width: 1200px) 470px, 100vw" />
              </div>
            {:else if section.image}
              <CmsImage image={section.image} sizes="(min-width: 1200px) 1152px, 100vw" />
            {/if}
            {#if section.caption}<figcaption>{section.caption}</figcaption>{/if}
          </figure>
        {:else if section.type === 'text'}
          <section class="text" class:text--intro={index === firstTextIndex} use:reveal>
            <div class="text-inner">
              {#if section.heading}<h2 class="text-heading">{section.heading}</h2>{/if}
              {#each paragraphs(section.body) as p, pi (pi)}
                <p class="text-body">{p}</p>
              {/each}
            </div>
          </section>
        {:else if section.type === 'photoText'}
          <section class="photo-text" class:is-right={section.side === 'right'} use:reveal>
            <div class="pt-inner">
              <div class="pt-media">
                {#if section.image}
                  <CmsImage image={section.image} sizes="(min-width: 900px) 50vw, 100vw" />
                {/if}
              </div>
              <div class="pt-copy">
                {#if section.heading}<h2 class="pt-heading">{section.heading}</h2>{/if}
                {#each paragraphs(section.body) as p, pi (pi)}
                  <p class="pt-body">{p}</p>
                {/each}
              </div>
            </div>
          </section>
        {:else if section.type === 'quote'}
          <section class="quote" use:reveal>
            <div class="quote-inner">
              <span class="quote-mark" aria-hidden="true"></span>
              <blockquote class="quote-text">{section.quote}</blockquote>
              {#if section.attribution}<p class="quote-by">{section.attribution}</p>{/if}
            </div>
          </section>
        {/if}
      {/each}
    </div>

    {#if band.night}
      <div class="dawn" aria-hidden="true"></div>
    {/if}
  {/each}
</div>

<style>
  /* Local night palette (component-scoped; day side uses global tokens). */
  .article-sections {
    --night: #151109;
    --night-text: #ece4d2;
    --night-muted: #a89d86;
    --ember: var(--steppe);
    --media-w: 1152px;
  }

  /* ── Reveal (project-wide action, per-component styles) ─────────────── */
  .article-sections :global([data-reveal='pending']) {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.7s ease,
      transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .article-sections :global([data-reveal='done']) {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.7s ease,
      transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  /* ── Masthead ───────────────────────────────────────────────────────── */
  .masthead {
    max-width: var(--media-w);
    margin: 0 auto;
    padding: clamp(32px, 5vw, 56px) var(--gutter) 0;
    text-align: center;
  }
  .masthead-title {
    margin: 0 auto;
    max-width: 22ch;
    font-size: clamp(32px, 5vw, 64px);
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.1;
    color: var(--ink);
    text-wrap: balance;
  }
  .ornament {
    display: block;
    width: 150px;
    margin: clamp(24px, 4vw, 40px) auto;
    color: var(--ink);
    opacity: 0.55;
  }

  /* ── Photos (plates) — minimal, uncropped ───────────────────────────── */
  .plate {
    max-width: var(--media-w);
    margin: clamp(32px, 5vw, 52px) auto;
    padding: 0 var(--gutter);
    text-align: center;
  }
  .plate :global(img) {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 86vh;
    margin: 0 auto;
    display: block;
  }
  .plate--lead {
    margin-top: 0;
  }
  .plate figcaption {
    margin-top: 16px;
    font-size: 13px;
    font-style: italic;
    color: var(--muted);
  }
  .plate figcaption::before {
    content: '';
    display: block;
    width: 26px;
    height: 1px;
    margin: 0 auto 11px;
    background: currentColor;
    opacity: 0.6;
  }

  /* Diptych — landscape scene + portrait detail, bottoms flush */
  .plate--pair .pair {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: clamp(12px, 1.8vw, 26px);
    align-items: end;
  }
  .plate--pair .pair :global(img) {
    width: 100%;
    max-height: none;
  }

  /* ── Lede ───────────────────────────────────────────────────────────── */
  .lede {
    max-width: 740px;
    margin: clamp(48px, 7vw, 80px) auto clamp(16px, 3vw, 32px);
    padding: 0 var(--gutter);
    text-align: center;
  }
  .lede p {
    margin: 0;
    font-size: clamp(20px, 2.3vw, 26px);
    font-weight: 300;
    font-style: italic;
    line-height: 1.52;
    color: var(--ink);
    text-wrap: pretty;
  }

  /* ── Text ───────────────────────────────────────────────────────────── */
  .text {
    padding-block: clamp(28px, 4vw, 48px);
  }
  .text-inner {
    max-width: 680px;
    margin-inline: auto;
    padding-inline: var(--gutter);
  }
  .text-heading {
    font-size: clamp(24px, 3.2vw, 36px);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: var(--ink);
    margin-bottom: 0.8em;
    text-wrap: balance;
  }
  .text-body {
    font-size: clamp(16px, 1.8vw, 18px);
    font-weight: 300;
    line-height: 1.85;
    color: var(--ink-2);
    margin: 0 0 1.4em;
  }
  .text-body:last-child {
    margin-bottom: 0;
  }
  .text--intro .text-body:first-of-type::first-letter {
    float: left;
    font-size: 3.6em;
    line-height: 0.82;
    font-weight: 500;
    padding: 0.08em 0.14em 0 0;
    color: var(--ink);
  }

  /* ── Photo + text ───────────────────────────────────────────────────── */
  .photo-text {
    padding-block: clamp(40px, 6vw, 80px);
  }
  .pt-inner {
    max-width: var(--content-w);
    margin-inline: auto;
    padding-inline: var(--gutter);
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: clamp(32px, 5vw, 80px);
    align-items: center;
  }
  .photo-text.is-right .pt-media {
    order: 2;
  }
  .pt-media :global(img) {
    width: 100%;
    height: auto;
    display: block;
  }
  .pt-heading {
    font-size: clamp(22px, 2.6vw, 32px);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: var(--ink);
    margin-bottom: 0.6em;
  }
  .pt-body {
    font-size: clamp(16px, 1.8vw, 18px);
    font-weight: 300;
    line-height: 1.75;
    color: var(--ink-2);
    max-width: 46ch;
    margin: 0 0 1.2em;
  }
  .pt-body:last-child {
    margin-bottom: 0;
  }

  /* ── Quote ──────────────────────────────────────────────────────────── */
  .quote {
    padding-block: clamp(40px, 6vw, 72px);
    text-align: center;
  }
  .quote-inner {
    position: relative;
    max-width: 800px;
    margin-inline: auto;
    padding-inline: var(--gutter);
  }
  .quote-mark {
    display: block;
    width: 7px;
    height: 7px;
    margin: 0 auto 26px;
    transform: rotate(45deg);
    background: var(--ember);
  }
  .quote-text {
    font-size: clamp(22px, 3vw, 38px);
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.32;
    color: var(--ink);
    text-wrap: balance;
  }
  .quote-by {
    margin-top: clamp(20px, 3vh, 32px);
    font-size: 15px;
    color: var(--muted);
  }

  /* ── Dusk / night / dawn ────────────────────────────────────────────── */
  .dusk {
    height: 34vh;
    background: linear-gradient(
      180deg,
      var(--paper) 0%,
      #e6dfc9 16%,
      #cbbc9c 34%,
      #9d8862 52%,
      #675433 70%,
      #392c1a 85%,
      #201808 95%,
      var(--night) 100%
    );
  }
  .dawn {
    height: 34vh;
    background: linear-gradient(
      180deg,
      var(--night) 0%,
      #201808 6%,
      #392c1a 16%,
      #675433 32%,
      #9d8862 50%,
      #cbbc9c 68%,
      #e6dfc9 85%,
      var(--paper) 100%
    );
  }

  .band {
    position: relative;
  }
  .band.night {
    background: var(--night);
    padding-block: clamp(40px, 6vw, 72px);
  }
  /* Film grain over the dark band */
  .band.night::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .band.night > :global(*) {
    position: relative;
    z-index: 1;
  }

  .band.night .text-heading,
  .band.night .quote-text,
  .band.night .lede p {
    color: var(--night-text);
  }
  .band.night .text-body,
  .band.night .pt-body,
  .band.night .quote-by,
  .band.night .plate figcaption {
    color: var(--night-muted);
  }
  .band.night .quote-inner::before {
    content: '';
    position: absolute;
    inset: -48px -15%;
    background: radial-gradient(
      ellipse at center,
      color-mix(in srgb, var(--ember) 13%, transparent),
      transparent 62%
    );
    pointer-events: none;
  }
  .band.night .plate :global(img) {
    box-shadow: 0 0 130px color-mix(in srgb, var(--ember) 14%, transparent);
    animation: ember 6s ease-in-out infinite;
  }
  @keyframes ember {
    0%,
    100% {
      box-shadow: 0 0 110px color-mix(in srgb, var(--ember) 10%, transparent);
    }
    50% {
      box-shadow: 0 0 160px color-mix(in srgb, var(--ember) 20%, transparent);
    }
  }

  /* Ember sparks drifting up through the night */
  .sparks {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .sparks i {
    position: absolute;
    bottom: -8px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--ember) 95%, white),
      transparent 72%
    );
    filter: blur(0.4px);
    opacity: 0;
    animation: spark linear infinite;
  }
  .sparks i:nth-child(1) {
    left: 12%;
    animation-duration: 11s;
  }
  .sparks i:nth-child(2) {
    left: 30%;
    animation-duration: 14s;
    animation-delay: 3.5s;
    width: 4px;
    height: 4px;
  }
  .sparks i:nth-child(3) {
    left: 52%;
    animation-duration: 9s;
    animation-delay: 1.2s;
  }
  .sparks i:nth-child(4) {
    left: 71%;
    animation-duration: 13s;
    animation-delay: 5s;
    width: 6px;
    height: 6px;
  }
  .sparks i:nth-child(5) {
    left: 88%;
    animation-duration: 10s;
    animation-delay: 2.2s;
    width: 4px;
    height: 4px;
  }
  @keyframes spark {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    7% {
      opacity: 0.6;
    }
    40% {
      opacity: 0.3;
      transform: translateY(-460px) translateX(10px);
    }
    70% {
      opacity: 0.45;
    }
    100% {
      transform: translateY(-1150px) translateX(-14px);
      opacity: 0;
    }
  }

  /* ── Mobile ─────────────────────────────────────────────────────────── */
  @media (max-width: 720px) {
    .plate--pair .pair {
      grid-template-columns: 1fr;
      align-items: start;
    }
    .pt-inner {
      grid-template-columns: 1fr;
      gap: 28px;
    }
    .photo-text.is-right .pt-media {
      order: 0;
    }
  }

  /* ── Reduced motion ─────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .band.night .plate :global(img) {
      animation: none;
    }
    .sparks i {
      animation: none;
      display: none;
    }
  }
</style>
