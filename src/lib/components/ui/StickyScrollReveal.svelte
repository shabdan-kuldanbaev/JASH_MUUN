<script lang="ts" module>
  export interface StickyChecklistItem {
    icon: string;
    term: string;
    desc: string;
  }
  export interface StickyItem {
    title: string;
    /** Full narrative — one entry per paragraph. */
    narrative?: string[];
    checklistTitle?: string;
    checklistIntro?: string;
    checklist?: StickyChecklistItem[];
    /** Empty string → the pinned frame shows the duotone préfelt placeholder. */
    image: string;
    imageAlt?: string;
    /** Second frame — the pinned visual pages through the stage's photos on scroll. */
    imageSecondary?: string;
    imageSecondaryAlt?: string;
  }

  interface Frame {
    url: string;
    alt: string;
    /** No photo for this stage — render the duotone préfelt placeholder. */
    placeholder: boolean;
  }
</script>

<script lang="ts">
  /**
   * StickyScrollReveal — reusable sticky-scroll reveal (Aceternity pattern).
   *
   * The steps scroll on the left (inactive dimmed); a page-pinned visual on the
   * right crossfades to the active step as it reaches the viewport centre. A
   * stage may carry several photos (image + imageSecondary): the pinned frame
   * pages through them by scroll progress WITHIN the stage — no timers. A stage
   * with no photo shows an abstract duotone préfelt placeholder. Scrolls with
   * the page — no nested scrollbar. Collapses to a single column with inline
   * media on mobile.
   *
   * `duotone` themes the stages (alternating steppe/shyrdak accents, big stage
   * numerals, warn treatment for triangle-alert checklist rows). `silkFrom` +
   * `onSilkChange` let the parent soak the section background once the first
   * silk stage activates.
   *
   * Requires no ancestor to establish a scroll container (use `overflow: clip`,
   * not `hidden`, on wrappers) so `position: sticky` resolves against the viewport.
   */
  import { asset } from '$app/paths';
  import LucideIcon from '$components/ui/LucideIcon.svelte';

  let {
    items,
    petroglyphs = ['/assets/petroglyphs/4.svg', '/assets/petroglyphs/9.svg'],
    duotone = false,
    silkFrom = undefined,
    onSilkChange = undefined
  }: {
    items: StickyItem[];
    petroglyphs?: [string, string] | null;
    duotone?: boolean;
    silkFrom?: number;
    onSilkChange?: (silk: boolean) => void;
  } = $props();

  let active = $state(0);
  let frame = $state(0);
  let blocks = $state<(HTMLElement | null)[]>([]);
  // Absolute URLs (CMS) pass through; root-relative paths get the base prefix.
  const src = (s: string) => (s.startsWith('http') ? s : asset(s));

  /** Flat pinned-frame list: each stage contributes its photos, or one placeholder. */
  const frames = $derived(
    items.flatMap((it): Frame[] => {
      const fs: Frame[] = [];
      if (it.image) fs.push({ url: it.image, alt: it.imageAlt ?? '', placeholder: false });
      if (it.imageSecondary)
        fs.push({ url: it.imageSecondary, alt: it.imageSecondaryAlt ?? '', placeholder: false });
      return fs.length > 0 ? fs : [{ url: '', alt: '', placeholder: true }];
    })
  );
  /** First frame index per stage (prefix offsets into `frames`). */
  const frameStart = $derived.by(() => {
    const starts: number[] = [];
    let offset = 0;
    for (const it of items) {
      starts.push(offset);
      offset += frameCount(it);
    }
    return starts;
  });

  function frameCount(it: StickyItem): number {
    return Math.max(1, (it.image ? 1 : 0) + (it.imageSecondary ? 1 : 0));
  }

  /** Per-stage duotone accent (steppe/shyrdak — the two contrast wools). */
  const accent = (i: number) => (duotone ? (i % 2 === 0 ? 'steppe' : 'shyrdak') : undefined);

  /** Warn rows (triangle-alert) get the tinted treatment under the duotone theme. */
  const plainRows = (it: StickyItem) =>
    duotone
      ? (it.checklist ?? []).filter((r) => r.icon !== 'triangle-alert')
      : (it.checklist ?? []);
  const warnRows = (it: StickyItem) =>
    duotone ? (it.checklist ?? []).filter((r) => r.icon === 'triangle-alert') : [];

  // Active stage: the last one whose top has crossed the viewport centre; the
  // pinned frame index derives from scroll progress within that stage.
  $effect(() => {
    const nodes = blocks.filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0 || typeof window === 'undefined') return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const center = window.innerHeight * 0.5;
      let next = 0;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getBoundingClientRect().top <= center) next = i;
      }
      const rect = nodes[next].getBoundingClientRect();
      const p = Math.max(0, Math.min(0.999, (center - rect.top) / Math.max(1, rect.height)));
      const count = frameCount(items[next]);
      active = next;
      frame = frameStart[next] + Math.min(count - 1, Math.floor(p * count));
      onSilkChange?.(silkFrom !== undefined && next >= silkFrom);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });
