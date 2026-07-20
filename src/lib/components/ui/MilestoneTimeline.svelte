<script lang="ts" module>
  export interface Milestone {
    time: string;
    label: string;
    /** Optional supporting line rendered under the label (origin-ui TimelineContent). */
    description?: string;
  }
</script>

<script lang="ts">
  import { asset } from '$app/paths';

  interface Props {
    title: string;
    steps: Milestone[];
    /**
     * Active step (origin-ui timeline-12 `defaultValue`): items 1..active take the
     * "completed" treatment (solid indicator + solid separator run); the rest stay
     * faint. Defaults to all — the ritual on record is complete.
     */
    active?: number;
    /** [top-right, bottom-left] corner petroglyphs; null disables them. */
    petroglyphs?: [string, string] | null;
    /**
     * Page theme token (from the hero kicker). A themed rail recolours the
     * indicator + separator from the default --madder to the theme accent via
     * `.timeline--theme-<name>`: `duotone` alternates the two wools (gradient
     * rail), `ember` is a single clay rail. Undefined → default madder.
     */
    theme?: string;
  }

  let {
    title,
    steps,
    active,
    petroglyphs = ['/assets/petroglyphs/4.svg', '/assets/petroglyphs/9.svg'],
    theme = undefined
  }: Props = $props();

  const reached = $derived(active ?? steps.length);
</script>

<section
  class="timeline {theme ? `timeline--theme-${theme}` : ''}"
  class:timeline--themed={Boolean(theme)}
