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
    image: string;
    imageAlt?: string;
  }
</script>

<script lang="ts">
  /**
   * StickyScrollReveal — reusable sticky-scroll reveal (Aceternity pattern).
   *
   * The steps scroll on the left (inactive dimmed); a page-pinned visual on the
   * right crossfades to the active step as it reaches the viewport centre. Scrolls
   * with the page — no nested scrollbar. Collapses to a single column with inline
   * media on mobile.
   *
   * Requires no ancestor to establish a scroll container (use `overflow: clip`,
   * not `hidden`, on wrappers) so `position: sticky` resolves against the viewport.
   */
  import { asset } from '$app/paths';
  import LucideIcon from '$components/ui/LucideIcon.svelte';

  let {
    items,
    petroglyphs = ['/assets/petroglyphs/4.svg', '/assets/petroglyphs/9.svg']
  }: { items: StickyItem[]; petroglyphs?: [string, string] | null } = $props();

  let active = $state(0);
  let blocks = $state<(HTMLElement | null)[]>([]);
  // Absolute URLs (CMS) pass through; root-relative paths get the base prefix.
  const src = (s: string) => (s.startsWith('http') ? s : asset(s));

  $effect(() => {
    const nodes = blocks.filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = blocks.indexOf(entry.target as HTMLElement);
            if (i >= 0) active = i;
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    for (const n of nodes) observer.observe(n);
    return () => observer.disconnect();
  });
</script>

<section class="ssr">
  {#if petroglyphs}
    <img class="petroglyph ssr-petro-a" src={asset(petroglyphs[0])} alt="" aria-hidden="true" />
    <img class="petroglyph ssr-petro-b" src={asset(petroglyphs[1])} alt="" aria-hidden="true" />
  {/if}

  <div class="ssr-track">
    {#each items as it, i (i)}
      <article class="ssr-stage" bind:this={blocks[i]} data-active={active === i}>
        <h2 class="ssr-title">{it.title}</h2>

        {#each it.narrative ?? [] as para (para)}
          <p class="ssr-body">{para}</p>
        {/each}

        <div class="ssr-inline">
          <img src={src(it.image)} alt={it.imageAlt ?? ''} loading="lazy" />
        </div>

        {#if it.checklistTitle || (it.checklist && it.checklist.length > 0)}
          <div class="ssr-check">
            {#if it.checklistTitle}<h3 class="ssr-check-title">{it.checklistTitle}</h3>{/if}
            {#if it.checklistIntro}<p class="ssr-check-intro">{it.checklistIntro}</p>{/if}
            {#if it.checklist && it.checklist.length > 0}
              <ul class="ssr-check-list">
                {#each it.checklist as row, r (r)}
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
          </div>
        {/if}
      </article>
    {/each}
  </div>

  <div class="ssr-pinned" aria-hidden="true">
    <div class="ssr-frame">
      {#each items as it, i (i)}
        <img
          class="ssr-visual"
          data-active={active === i}
          src={src(it.image)}
          alt=""
          loading="lazy"
        />
      {/each}
      <ol class="ssr-dots">
        {#each items, i}
          <li data-active={active === i}></li>
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
    color: var(--shyrdak, #c84b31);
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

  /* right column — pinned crossfading visual */
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
