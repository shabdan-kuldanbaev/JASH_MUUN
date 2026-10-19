<script lang="ts" module>
  export interface StickyChecklistItem {
    icon: string;
    term: string;
    desc: string;
  }
  export interface StickyItem {
    title: string;
    /** Full narrative in source order — a string is a paragraph, an array a bullet list. */
    narrative?: (string | string[])[];
    checklistTitle?: string;
    checklistIntro?: string;
    checklist?: StickyChecklistItem[];
    /** Empty string → the pinned frame keeps a quiet paper placeholder. */
    image: string;
    imageAlt?: string;
    /** Second frame — the pinned visual pages through the stage's photos on scroll. */
    imageSecondary?: string;
    imageSecondaryAlt?: string;
    /** Stage film — paged after the photos; muted loop in the pinned frame. */
    video?: string;
    videoPoster?: string;
    /** Zone mood for this stage — surfaced to the parent via onMoodChange. */
    mood?: string;
  }

  interface Frame {
    /** `placeholder` — no media for this stage, keep a quiet paper frame. */
    kind: 'image' | 'video' | 'placeholder';
    url: string;
    alt: string;
    poster?: string;
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
   * with no photo keeps a quiet paper frame. Scrolls with the page — no nested
   * scrollbar. Collapses to a single column with inline media on mobile.
   *
   * `theme` (any non-empty token) turns on the themed treatment — italic
   * narrative, tinted `triangle-alert` warn rows, and a per-theme accent palette
   * applied via the `.ssr--theme-<name>` class (steppe/shyrdak alternation for
   * `duotone`, single clay for `ember`). Each stage may carry a `mood`; the
   * active stage's mood is surfaced through `onMoodChange` so the parent can
   * soak the section background (the mood zone can start AND end mid-ritual).
   *
   * Requires no ancestor to establish a scroll container (use `overflow: clip`,
   * not `hidden`, on wrappers) so `position: sticky` resolves against the viewport.
   */
  import { asset } from '$app/paths';
  import { m } from '$i18n';
  import LucideIcon from '$components/ui/LucideIcon.svelte';

  let {
    items,
    petroglyphs = ['/assets/petroglyphs/4.svg', '/assets/petroglyphs/9.svg'],
    theme = undefined,
    onMoodChange = undefined
  }: {
    items: StickyItem[];
    petroglyphs?: [string, string] | null;
    theme?: string;
    onMoodChange?: (mood: string | null) => void;
  } = $props();

  const themed = $derived(Boolean(theme));

  let active = $state(0);
  let frame = $state(0);
  let blocks = $state<(HTMLElement | null)[]>([]);
  // Absolute URLs (CMS) pass through; root-relative paths get the base prefix.
  const src = (s: string) => (s.startsWith('http') ? s : asset(s));

  /** Flat pinned-frame list: each stage contributes its photos + film, or one placeholder. */
  const frames = $derived(
    items.flatMap((it): Frame[] => {
      const fs: Frame[] = [];
      if (it.image) fs.push({ kind: 'image', url: it.image, alt: it.imageAlt ?? '' });
      if (it.imageSecondary)
        fs.push({ kind: 'image', url: it.imageSecondary, alt: it.imageSecondaryAlt ?? '' });
      if (it.video) fs.push({ kind: 'video', url: it.video, alt: '', poster: it.videoPoster });
      return fs.length > 0 ? fs : [{ kind: 'placeholder', url: '', alt: '' }];
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
    return Math.max(1, (it.image ? 1 : 0) + (it.imageSecondary ? 1 : 0) + (it.video ? 1 : 0));
  }

  // Pinned films: the active one loops muted (no autoplay under reduced motion);
  // sound is opt-in via the frame toggle and starts playback if it was paused.
  let videos = $state<(HTMLVideoElement | null)[]>([]);
  let sound = $state(false);
  const activeIsVideo = $derived(frames[frame]?.kind === 'video');

  $effect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    videos.forEach((v, i) => {
      if (!v) return;
      if (i !== frame) {
        v.pause();
        return;
      }
      v.muted = !sound;
      if (sound || !still) v.play().catch(() => {});
    });
  });

  /** Warn rows (triangle-alert) get the tinted treatment under any theme. */
  const plainRows = (it: StickyItem) =>
    themed ? (it.checklist ?? []).filter((r) => r.icon !== 'triangle-alert') : (it.checklist ?? []);
  const warnRows = (it: StickyItem) =>
    themed ? (it.checklist ?? []).filter((r) => r.icon === 'triangle-alert') : [];

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
      onMoodChange?.(items[next]?.mood ?? null);
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

<section class="ssr {theme ? `ssr--theme-${theme}` : ''}" class:ssr--themed={themed}>
  {#if petroglyphs}
    <img class="petroglyph ssr-petro-a" src={asset(petroglyphs[0])} alt="" aria-hidden="true" />
    <img class="petroglyph ssr-petro-b" src={asset(petroglyphs[1])} alt="" aria-hidden="true" />
  {/if}

  <div class="ssr-track">
    {#each items as it, i (i)}
      <article class="ssr-stage" bind:this={blocks[i]} data-active={active === i}>
        <h2 class="ssr-title">{it.title}</h2>

        {#each it.narrative ?? [] as block, b (b)}
          {#if Array.isArray(block)}
            <ul class="ssr-list">
              {#each block as li, l (l)}<li>{li}</li>{/each}
            </ul>
          {:else}
            <p class="ssr-body">{block}</p>
          {/if}
        {/each}

        {#if it.image}
          <div class="ssr-inline" class:ssr-inline--pair={Boolean(it.imageSecondary)}>
            <img src={src(it.image)} alt={it.imageAlt ?? ''} loading="lazy" />
            {#if it.imageSecondary}
              <img src={src(it.imageSecondary)} alt={it.imageSecondaryAlt ?? ''} loading="lazy" />
            {/if}
          </div>
        {/if}
        {#if it.video}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            class="ssr-inline-film"
            src={src(it.video)}
            poster={it.videoPoster}
            controls
            playsinline
            preload="none"
          ></video>
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

  <div class="ssr-pinned">
    <div class="ssr-frame" class:ssr-frame--film={activeIsVideo}>
      {#each frames as f, i (i)}
        {#if f.kind === 'placeholder'}
          <!-- A stage without a photo keeps a quiet paper frame. -->
          <div class="ssr-visual" data-active={frame === i} aria-hidden="true"></div>
        {:else if f.kind === 'video'}
          <div class="ssr-visual ssr-film" data-active={frame === i} aria-hidden="true">
            {#if f.poster}<img class="ssr-film-bg" src={f.poster} alt="" loading="lazy" />{/if}
            <video
              bind:this={videos[i]}
              src={src(f.url)}
              poster={f.poster}
              muted
              loop
              playsinline
              preload="none"
            ></video>
          </div>
        {:else}
          <img
            class="ssr-visual"
            data-active={frame === i}
            src={src(f.url)}
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
        {/if}
      {/each}
      {#if activeIsVideo}
        <button
          type="button"
          class="ssr-sound"
          aria-pressed={sound}
          aria-label={sound ? m.video_sound_off() : m.video_sound_on()}
          onclick={() => (sound = !sound)}
        >
          <LucideIcon name={sound ? 'volume-2' : 'volume-x'} size={18} />
        </button>
      {/if}
      <ol class="ssr-dots" aria-hidden="true">
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

  /* Theme accent registry — add a theme = add one rule here; the parser passes
     its hero-kicker token through as `.ssr--theme-<name>`. `duotone` alternates
     the two contrast wools; `ember` is a single earthy accent. */
  .ssr--theme-ember .ssr-stage {
    --ssr-acc: var(--clay);
  }

  .ssr--theme-dye .ssr-stage {
    --ssr-acc: var(--steppe);
  }

  /* `kyl` — horsehair accent */
  .ssr--theme-kyl .ssr-stage {
    --ssr-acc: var(--horsehair);
  }

  .ssr--theme-duotone .ssr-stage:nth-child(odd) {
    --ssr-acc: var(--steppe);
  }

  .ssr--theme-duotone .ssr-stage:nth-child(even) {
    --ssr-acc: var(--shyrdak);
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

  .ssr--themed .ssr-body {
    font-weight: 300;
    font-style: italic;
    line-height: 1.75;
  }

  /* `kyl` — documentary prose stays upright (overrides the themed italic). */
  .ssr--theme-kyl .ssr-body {
    font-style: normal;
    font-weight: 400;
  }

  .ssr-body + .ssr-body {
    margin-top: 16px;
  }

  /* Narrative bullet list (`- ` lines in the CMS body) — short accent dashes. */
  .ssr-list {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
  }

  .ssr-list + .ssr-body,
  .ssr-body + .ssr-list {
    margin-top: 14px;
  }

  .ssr-list li {
    position: relative;
    padding: 4px 0 4px 26px;
    font-size: 16px;
    line-height: 1.6;
    color: var(--ink-2);
  }

  .ssr-list li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: calc(4px + 0.8em);
    width: 12px;
    height: 1.5px;
    background: var(--ssr-acc, var(--shyrdak));
  }

  .ssr-inline,
  .ssr-inline-film {
    display: none;
  }

  /* how-to checklist */
  .ssr-check {
    margin-top: 34px;
    padding-top: 26px;
    border-top: 1px solid var(--line);
  }

  .ssr--themed .ssr-check {
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

  /* Term-less checklist rows (icon||desc, e.g. the dyeing steps): drop the empty
     bold line so the row reads as a clean icon + description. */
  .ssr-check-term:empty {
    display: none;
  }

  .ssr-check-desc {
    display: block;
    margin-top: 3px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-2, #57534c);
  }

  /* «Важно» — the triangle-alert checklist row gets a tinted left-rule block
     under any theme (its icon/term/desc stay verbatim CMS rows). */
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

  /* Film frame: vertical footage letterboxed (contain) over a blurred, darkened poster. */
  .ssr-frame--film {
    background: var(--ink);
  }

  .ssr-film {
    background: var(--ink);
  }

  .ssr-film video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .ssr-film-bg {
    position: absolute;
    inset: -40px;
    width: calc(100% + 80px);
    height: calc(100% + 80px);
    object-fit: cover;
    filter: blur(28px) brightness(0.45) saturate(0.8);
  }

  .ssr-sound {
    position: absolute;
    left: 14px;
    bottom: 12px;
    z-index: 3;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 50%;
    color: #fff;
    background: rgba(26, 26, 26, 0.55);
    backdrop-filter: blur(6px);
    cursor: pointer;
    transition: background 0.2s;
  }

  .ssr-sound:hover {
    background: rgba(26, 26, 26, 0.8);
  }

  .ssr-sound:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
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

    .ssr-inline-film {
      display: block;
      width: auto;
      max-width: 100%;
      max-height: 78svh;
      margin: 6px auto 24px;
      border-radius: 8px;
      background: var(--ink);
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

    /* Themed practices show inline photos at their natural aspect (uncropped). */
    .ssr--themed .ssr-inline {
      aspect-ratio: auto;
      border-radius: 8px;
    }

    .ssr--themed .ssr-inline img {
      height: auto;
      object-fit: unset;
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
