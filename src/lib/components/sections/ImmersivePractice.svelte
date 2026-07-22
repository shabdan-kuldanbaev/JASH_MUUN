<script lang="ts">
  import { asset } from '$app/paths';
  import type { PracticeSection } from '$lib/types/datocms';
  import SilentHero from '$components/sections/SilentHero.svelte';
  import MilestoneTimeline from '$components/ui/MilestoneTimeline.svelte';
  import StickyScrollReveal from '$components/ui/StickyScrollReveal.svelte';
  import LucideIcon from '$components/ui/LucideIcon.svelte';

  let { sections }: { sections: PracticeSection[] } = $props();

  const hero = $derived(sections.find((s) => s.type === 'hero'));
  const rest = $derived(sections.filter((s) => s.type !== 'hero'));

  // Ritual background reflects the active stage's mood, rendered as `.ritual.is-<mood>` (registry in CSS below).
  let ritualMood = $state<string | null>(null);
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
        <section class="sec lede {section.theme ? `lede--theme-${section.theme}` : ''}">
          <div class="sec-inner">
            {#if section.kicker}<p class="kicker">{section.kicker}</p>{/if}
            <p class="lede-body">{section.body}</p>
            {#if section.theme}
              <!-- Kyial ornament — theme marker; strokes coloured per theme via CSS vars -->
              <svg class="ornament" viewBox="0 0 150 18" fill="none" aria-hidden="true">
                <path
                  d="M2 9 H52 M52 9 C60 9 64 3.6 59.4 2 C55.6 0.7 53 5 57.6 6.4"
                  stroke="var(--orn-a)"
                  stroke-width="1.1"
                  stroke-linecap="round"
                />
                <path
                  d="M148 9 H98 M98 9 C90 9 86 3.6 90.6 2 C94.4 0.7 97 5 92.4 6.4"
                  stroke="var(--orn-b)"
                  stroke-width="1.1"
                  stroke-linecap="round"
                />
                <path
                  d="M75 4.4 L79.6 9 L75 13.6 L70.4 9 Z"
                  stroke="var(--orn-c)"
                  stroke-width="1.1"
                />
              </svg>
            {/if}
          </div>
        </section>
      {:else if section.type === 'timeline'}
        <section class="sec arc">
          <MilestoneTimeline title={section.title} steps={section.steps} theme={section.theme} />
        </section>
      {:else if section.type === 'ritual'}
        <section class="sec ritual {ritualMood ? `is-${ritualMood}` : ''}">
          <StickyScrollReveal
            items={section.items}
            theme={section.theme}
            onMoodChange={(m) => (ritualMood = m)}
          />
        </section>
      {:else if section.type === 'photo'}
        <section class="sec photo {section.mood ? `photo--${section.mood}` : ''}">
          <figure class="plate">
            <img
              src={section.image}
              alt={section.imageAlt}
              width={section.width}
              height={section.height}
              loading="lazy"
            />
          </figure>
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
      {:else if section.type === 'table'}
        <section class="sec table-sec">
          <div class="sec-inner">
            {#if section.title}<h2 class="table-title">{section.title}</h2>{/if}
            {#if section.intro}<p class="table-lead">{section.intro}</p>{/if}
            <table class="otenki">
              <thead>
                <tr
                  >{#each section.columns as col (col)}<th scope="col">{col}</th>{/each}</tr
                >
              </thead>
              <tbody>
                {#each section.rows as row, r (r)}
                  <tr>
                    <td class="col-raw">{row.raw}</td>
                    <td class="col-color">
                      {#if row.swatchFrom}
                        <span
                          class="swatch"
                          style="background:linear-gradient(135deg,{row.swatchFrom},{row.swatchTo})"
                        ></span>
                      {/if}{row.color}
                    </td>
                    <td class="col-time" data-label={section.columns[2] ?? ''}>{row.boil}</td>
                    <td class="col-time" data-label={section.columns[3] ?? ''}>{row.dye}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>
      {:else if section.type === 'note'}
        <section class="sec note note--{section.variant}">
          <div class="sec-inner">
            {#if section.variant === 'warn'}
              <div class="note-warn">
                <span class="note-ico" aria-hidden="true"
                  ><LucideIcon name="triangle-alert" size={24} /></span
                >
                <div>
                  {#if section.title}<h3>{section.title}</h3>{/if}
                  <p>{section.body}</p>
                </div>
              </div>
            {:else}
              {#if section.title}<h2 class="recs-title">{section.title}</h2>{/if}
              <ul class="recs-list">
                {#each section.items as row, r (r)}
                  <li>
                    <span class="recs-ico" aria-hidden="true"
                      ><LucideIcon name={row.icon} size={20} /></span
                    >
                    <span>{row.text}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>

<style>
  /* Only the hero is pinned; the opaque `.flow` block scrolls up and covers it (single overlap seam). */
  .hero-pin {
    position: sticky;
    top: 0;
    /* Full-viewport, bleeding under the transparent nav. */
    height: 100svh;
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

  /* Shared section rhythm */
  .sec {
    position: relative;

    /* `clip` (not `hidden`) contains petroglyphs without becoming a scroll container that would trap the ritual's inner `position: sticky`. */
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

  /* Lede */
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

  /* Kyial ornament — stroke colours come from per-theme vars (registry below). */
  .ornament {
    display: block;
    width: 150px;
    margin: clamp(32px, 5vw, 52px) auto 0;
    --orn-a: var(--clay);
    --orn-b: var(--clay);
    --orn-c: var(--clay);
  }

  /* Bigger on phones — 150px reads small against the full-bleed column. */
  @media (max-width: 720px) {
    .ornament {
      width: min(240px, 62vw);
    }
  }

  .lede--theme-duotone .ornament {
    --orn-a: var(--steppe);
    --orn-b: var(--shyrdak);
    --orn-c: color-mix(in srgb, var(--ink) 55%, transparent);
  }

  .lede--theme-ember .ornament {
    --orn-a: var(--clay);
    --orn-b: var(--clay);
    --orn-c: var(--clay);
  }

  /* `dye` — single steppe/gold ornament */
  .lede--theme-dye .ornament {
    --orn-a: var(--steppe);
    --orn-b: var(--steppe);
    --orn-c: var(--steppe);
  }

  /* Ritual mood-zone registry: background reflects the active stage's mood (add a mood = add its `.ritual.is-<mood>` pair). */
  .ritual {
    background: var(--paper);
    transition: background-color 1.1s ease;
  }

  .ritual::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1.1s ease;
  }

  .ritual.is-silk {
    background: color-mix(in srgb, var(--ink) 2.5%, var(--paper));
  }

  .ritual.is-ember {
    background: color-mix(in srgb, var(--clay) 5%, var(--paper));
  }

  .ritual.is-ember::after {
    opacity: 1;
    background: radial-gradient(
      130% 90% at 50% 35%,
      color-mix(in srgb, var(--clay) 9%, transparent),
      transparent 72%
    );
  }

  /* `dye` — warm vat zone (mirror of is-ember, steppe-toned). */
  .ritual.is-dye {
    --vat: color-mix(in srgb, var(--steppe) 7%, var(--paper));

    background: var(--vat);
  }

  .ritual.is-dye::after {
    opacity: 1;
    background: radial-gradient(
      130% 90% at 50% 34%,
      color-mix(in srgb, var(--steppe) 12%, transparent),
      transparent 72%
    );
  }

  .ritual :global(.ssr) {
    position: relative;
    z-index: 1;
  }

  /* Photo — uncropped plate */
  .photo {
    padding-block: clamp(8px, 2vw, 24px);
  }

  .plate {
    max-width: 1152px;
    margin: clamp(20px, 3vw, 36px) auto;
    padding: 0 var(--gutter);
    text-align: center;
  }

  .plate img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 86vh;
    margin: 0 auto;
  }

  /* Silk close: the pearl zone resolves back to paper around the payoff photo */
  .photo--silk {
    --edge: clamp(90px, 12vh, 160px);
    --silk: color-mix(in srgb, var(--ink) 2.5%, var(--paper));

    padding-block: clamp(8px, 2vw, 24px) var(--edge);
    background: linear-gradient(
      180deg,
      var(--silk) 0,
      var(--silk) calc(100% - var(--edge)),
      color-mix(in srgb, var(--ink) 1%, var(--paper)) calc(100% - var(--edge) * 0.5),
      var(--paper) 100%
    );
  }

  .photo--silk .plate {
    position: relative;
    z-index: 1;
  }

  .photo--silk .plate img {
    box-shadow: 0 0 90px color-mix(in srgb, var(--ink) 7%, transparent);
  }

  /* Quote */
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

  /* Bare-name ledger (no detail on any row): drop the empty value cell → single-column ruled list. */
  .ledger-row dd:empty {
    display: none;
  }

  .ledger-row:has(dd:empty) dt {
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

    /* Stack each ledger entry on phones: bold name over details, left-aligned. */
    .ledger-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      padding: 15px 0;
    }

    .ledger-row dt {
      flex: none;
      font-size: 16px;
      font-weight: 600;
      color: var(--ink);
    }

    .ledger-row dd {
      flex: none;
      max-width: none;
      text-align: left;
      font-size: 15.5px;
      font-weight: 400;
      color: var(--ink-2);
    }

    .ledger-row dd:empty {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ritual,
    .ritual::after {
      transition: none;
    }
  }

  /* Shades table (section_type=table) */
  .table-sec {
    padding-block: var(--section-py);
  }

  .table-title {
    text-align: center;
    font-size: clamp(30px, 3.6vw, 44px);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: var(--ink);
    margin-bottom: clamp(14px, 2vw, 20px);
  }

  .table-lead {
    max-width: 66ch;
    margin: 0 auto clamp(26px, 3vw, 40px);
    text-align: center;
    font-size: clamp(15px, 1.7vw, 17px);
    font-weight: 300;
    line-height: 1.7;
    color: var(--ink-2);
  }

  .otenki {
    width: 100%;
    border-collapse: collapse;
    font-weight: 300;
  }

  .otenki thead th {
    padding: 0 0 14px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--ink);
  }

  .otenki tbody td {
    padding: clamp(18px, 2.4vw, 24px) 0;
    border-bottom: 1px solid var(--line);
    font-size: clamp(15px, 1.7vw, 18px);
    line-height: 1.5;
    color: var(--ink-2);
    vertical-align: top;
  }

  .otenki .col-raw {
    color: var(--ink);
    font-weight: 500;
    white-space: nowrap;
  }

  .otenki .col-time {
    white-space: nowrap;
  }

  .otenki thead th + th,
  .otenki tbody td + td {
    padding-left: clamp(18px, 3vw, 40px);
  }

  .swatch {
    display: inline-block;
    width: 30px;
    height: 30px;
    margin-right: 14px;
    border-radius: 3px;
    vertical-align: -8px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  .col-color {
    display: flex;
    align-items: flex-start;
  }

  .col-color .swatch {
    flex: none;
  }

  /* Warn callout (note--warn) */
  .note {
    padding-block: clamp(8px, 2vw, 24px);
  }

  .note-warn {
    max-width: 1152px;
    margin-inline: auto;
    padding: clamp(20px, 3vw, 28px) clamp(22px, 3vw, 32px);
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 18px;
    align-items: start;
    border-left: 3px solid var(--steppe);
    background: color-mix(in srgb, var(--steppe) 6%, transparent);
  }

  .note-ico {
    color: var(--steppe);
    margin-top: 2px;
  }

  .note-warn h3 {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    margin-bottom: 8px;
  }

  .note-warn p {
    font-size: clamp(15px, 1.7vw, 17px);
    line-height: 1.72;
    color: var(--ink-2);
  }

  /* Recommendations checklist (note--recs) */
  .note--recs .sec-inner {
    max-width: 820px;
  }

  .recs-title {
    font-size: clamp(26px, 3vw, 38px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: clamp(20px, 3vw, 28px);
  }

  .recs-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .recs-list li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 15px;
    align-items: start;
    padding: 16px 0;
    border-top: 1px solid var(--line);
    font-size: clamp(16px, 1.8vw, 18px);
    font-weight: 300;
    line-height: 1.62;
    color: var(--ink-2);
  }

  .recs-list li:last-child {
    border-bottom: 1px solid var(--line);
  }

  .recs-ico {
    color: var(--steppe);
    margin-top: 1px;
  }

  /* Table → stacked cards on phones */
  @media (max-width: 720px) {
    .otenki,
    .otenki thead,
    .otenki tbody,
    .otenki tr,
    .otenki td {
      display: block;
    }

    .otenki thead {
      display: none;
    }

    .otenki tbody td {
      border-bottom: none;
      padding: 4px 0;
    }

    .otenki tbody tr {
      padding: 20px 0;
      border-bottom: 1px solid var(--line);
    }

    .otenki tbody td + td {
      padding-left: 0;
    }

    .otenki .col-raw {
      font-size: 19px;
      margin-bottom: 8px;
    }

    .otenki .col-time::before {
      content: attr(data-label) ': ';
      color: var(--muted);
      font-size: 13px;
      letter-spacing: 0.04em;
    }
  }
</style>