>
  {#if petroglyphs}
    <img class="petroglyph pg-a" src={asset(petroglyphs[0])} alt="" aria-hidden="true" />
    <img class="petroglyph pg-b" src={asset(petroglyphs[1])} alt="" aria-hidden="true" />
  {/if}

  <div class="tl-inner">
    <h2 class="tl-title">{title}</h2>

    <!--
      origin-ui timeline-12 (horizontal), ported to the project's Tailwind-v3 / hand-CSS
      stack and heritage palette (its `primary` → --madder). Each item: a connecting
      separator + a ring indicator on the rail, then the date eyebrow, the title, and an
      optional content line. Items up to `reached` render "completed" (solid); the rest
      stay faint (the 10% / 20% base tints from the original).
    -->
    <ol class="tl" data-orientation="horizontal">
      {#each steps as step, i (i)}
        <li class="tl-item" class:completed={i < reached}>
          <div class="tl-header">
            {#if i < steps.length - 1}
              <span class="tl-separator" class:on={i + 1 < reached} aria-hidden="true"></span>
            {/if}
            <span class="tl-indicator" aria-hidden="true"></span>
            <time class="tl-date">{step.time}</time>
            <h3 class="tl-name">{step.label}</h3>
          </div>
          {#if step.description}
            <p class="tl-content">{step.description}</p>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .timeline {
    position: relative;

    /* Contain the decoration stacking so it never leaks into an outer parallax layer. */
    isolation: isolate;
    width: 100%;

    /* No fixed height — the timeline sizes to its content. */
    display: grid;
    place-items: center;
    overflow: hidden;
    background: var(--paper);
    padding: var(--section-py) 0;
  }

  .petroglyph {
    position: absolute;
    z-index: 0;
    width: clamp(120px, 12vw, 180px);
    opacity: 0.06;
    pointer-events: none;
  }

  .pg-a {
    top: 8%;
    right: 2%;
    transform: rotate(-8deg);
  }

  .pg-b {
    bottom: 8%;
    left: 2%;
    transform: rotate(10deg);
  }

  .tl-inner {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: var(--content-w);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }

  .tl-title {
    text-align: center;
    font-size: clamp(34px, 5vw, 58px);
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--ink);
    margin-bottom: clamp(28px, 4vh, 48px);
  }

  /* Timeline root — flex row of equal-width items (origin-ui .group/timeline). */
  .tl {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    width: 100%;
  }

  .tl-item {
    position: relative;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding-inline: clamp(6px, 1vw, 16px);
    text-align: center;

    /* Room above the content for the rail + indicator, which sit at top: -24px. */
    margin-top: clamp(40px, 6vh, 64px);
  }

  .tl-header {
    display: contents;
  }

  /*
    Rail segment: 2px line spanning from this item's indicator centre to the next
    one. Items are equal-width, content-centred, so left:50% + width:100% reaches
    exactly the next indicator's centre — keeping the rail symmetric end to end.
  */
  .tl-separator {
    position: absolute;
    z-index: 0;
    top: -24px;
    left: 50%;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);

    /* origin-ui: bg-primary/10 base → bg-primary when the next item is completed. */
    background: color-mix(in srgb, var(--madder) 12%, transparent);
  }

  .tl-separator.on {
    background: var(--madder);
  }

  /* Ring indicator (origin-ui: size-4, border-2, border-primary/20 → border-primary). */
  .tl-indicator {
    position: absolute;
    z-index: 1;
    top: -24px;
    left: 50%;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid color-mix(in srgb, var(--madder) 24%, transparent);
    background: var(--paper);
    transform: translate(-50%, -50%);
    transition: border-color 0.3s;
  }

  .completed .tl-indicator {
    border-color: var(--madder);
  }

  .tl-date {
    display: block;
    font-size: clamp(12px, 1vw, 13px);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .tl-name {
    margin: 0;
    font-size: clamp(15px, 1.5vw, 19px);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.3;
    color: var(--ink);
  }

  .tl-content {
    margin: 6px 0 0;
    font-size: clamp(13px, 1.1vw, 15px);
    line-height: 1.5;
    color: var(--muted);
  }

  /* Themed rail: recolour indicator + separator from --madder to the theme
     accent (--tl-acc). Per-theme blocks below only set --tl-acc (+ any rail
     override) — add a theme = one block, no logic change. */
  .timeline--themed .completed .tl-indicator {
    border-color: var(--tl-acc, var(--madder));
  }

  .timeline--themed .tl-separator.on {
    background: var(--tl-acc, var(--madder));
  }

  /* `ember` — single clay rail */
  .timeline--theme-ember .tl-item {
    --tl-acc: var(--clay);
  }

  /* `duotone` — the two contrast wools, rail flows as a gradient between them */
  .timeline--theme-duotone .tl-item:nth-child(odd) {
    --tl-acc: var(--steppe);
  }

  .timeline--theme-duotone .tl-item:nth-child(even) {
    --tl-acc: var(--shyrdak);
  }

  .timeline--theme-duotone .tl-item:nth-child(odd) .tl-separator.on {
    background: linear-gradient(90deg, var(--steppe), var(--shyrdak));
  }

  .timeline--theme-duotone .tl-item:nth-child(even) .tl-separator.on {
    background: linear-gradient(90deg, var(--shyrdak), var(--steppe));
  }

  /* Mobile: origin-ui's vertical orientation — rail + indicators run down the left. */
  @media (max-width: 720px) {
    .tl {
      flex-direction: column;
    }

    .tl-item {
      flex: 0 0 auto;
      align-items: flex-start;
      text-align: left;
      margin-top: 0;
      padding-inline: 0;
      padding-left: 32px;
      padding-bottom: clamp(24px, 4.5vh, 40px);
    }

    .tl-item:last-child {
      padding-bottom: 0;
    }

    .tl-separator {
      top: 16px;
      left: 8px;
      width: 2px;
      height: calc(100% - 16px);
      transform: translateX(-50%);
    }

    .tl-indicator {
      top: 2px;
      left: 0;
      transform: none;
    }

    .timeline--theme-duotone .tl-item:nth-child(odd) .tl-separator.on {
      background: linear-gradient(180deg, var(--steppe), var(--shyrdak));
    }

    .timeline--theme-duotone .tl-item:nth-child(even) .tl-separator.on {
      background: linear-gradient(180deg, var(--shyrdak), var(--steppe));
    }
  }

  /* The global `.petroglyph` rule hides motifs on mobile; keep the corner accents
     for this surface (they are faint and part of the section's identity). */
  @media (max-width: 767px) {
    .pg-a,
    .pg-b {
      display: block;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tl-indicator {
      transition: none;
    }
  }
</style>