</script>

<section class="ssr" class:ssr--duotone={duotone}>
  {#if petroglyphs}
    <img class="petroglyph ssr-petro-a" src={asset(petroglyphs[0])} alt="" aria-hidden="true" />
    <img class="petroglyph ssr-petro-b" src={asset(petroglyphs[1])} alt="" aria-hidden="true" />
  {/if}

  <div class="ssr-track">
    {#each items as it, i (i)}
      <article
        class="ssr-stage"
        bind:this={blocks[i]}
        data-active={active === i}
        data-accent={accent(i)}
      >
        {#if duotone}
          <span class="ssr-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        {/if}
        <h2 class="ssr-title">{it.title}</h2>

        {#each it.narrative ?? [] as para (para)}
          <p class="ssr-body">{para}</p>
        {/each}

        {#if it.image}
          <div class="ssr-inline" class:ssr-inline--pair={Boolean(it.imageSecondary)}>
            <img src={src(it.image)} alt={it.imageAlt ?? ''} loading="lazy" />
            {#if it.imageSecondary}
              <img src={src(it.imageSecondary)} alt={it.imageSecondaryAlt ?? ''} loading="lazy" />
            {/if}
          </div>
        {/if}

        {#if it.checklistTitle || (it.checklist && it.checklist.length > 0)}
          <div class="ssr-check">
            {#if it.checklistTitle}<h3 class="ssr-check-title">{it.checklistTitle}</h3>{/if}
            {#if it.checklistIntro}<p class="ssr-check-intro">{it.checklistIntro}</p>{/if}
            {#if plainRows(it).length > 0}
              <ul class="ssr-check-list">
                {#each plainRows(it) as row, r (r)}
                  <li>
                    <span class="ssr-check-icon"><LucideIcon name={row.icon} size={19} /></span>
                    <span class="ssr-check-text">
                      <span class="ssr-check-term">{row.term}</span>
                      <span class="ssr-check-desc">{row.desc}</span>
                    </span>
                  </li>
                {/each}
              </ul>
            {/if}
            {#each warnRows(it) as row, r (r)}
              <p class="ssr-warn">
                <span class="ssr-check-icon"><LucideIcon name={row.icon} size={19} /></span>
                <span class="ssr-warn-text"><strong>{row.term}:</strong> {row.desc}</span>
              </p>
            {/each}
          </div>
        {/if}
      </article>
    {/each}
  </div>

  <div class="ssr-pinned" aria-hidden="true">
    <div class="ssr-frame">
      {#each frames as f, i (i)}
        {#if f.placeholder}
          <!-- A stage without a photo keeps a quiet paper frame. -->
          <div class="ssr-visual" data-active={frame === i}></div>
        {:else}
          <img
            class="ssr-visual"
            data-active={frame === i}
            src={src(f.url)}
            alt=""
            loading="lazy"
          />
        {/if}
      {/each}
      <ol class="ssr-dots">
        {#each frames, i}
          <li data-active={frame === i}></li>
        {/each}
      </ol>
    </div>
  </div>
</section>

<style>
  .ssr {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(40px, 6vw, 96px);
    max-width: var(--content-w);
    margin-inline: auto;

    /* Match the header nav + timeline container (var(--content-w) + var(--gutter)),
       and share the same vertical section rhythm as the other blocks. */
    padding-inline: var(--gutter);
    padding-block: var(--section-py);
  }

  .ssr-petro-a {
    top: 6%;
    right: -24px;
    width: clamp(120px, 12vw, 190px);
    transform: rotate(-8deg);
  }

  .ssr-petro-b {
    bottom: 8%;
    left: -20px;
    width: clamp(110px, 11vw, 170px);
    transform: rotate(10deg);
  }

  /* left column — scrolling steps */
  .ssr-track {
    min-width: 0;
  }

  .ssr-stage {
    min-height: 92vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 9vh 0;
    max-width: 52ch;
    opacity: 0.32;
    transition: opacity 0.45s ease;
  }

  .ssr-stage[data-active='true'] {
    opacity: 1;
  }

  /* Duotone theme: stages alternate the two contrast-wool accents. */
  .ssr-stage[data-accent='steppe'] {
    --ssr-acc: var(--steppe);
  }

  .ssr-stage[data-accent='shyrdak'] {
    --ssr-acc: var(--shyrdak);
  }

  .ssr-no {
    display: block;
    font-size: clamp(44px, 4.6vw, 72px);
    font-weight: 200;
    line-height: 0.9;
    letter-spacing: -0.02em;
    color: var(--ssr-acc, var(--shyrdak));
    margin-bottom: clamp(12px, 1.6vw, 20px);
  }

  .ssr-title {
    font-size: clamp(26px, 3vw, 40px);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.08;
    color: var(--ink);
    margin-bottom: 24px;
  }

  .ssr-body {
    font-size: 16.5px;
    line-height: 1.72;
    color: var(--ink-2, #57534c);
  }

  .ssr--duotone .ssr-body {
    font-weight: 300;
    font-style: italic;
    line-height: 1.75;
  }

  .ssr-body + .ssr-body {
    margin-top: 16px;
  }

  .ssr-inline {
    display: none;
  }

  /* how-to checklist */
  .ssr-check {
    margin-top: 34px;
    padding-top: 26px;
    border-top: 1px solid var(--line);
  }

  .ssr--duotone .ssr-check {
    border-top-color: var(--ink);
  }

  .ssr-check-title {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--ink);
  }

  .ssr-check-intro {
    margin-top: 8px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--muted);
  }

  .ssr-check-list {
    list-style: none;
    margin: 18px 0 0;
    padding: 0;
  }

  .ssr-check-list li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: start;
    padding: 15px 0;
    border-top: 1px solid var(--line);
  }

  .ssr-check-list li:first-child {
    border-top: 0;
    padding-top: 4px;
  }

  .ssr-check-icon {
    display: inline-flex;
    color: var(--ssr-acc, var(--shyrdak, #c84b31));
    margin-top: 2px;
  }

  .ssr-check-text {
    display: block;
    min-width: 0;
  }

  .ssr-check-term {
    display: block;
    font-weight: 700;
    font-size: 15.5px;
    color: var(--ink);
  }

  .ssr-check-desc {
    display: block;
    margin-top: 3px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-2, #57534c);
  }

  /* «Важно» — the triangle-alert checklist row gets a tinted left-rule block
     under the duotone theme (its icon/term/desc stay verbatim CMS rows). */
  .ssr-warn {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: start;
    margin-top: 20px;
    padding: 15px 17px;
    border-left: 2px solid var(--ssr-acc, var(--shyrdak));
    background: color-mix(in srgb, var(--ssr-acc, var(--shyrdak)) 6%, transparent);
  }

  .ssr-warn .ssr-check-icon {
    margin-top: 1px;
  }

  .ssr-warn-text {
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-2);
  }

  .ssr-warn-text strong {
    font-weight: 700;
    color: var(--ink);
  }

  /* right column — pinned paging visual */
  .ssr-pinned {
    min-width: 0;
  }

  .ssr-frame {
    position: sticky;
    top: calc(var(--nav-h) + 6vh);
    height: 78vh;
    overflow: hidden;
    background: var(--paper-2);
    border-radius: 12px;
  }

  .ssr-visual {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.03);
    transition:
      opacity 0.7s ease,
      transform 1.2s ease;
  }

  .ssr-visual[data-active='true'] {
    opacity: 1;
    transform: scale(1);
  }

  .ssr-dots {
    position: absolute;
    right: 14px;
    bottom: 14px;
    display: flex;
    gap: 6px;
    list-style: none;
    z-index: 2;
  }

  .ssr-dots li {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.55);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
    transition:
      width 0.3s,
      background 0.3s;
  }

  .ssr-dots li[data-active='true'] {
    width: 18px;
    border-radius: 3px;
    background: #fff;
  }

  @media (max-width: 899px) {
    .ssr {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .ssr-pinned {
      display: none;
    }

    .ssr-stage {
      min-height: 0;
      padding: clamp(36px, 8vw, 64px) 0;
      max-width: none;
      opacity: 1;
    }

    .ssr-inline {
      display: block;
      margin: 6px 0 24px;
      overflow: hidden;
      aspect-ratio: 4 / 3;
    }

    .ssr-inline img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* A stage pair stacks one photo after another — a 2-up grid is unreadable
       on a phone. */
    .ssr-inline--pair {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      aspect-ratio: auto;
    }

    .ssr-inline--pair img {
      height: auto;
      object-fit: unset;
      border-radius: 8px;
    }

    /* Duotone: inline photos keep their natural aspect (uncropped plates). */
    .ssr--duotone .ssr-inline {
      aspect-ratio: auto;
      border-radius: 8px;
    }

    .ssr--duotone .ssr-inline img {
      height: auto;
      object-fit: unset;
    }

    .ssr-no {
      font-size: clamp(40px, 9vw, 56px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ssr-visual {
      transition: opacity 0.2s ease;
      transform: none;
    }

    .ssr-visual[data-active='true'] {
      transform: none;
    }

    .ssr-stage {
      opacity: 1;
    }
  }
</style>
