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

  /* Language dropdown */
  let langOpen = $state(false);
  let langEl = $state<HTMLElement | null>(null);
  let toggleEl = $state<HTMLButtonElement | null>(null);
  let optionEls = $state<HTMLAnchorElement[]>([]);
  const currentIndex = $derived(LOCALES.indexOf(locale));

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

  function onWindowClick(e: MouseEvent) {
    if (langOpen && langEl && !langEl.contains(e.target as Node)) closeLang();
  }

  // Body-level class so the corner scrim can sit above the fixed header.
  $effect(() => {
    document.body.classList.toggle('lang-open', langOpen);
    return () => document.body.classList.remove('lang-open');
  });

  const isPractices = $derived(path.includes('/practices'));
  const isArticles = $derived(path.includes('/articles'));
  const isGallery = $derived(path.includes('/gallery'));
  const isHome = $derived(!isPractices && !isArticles && !isGallery);
</script>

<svelte:window onkeydown={onWindowKeydown} onclick={onWindowClick} />

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

      <div class="lang" class:is-open={langOpen} bind:this={langEl}>
        <button
          class="nav-item lang-toggle"
          bind:this={toggleEl}
          onclick={toggleLang}
          onkeydown={onToggleKeydown}
          aria-haspopup="listbox"
          aria-expanded={langOpen}
          aria-label={m.nav_language()}
        >
          <span class="nav-rise">
            {locale.toUpperCase()}<span class="lang-caret" aria-hidden="true"></span>
          </span>
        </button>
        <ul class="lang-menu" role="listbox" aria-label={m.nav_language()}>
          <!-- eslint-disable svelte/no-navigation-without-resolve -- localePath() returns a resolve()'d path -->
          {#each LOCALES as l, i (l)}
            <li role="none">
              <a
                href={localePath(l)}
                class="lang-opt"
                class:is-current={l === locale}
                role="option"
                aria-selected={l === locale}
                tabindex={langOpen ? 0 : -1}
                bind:this={optionEls[i]}
                onclick={() => closeLang()}
                onkeydown={(e) => onMenuKeydown(e, i)}
              >
                {localeLabels[l] ?? l.toUpperCase()}
              </a>
            </li>
          {/each}
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        </ul>
      </div>
    </nav>
  </div>
</header>

<!-- Corner scrim behind the open language dropdown -->
<div class="lang-scrim" aria-hidden="true"></div>

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

    /* Slight reveal delay so the glow band lands first. */
    transition:
      transform 0.42s ease 0.16s,
      box-shadow 0.32s ease;
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

  .lang-caret {
    width: 6px;
    height: 6px;
    border-right: 1.6px solid currentcolor;
    border-bottom: 1.6px solid currentcolor;
    transform: translateY(-2px) rotate(45deg);
    transition: transform 0.32s var(--ease);
  }

  .lang.is-open .lang-caret {
    transform: translateY(1px) rotate(-135deg);
  }

  .lang-menu {
    position: absolute;
    top: calc(100% + 14px);
    right: 0;
    min-width: 130px;
    display: flex;
    flex-direction: column;
    background: transparent;
    list-style: none;
    opacity: 0;
    transform: translateY(-8px);
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 0.32s ease,
      transform 0.4s var(--ease),
      visibility 0s linear 0.4s;
    z-index: 41;
  }

  .lang.is-open .lang-menu {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
    pointer-events: auto;
    transition:
      opacity 0.32s ease,
      transform 0.4s var(--ease);
  }

  .lang-opt {
    display: block;
    padding: 8px 2px;
    font-size: 13px;
    letter-spacing: 0.02em;
    color: #fff;
    text-align: right;
    opacity: 0;
    transform: translateY(-6px);
    transition:
      color 0.2s ease,
      transform 0.35s var(--ease),
      opacity 0.35s ease;
  }

  .lang-opt.is-current {
    font-weight: 500;
  }

  :global(body.over-content) .lang-opt {
    color: #000;
  }

  .lang.is-open .lang-menu .lang-opt {
    opacity: 1;
    transform: translateY(0);
  }

  .lang.is-open .lang-menu li:nth-child(1) .lang-opt {
    transition-delay: 0.05s;
  }

  .lang.is-open .lang-menu li:nth-child(2) .lang-opt {
    transition-delay: 0.1s;
  }

  .lang.is-open .lang-menu li:nth-child(3) .lang-opt {
    transition-delay: 0.15s;
  }

  .lang.is-open .lang-menu li:nth-child(4) .lang-opt {
    transition-delay: 0.2s;
  }

  /* Corner scrim (behind the open dropdown) */
  .lang-scrim {
    --w: min(58vw, 460px);
    --h: min(92vh, 860px);

    position: fixed;
    top: 0;
    right: 0;
    width: var(--w);
    height: var(--h);
    background: radial-gradient(
      var(--w) var(--h) at top right,
      rgba(8, 6, 4, 0.55) 0%,
      rgba(8, 6, 4, 0.4) 32%,
      rgba(8, 6, 4, 0.14) 62%,
      rgba(8, 6, 4, 0) 84%
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 38;
  }

  :global(body.lang-open) .lang-scrim {
    opacity: 1;
  }

  /* Keep nav text white while the menu is open over the dark hero scrim. */
  :global(body.lang-open) .nav-item {
    color: #fff;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
  }

  /* Over content — light corner scrim, black nav text */
  :global(body.over-content) .lang-scrim {
    background: radial-gradient(
      var(--w) var(--h) at top right,
      rgba(250, 250, 247, 0.94) 0%,
      rgba(250, 250, 247, 0.62) 32%,
      rgba(250, 250, 247, 0.22) 62%,
      rgba(250, 250, 247, 0) 84%
    );
  }

  :global(body.lang-open.over-content) .nav-item {
    color: #000;
    text-shadow: none;
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

    .lang-menu {
      min-width: 108px;
      top: calc(100% + 10px);
    }

    .lang-opt {
      font-size: 14px;
      padding: 9px 2px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav {
      transition: none;
    }
  }
</style>
