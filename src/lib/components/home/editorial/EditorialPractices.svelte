<script lang="ts">
  import { resolve, asset } from '$app/paths';
  import { m } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import type { PracticeSummary } from '$lib/types/datocms';
  import { categoryLabel } from '$lib/categories';
  import { rise, rv } from '$lib/actions/editorialReveal';
  import CmsImage from '$cms/CmsImage.svelte';

  let { practices, locale }: { practices: PracticeSummary[]; locale: Locale } = $props();

  const practicesHref = $derived(resolve(`/${locale}/practices/`));
  function practiceHref(slug: string): string {
    return resolve(`/${locale}/practices/${slug}/`);
  }

  // Only practices that carry a cover can appear in the crossfading preview; the
  // name list still shows every practice. The first practice is the resting one.
  const withCover = $derived(practices.filter((p) => p.coverImage));
  const firstKey = $derived(withCover[0]?.slug ?? null);

  // Component-local hover state — the active preview key. Falls back to the
  // first practice when the pointer leaves the list.
  let activeKey = $state<string | null>(null);
  const shownKey = $derived(activeKey ?? firstKey);

  function activate(slug: string) {
    // Only switch the preview if that practice actually has a cover image.
    if (withCover.some((p) => p.slug === slug)) activeKey = slug;
  }
  function reset() {
    activeKey = null;
  }
</script>

<section class="works" id="practices">
  <img
    class="petroglyph petro-works"
    src={asset('/assets/petroglyphs/7.svg')}
    alt=""
    aria-hidden="true"
  />
  <div class="wrap">
    <header class="shead">
      <div>
        <h2 data-rise use:rise><span class="rise-inner">{m.practices_title()}</span></h2>
        <p class="shead-lede" data-rise use:rise>
          <span class="rise-inner">{m.practices_lede()}</span>
        </p>
      </div>
    </header>

    <div class="practices">
      <div class="pf-col">
        {#if practices.length}
          <!-- eslint-disable svelte/no-navigation-without-resolve -- practiceHref() returns a resolve()'d path -->
          <ol class="pf-list" onmouseleave={reset}>
            {#each practices as practice, i (practice.slug)}
              {@const cat = categoryLabel(practice.category)}
              <li>
                <a
                  class="pf-item"
                  href={practiceHref(practice.slug)}
                  onmouseenter={() => activate(practice.slug)}
                  onfocus={() => activate(practice.slug)}
                >
                  <span class="pf-name" data-rise use:rise style={`--d:${i * 0.08}s`}>
                    <span class="rise-inner">
                      {practice.title} <span class="pf-arrow" aria-hidden="true">→</span>
                    </span>
                  </span>
                  {#if cat}
                    <span class="pf-cat">{cat}</span>
                  {/if}
                </a>
              </li>
            {/each}
          </ol>
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        {/if}

        <div class="pf-cta" data-rise use:rise>
          <span class="rise-inner">
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- practicesHref is resolve()'d -->
            <a href={practicesHref}>{m.home_practices_cta()} <span class="arw">→</span></a>
          </span>
        </div>
      </div>

      {#if withCover.length}
        <figure class="pf-media" use:rv={'right'}>
          {#each withCover as practice (practice.slug)}
            <div class="pf-img" class:is-active={practice.slug === shownKey}>
              {#if practice.coverImage}
                <CmsImage
                  image={practice.coverImage}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  class="pf-img-el"
                />
              {/if}
            </div>
          {/each}
        </figure>
      {/if}
    </div>
  </div>
</section>

<style>
  .works {
    position: relative;
    padding: clamp(32px, 4vw, 60px) 0 var(--section-pad);
  }

  .wrap {
    position: relative;
    z-index: 1;
    max-width: var(--home-w);
    margin: 0 auto;
    padding: 0 var(--gutter);
  }

  .petro-works {
    bottom: 44px;
    right: 4.5%;
    width: clamp(120px, 12vw, 190px);
    opacity: 0.06;
    transform: rotate(9deg);
  }

  /* ── Section head ── */
  .shead {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    gap: 20px;
    margin-bottom: clamp(32px, 4vw, 56px);
  }

  .shead h2 {
    display: inline-block;
    font-family: Jost, sans-serif;
    font-weight: 600;
    font-size: clamp(30px, 3.4vw, 52px);
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1;
  }

  .shead-lede {
    display: inline-block;
    max-width: 52ch;
    margin-top: 14px;
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--ink-2);
  }

  /* ── Practices index ── */
  .practices {
    display: grid;
    grid-template-columns: 1fr 0.78fr;
    gap: clamp(32px, 5vw, 88px);
    align-items: stretch;
  }

  .pf-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: clamp(40px, 6vw, 80px);
  }

  .pf-list {
    display: flex;
    flex-direction: column;
    gap: clamp(2px, 0.6vw, 10px);
    list-style: none;
  }

  .pf-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
    padding: clamp(8px, 1vw, 16px) 0;
    color: var(--ink);
    transition: color 0.4s ease;
  }

  .pf-name {
    display: inline-block;
    font-family: Jost, sans-serif;
    font-weight: 400;
    font-size: clamp(34px, 5vw, 76px);
    letter-spacing: -0.025em;
    line-height: 1.06;
    color: inherit;
    padding-bottom: 0.06em;
    transition: transform 0.5s var(--ease);
  }

  .pf-arrow {
    color: var(--shyrdak);
    font-size: 0.42em;
    opacity: 0;
    transform: translateX(-12px);
    transition:
      opacity 0.35s ease,
      transform 0.5s var(--ease);
  }

  .pf-cat {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-8px);
    transition:
      opacity 0.35s ease,
      transform 0.4s var(--ease);
  }

  .pf-list:hover .pf-item {
    color: color-mix(in srgb, var(--ink) 24%, var(--paper));
  }

  .pf-list:hover .pf-item:hover {
    color: var(--ink);
  }

  .pf-item:hover .pf-name {
    transform: translateX(clamp(10px, 1.4vw, 24px));
  }

  .pf-item:hover .pf-arrow,
  .pf-item:hover .pf-cat {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Crossfading preview ── */
  .pf-media {
    position: relative;
    aspect-ratio: 4 / 5;
    background: var(--paper-2);
    overflow: hidden;
  }

  .pf-img {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scale(1.05);
    transition:
      opacity 0.6s ease,
      transform 1.3s var(--ease);
  }

  .pf-img.is-active {
    opacity: 1;
    transform: scale(1);
  }

  .pf-img :global(.pf-img-el) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.97);
  }

  /* ── CTA ── */
  .pf-cta {
    display: inline-block;
    margin-top: 0;
  }

  .pf-cta a {
    display: inline-flex;
    gap: 16px;
    align-items: center;
    font-family: Jost, sans-serif;
    font-weight: 400;
    font-size: clamp(24px, 3vw, 44px);
    letter-spacing: -0.02em;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    padding-bottom: 8px;
    transition: border-color 0.25s ease;
  }

  .pf-cta a:hover {
    border-color: var(--ink);
  }

  .arw {
    transition: transform 0.25s ease;
  }

  .pf-cta a:hover .arw {
    transform: translateX(8px);
  }

  @media (max-width: 1024px) {
    .practices {
      grid-template-columns: 1fr;
      gap: clamp(24px, 4vw, 40px);
    }

    .pf-media {
      order: -1;
      aspect-ratio: 3 / 2;
    }

    .pf-col {
      justify-content: flex-start;
      gap: 28px;
    }
  }

  @media (max-width: 640px) {
    .shead {
      grid-template-columns: 1fr;
    }
  }
</style>
