<script lang="ts">
  import { page } from '$app/state';
  import { resolve, asset } from '$app/paths';
  import { m, LOCALES } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import { editorialHeader } from '$lib/editorialHeader.svelte';

  // `onLight` forces the over-content treatment from first paint (content pages have no dark hero) to avoid a white flash.
  let { locale, onLight = false }: { locale: Locale; onLight?: boolean } = $props();

  const path = $derived(page.url.pathname);
  const pathFromLocale = $derived(path.slice(path.indexOf(`/${locale}`)));

  const homeHref = $derived(resolve(`/${locale}/`));
  const practicesHref = $derived(resolve(`/${locale}/practices/`));
  const articlesHref = $derived(resolve(`/${locale}/articles/`));
  const galleryHref = $derived(resolve(`/${locale}/gallery/`));

  /** Localized clone of the current path for a language switch (mirrors Header.svelte). */
  function localePath(target: Locale): string {
    const localized = pathFromLocale.replace(/^\/[^/]+(?=\/|$)/, `/${target}`);
    return resolve((localized || `/${target}/`) as `/${string}`);
  }

  const localeLabels: Record<Locale, string> = {
    ru: 'Русский',
    ky: 'Кыргызча',
    en: 'English',
    fr: 'Français'
  };

  /* Language slide-over */
  let langOpen = $state(false);
  let toggleEl = $state<HTMLButtonElement | null>(null);
  let optionEls = $state<HTMLAnchorElement[]>([]);
  const currentIndex = $derived(LOCALES.indexOf(locale));

  /* Curved-edge reveal: the panel's left boundary is an SVG path whose middle
     control point bulges out mid-sweep and flattens as it reaches the edge. */
  let pathEl = $state<SVGPathElement | null>(null);
  let edgeX = 0;
  let edgeRaf = 0;

  function panelPath(x: number, bulge: number): string {
    const W = window.innerWidth;
    const H = window.innerHeight;
    return `M${x} 0 H${W} V${H} H${x} Q${x - bulge} ${H / 2} ${x} 0 Z`;
  }

  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function runPanel(open: boolean) {
    if (!pathEl) return;
    cancelAnimationFrame(edgeRaf);
    const W = window.innerWidth;
    const to = open ? 0 : W;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      edgeX = to;
      pathEl.setAttribute('d', panelPath(edgeX, 0));
      return;
    }
    const from = edgeX;
    const bulge = Math.min(W * 0.2, 300);
    const dur = open ? 820 : 620;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      edgeX = from + (to - from) * easeInOutCubic(p);
      pathEl?.setAttribute('d', panelPath(edgeX, bulge * Math.sin(p * Math.PI)));
      if (p < 1) edgeRaf = requestAnimationFrame(tick);
    };
    edgeRaf = requestAnimationFrame(tick);
  }

  let edgePrimed = false;
  $effect(() => {
    const open = langOpen;
    if (!pathEl) return;
    if (!edgePrimed) {
      edgePrimed = true;
      edgeX = window.innerWidth;
      pathEl.setAttribute('d', panelPath(edgeX, 0));
      if (!open) return;
    }
    runPanel(open);
  });

  function onResize() {
    if (!pathEl) return;
    if (!langOpen) edgeX = window.innerWidth;
    pathEl.setAttribute('d', panelPath(edgeX, 0));
  }

  function openLang() {
    langOpen = true;
    requestAnimationFrame(() => optionEls[currentIndex >= 0 ? currentIndex : 0]?.focus());
  }

  function closeLang(returnFocus = false) {
    langOpen = false;
    if (returnFocus) toggleEl?.focus();
  }

  function toggleLang() {
    if (langOpen) closeLang(true);
    else openLang();
  }

  function focusOption(index: number) {
    const n = LOCALES.length;
    const wrapped = ((index % n) + n) % n;
    optionEls[wrapped]?.focus();
  }

  function onMenuKeydown(e: KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusOption(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusOption(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusOption(0);
        break;
      case 'End':
        e.preventDefault();
        focusOption(LOCALES.length - 1);
        break;
      case 'Enter':
      case ' ':
        closeLang();
        break;
      case 'Escape':
        e.preventDefault();
        closeLang(true);
        break;
      case 'Tab':
        closeLang();
        break;
    }
  }

  function onToggleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLang();
    } else if (e.key === 'Escape') {
      closeLang();
    }
  }

  function onWindowKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && langOpen) closeLang(true);
  }

  // Lock page scroll (pauses Lenis via its body-attr observer) while the
  // full-screen language panel is open.
  $effect(() => {
    document.body.toggleAttribute('data-panel-open', langOpen);
    return () => document.body.removeAttribute('data-panel-open');
  });

  const isPractices = $derived(path.includes('/practices'));
  const isArticles = $derived(path.includes('/articles'));
  const isGallery = $derived(path.includes('/gallery'));
  const isHome = $derived(!isPractices && !isArticles && !isGallery);
</script>

<svelte:window onkeydown={onWindowKeydown} onresize={onResize} />

<header
  class="nav"
  class:nav--onlight={onLight || editorialHeader.onLight}
  class:nav--hidden={editorialHeader.hidden}
>
  <div class="nav-inner">
    <!-- Logos: mark → home, ALIPH → foundation site, EU → static -->
    <div class="nav-logos">
      <span class="logo logo--main">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- homeHref is already resolve()'d -->
        <a class="logo-rise" href={homeHref} aria-label={m.nav_brand_home()}>
          <img
            class="logo-alt logo-alt--hero"
            src={asset('/assets/main-logo-hero.svg')}
            alt="Jash Muun"
          />
          <img
            class="logo-alt logo-alt--light"
            src={asset('/assets/main-logo.svg')}
            alt=""
            aria-hidden="true"
          />
        </a>
      </span>
      <span class="logo logo--aliph">
        <a
          class="logo-rise"
          href="https://www.aliph-foundation.org"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={m.nav_support_partner()}
        >
          <img src={asset('/assets/supporting-logo.svg')} alt="ALIPH" />
        </a>
      </span>
      <span class="logo">
        <span class="logo-rise"><img src={asset('/assets/eu-logo.svg')} alt="EU" /></span>
      </span>
    </div>

    <nav class="nav-links" aria-label="Primary">
      <!-- eslint-disable svelte/no-navigation-without-resolve -- hrefs are resolve()'d above -->
      <a
        class="nav-item"
        class:is-active={isHome}
        href={homeHref}
        aria-current={isHome ? 'page' : undefined}
      >
        <span class="nav-rise">{m.nav_home()}</span>
      </a>
      <a
        class="nav-item"
        class:is-active={isPractices}
        href={practicesHref}
        aria-current={isPractices ? 'page' : undefined}
      >
        <span class="nav-rise">{m.nav_practices()}</span>
      </a>
      <a
        class="nav-item"
        class:is-active={isArticles}
        href={articlesHref}
        aria-current={isArticles ? 'page' : undefined}
      >
        <span class="nav-rise">{m.nav_articles()}</span>
      </a>
      <a
        class="nav-item"
        class:is-active={isGallery}
        href={galleryHref}
        aria-current={isGallery ? 'page' : undefined}
      >
        <span class="nav-rise">{m.nav_archive()}</span>
      </a>
      <!-- eslint-enable svelte/no-navigation-without-resolve -->

      <div class="lang" class:is-open={langOpen}>
        <button
          class="nav-item lang-toggle"
          bind:this={toggleEl}
          onclick={toggleLang}
          onkeydown={onToggleKeydown}
          aria-haspopup="dialog"
          aria-expanded={langOpen}
          aria-label={m.nav_language()}
        >
          <span class="nav-rise">{locale.toUpperCase()}</span>
        </button>
      </div>
    </nav>
  </div>
</header>

<!-- Full-screen language slide-over — curved SVG edge that flattens as it lands -->
<div class="lang-panel" class:is-open={langOpen} aria-hidden={!langOpen}>
  <svg class="lang-shape" preserveAspectRatio="none" aria-hidden="true">
    <path bind:this={pathEl} d="" />
  </svg>
  <div class="lang-content">
    <button class="lang-close" onclick={() => closeLang(true)} aria-label={m.nav_language()}>
      <span class="lang-x" aria-hidden="true"></span>
    </button>
    <nav class="lang-list" aria-label={m.nav_language()}>
      <!-- eslint-disable svelte/no-navigation-without-resolve -- localePath() returns a resolve()'d path -->
      {#each LOCALES as l, i (l)}
        <a
          href={localePath(l)}
          class="lang-choice"
          class:is-current={l === locale}
          aria-current={l === locale ? 'true' : undefined}
          tabindex={langOpen ? 0 : -1}
          bind:this={optionEls[i]}
          onclick={() => closeLang()}
          onkeydown={(e) => onMenuKeydown(e, i)}
        >
          {localeLabels[l] ?? l.toUpperCase()}
        </a>
      {/each}
      <!-- eslint-enable svelte/no-navigation-without-resolve -->
    </nav>
  </div>
</div>

<style>
  /* Header — always transparent; text/logos flip over content */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-h);
    z-index: 40;
    background: transparent;
    transition:
      transform 0.42s ease 0.16s,
      background-color 0.3s ease;
  }

  /* Flat paper backing once the nav sits over content (incl. on reverse scroll). */
  .nav--onlight {
    background: var(--paper);
  }

  .nav--hidden {
    transform: translateY(-100%);
    transition: transform 0.3s ease 0s;
  }

  .nav--hidden:focus-within {
    transform: none;
  }

  .nav-inner {
    max-width: var(--home-w);
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--gutter);
  }

  /* Logos (left) */
  .nav-logos {
    position: relative;
    display: flex;
    gap: 14px;
    align-items: center;
    height: 76px;
  }

  .logo {
    height: 76px;
    flex-shrink: 0;
    overflow: hidden; /* mask for the rise-in on load */
  }

  .logo-rise {
    display: block;
    height: 100%;
  }

  .logo img {
    height: 100%;
    width: auto;
    display: block;
  }

  /* ALIPH mark: white over hero → brand colour over content. */
  .logo--aliph img {
    filter: brightness(0) invert(1);
    transition: filter 0.32s ease;
  }

  .nav--onlight .logo--aliph img {
    filter: none;
  }

  /* Main mark: cross-fade white hero variant to the standard mark */
  .logo--main .logo-rise {
    position: relative;
  }

  .logo--main .logo-alt {
    display: block;
    height: 100%;
    width: auto;
    transition: opacity 0.32s ease;
  }

  .logo--main .logo-alt--light {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
  }

  .nav--onlight .logo--main .logo-alt--hero {
    opacity: 0;
  }

  .nav--onlight .logo--main .logo-alt--light {
    opacity: 1;
  }

  /* Nav links (right) */
  .nav-links {
    display: flex;
    gap: 20px;
    align-items: baseline;
  }

  .nav-item {
    position: relative;
    overflow: hidden; /* mask for the rise-in of the label */
    font-size: 12.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fff;
    font-weight: 400;
    font-family: inherit;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0 6px;
    transition: color 0.25s ease;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.28);
  }

  .nav-item::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: currentcolor;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.4s var(--ease);
  }

  .nav-item:hover::after,
  .nav-item.is-active::after {
    transform: scaleX(1);
  }

  /* Over light content — black text, no shadow */
  .nav--onlight .nav-item {
    color: #000;
    text-shadow: none;
  }

  .nav-rise {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  /* Slide-in-from-below reveal; gated on motion allowed so reduced-motion needs no override. */
  @media (prefers-reduced-motion: no-preference) {
    .logo-rise,
    .nav-rise {
      transform: translateY(120%);
      transition: transform 0.8s var(--ease);
      will-change: transform;
    }

    :global(body.is-loaded) .logo-rise,
    :global(body.is-loaded) .nav-rise {
      transform: translateY(0);
    }

    .nav-logos .logo:nth-child(1) .logo-rise {
      transition-delay: 0.32s;
    }

    .nav-logos .logo:nth-child(2) .logo-rise {
      transition-delay: 0.39s;
    }

    .nav-logos .logo:nth-child(3) .logo-rise {
      transition-delay: 0.46s;
    }

    .nav-links .nav-item:nth-child(1) .nav-rise {
      transition-delay: 0.52s;
    }

    .nav-links .nav-item:nth-child(2) .nav-rise {
      transition-delay: 0.59s;
    }

    .nav-links .nav-item:nth-child(3) .nav-rise {
      transition-delay: 0.66s;
    }

    .nav-links .nav-item:nth-child(4) .nav-rise {
      transition-delay: 0.73s;
    }

    /* .lang:nth-child(5) matches the .nav-item:nth-child specificity above so the delays stay in ascending order. */
    .nav-links .lang:nth-child(5) .nav-rise {
      transition-delay: 0.8s;
    }
  }

  /* Language dropdown */
  .lang {
    position: relative;
    display: inline-flex;
  }

  .lang-toggle {
    display: inline-flex;
    align-items: center;
  }

  /* Full-screen language slide-over — the SVG path animates the curved edge */
  .lang-panel {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
  }

  .lang-panel.is-open {
    pointer-events: auto;
  }

  .lang-shape {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .lang-shape path {
    fill: var(--paper);
  }

  .lang-content {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .lang-panel.is-open .lang-content {
    opacity: 1;
    transition: opacity 0.45s ease 0.35s;
  }

  .lang-close {
    position: absolute;
    z-index: 2;
    top: clamp(18px, 3vw, 40px);
    right: clamp(18px, 4vw, 56px);
    width: 46px;
    height: 46px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink);
  }

  .lang-x {
    position: relative;
    display: block;
    width: 28px;
    height: 28px;
    margin: 0 auto;
  }

  .lang-x::before,
  .lang-x::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1.5px;
    background: currentcolor;
  }

  .lang-x::before {
    transform: rotate(45deg);
  }

  .lang-x::after {
    transform: rotate(-45deg);
  }

  .lang-list {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(6px, 1vw, 16px);
    padding: 0 clamp(24px, 9vw, 160px);
    pointer-events: none; /* container spans the panel — only the links catch clicks */
  }

  .lang-choice {
    position: relative;
    width: fit-content;
    pointer-events: auto;
    font-family: Jost, sans-serif;
    font-weight: 400;
    font-size: clamp(38px, 8vw, 104px);
    letter-spacing: -0.02em;
    line-height: 1.08;
    color: var(--ink);
  }

  /* Underline slides in from the left on hover/focus; the current language keeps it. */
  .lang-choice::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0.04em;
    width: 100%;
    height: 3px;
    background: var(--shyrdak);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.4s var(--ease);
  }

  .lang-choice:hover::after,
  .lang-choice:focus-visible::after,
  .lang-choice.is-current::after {
    transform: scaleX(1);
  }

  /* Mobile: two rows, no burger — logos on top, links below */
  @media (max-width: 767px) {
    .nav {
      height: auto;
    }

    .nav-inner {
      flex-direction: column;
      align-items: stretch;
      height: auto;
      gap: 15px;
      padding: 12px clamp(14px, 4vw, 20px) 14px;
    }

    .nav-logos {
      height: 46px;
      gap: 16px;
    }

    .logo {
      height: 46px;
    }

    .nav-links {
      gap: clamp(14px, 4.5vw, 26px);
    }

    .nav-item {
      font-size: 12px;
      letter-spacing: 0.08em;
    }

    .lang {
      margin-left: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav {
      transition: none;
    }
  }
</style>
