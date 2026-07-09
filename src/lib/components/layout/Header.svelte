<script lang="ts">
  import { page } from '$app/state';
  import { resolve, asset } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { m, LOCALES } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import { panel } from '$lib/panel.svelte';
  import { fade } from 'svelte/transition';

  let { locale }: { locale: Locale } = $props();

  const path = $derived(page.url.pathname);
  const isPractice = $derived(path.includes('/practices'));
  const isGallery = $derived(path.includes('/gallery'));
  const isArticle = $derived(path.includes('/articles'));
  const homeHref = $derived(resolve(`/${locale}/`));
  const practicesHref = $derived(resolve(`/${locale}/practices/`));
  const articlesHref = $derived(resolve(`/${locale}/articles/`));
  const galleryHref = $derived(resolve(`/${locale}/gallery/`));

  const logos = $derived([
    { src: asset('/assets/main-logo.svg'), alt: 'Jash Muun', label: m.nav_brand_home() },
    { src: asset('/assets/supporting-logo.svg'), alt: 'ALIPH', label: m.nav_support_partner() },
    { src: asset('/assets/eu-logo.svg'), alt: 'EU', label: m.nav_support_partner() }
  ]);

  const isPanelOpen = $derived(panel.active !== null);

  /* ── Mobile menu state ─────────────────────────────────────────────── */
  let mobileOpen = $state(false);

  function toggleMobile() {
    mobileOpen = !mobileOpen;
  }

  function closeMobile() {
    mobileOpen = false;
  }

  // Close mobile menu on navigation (mirrors panel.close() in layout)
  afterNavigate(() => {
    mobileOpen = false;
  });

  // Scroll-lock body when mobile menu is open
  $effect(() => {
    if (mobileOpen) {
      document.body.dataset.mobileMenuOpen = 'true';
    } else {
      delete document.body.dataset.mobileMenuOpen;
    }
  });

  /* ── Language toggle (desktop only) ────────────────────────────────── */
  function toggleLangPanel(e: MouseEvent) {
    e.preventDefault();
    panel.toggle();
  }

  /* ── Mobile language helpers ───────────────────────────────────────── */
  const pathFromLocale = $derived(path.slice(path.indexOf(`/${locale}`)));

  function localePath(targetLocale: Locale): string {
    const localized = pathFromLocale.replace(/^\/[^/]+(?=\/|$)/, `/${targetLocale}`);
    return resolve((localized || `/${targetLocale}/`) as `/${string}`);
  }

  const localeLabels: Record<string, string> = {
    ru: 'Русский',
    ky: 'Кыргызча',
    en: 'English',
    fr: 'Français'
  };

  /* ── Keyboard ──────────────────────────────────────────────────────── */
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && mobileOpen) closeMobile();
  }
</script>

<svelte:window onkeydown={onKeydown} />

<header class="nav">
  <div class="nav-inner">
    <!-- Partner logos (mobile only — replaces brand text) -->
    <div class="brand-mobile">
      {#each logos as logo (logo.alt)}
        <span class="brand-logo" aria-label={logo.label}>
          <img src={logo.src} alt={logo.alt} />
        </span>
      {/each}
    </div>

    <nav class="nav-left" aria-label="Primary">
      <a class="nav-item" href={homeHref} class:is-active={!isPractice && !isGallery && !isArticle}>
        {m.nav_home()}
      </a>

      <a class="nav-item" href={practicesHref} class:is-active={isPractice}>{m.nav_practices()}</a>

      <a class="nav-item" href={articlesHref} class:is-active={isArticle}>{m.nav_articles()}</a>

      <a class="nav-item" href={galleryHref} class:is-active={isGallery}>{m.nav_archive()}</a>

      <button
        class="nav-item"
        class:is-active={panel.active === 'language'}
        onclick={toggleLangPanel}
        aria-expanded={panel.active === 'language'}
        aria-label={m.nav_language()}>{locale.toUpperCase()}</button
      >
    </nav>

    <div class="nav-right">
      {#each logos as logo, i (logo.alt)}
        <span
          class="logo"
          class:logo--out={isPanelOpen}
          aria-label={logo.label}
          style="transition-delay: {isPanelOpen ? `${i * 50}ms` : `${(2 - i) * 100}ms`}"
        >
          <img src={logo.src} alt={logo.alt} />
        </span>
      {/each}

      {#if isPanelOpen}
        <button
          class="close-btn"
          onclick={() => panel.close()}
          aria-label={m.panel_close()}
          in:fade={{ duration: 280, delay: 200 }}
          out:fade={{ duration: 180 }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      {/if}
    </div>

    <!-- Hamburger button (mobile only) -->
    <button class="burger" onclick={toggleMobile} aria-label={m.nav_menu()}>
      {#if mobileOpen}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      {/if}
    </button>
  </div>
</header>

<!-- Mobile menu overlay (rendered outside header for independent stacking context) -->
{#if mobileOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="mobile-overlay"
    onclick={(e) => e.target === e.currentTarget && closeMobile()}
    in:fade={{ duration: 220 }}
    out:fade={{ duration: 180 }}
  >
    <div class="mobile-menu">
      <nav class="mobile-nav" aria-label="Mobile navigation">
        <a
          href={homeHref}
          class="mobile-link"
          class:is-active={!isPractice && !isGallery && !isArticle}
          onclick={closeMobile}
        >
          {m.nav_home()}
        </a>
        <a
          href={practicesHref}
          class="mobile-link"
          class:is-active={isPractice}
          onclick={closeMobile}
        >
          {m.nav_practices()}
        </a>
        <a
          href={articlesHref}
          class="mobile-link"
          class:is-active={isArticle}
          onclick={closeMobile}
        >
          {m.nav_articles()}
        </a>
        <a href={galleryHref} class="mobile-link" class:is-active={isGallery} onclick={closeMobile}>
          {m.nav_archive()}
        </a>
      </nav>

      <div class="mobile-lang">
        <span class="mobile-label">{m.nav_language()}</span>
        <div class="mobile-lang-list">
          {#each LOCALES as l (l)}
            <!-- eslint-disable svelte/no-navigation-without-resolve -- localePath() already returns a resolve()'d path -->
            <a
              href={localePath(l)}
              class="mobile-lang-item"
              class:is-current={l === locale}
              onclick={closeMobile}
            >
              {localeLabels[l] ?? l.toUpperCase()}
            </a>
            <!-- eslint-enable svelte/no-navigation-without-resolve -->
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Header bar ──────────────────────────────────────────────────── */
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-h);
    z-index: 40;
    background: var(--paper);
    view-transition-name: header;
  }

  .nav-inner {
    max-width: var(--content-w);
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--gutter);
  }

  .nav-left {
    display: flex;
    gap: 28px;
    align-items: baseline;
  }

  /* Unified style for all nav items — links and buttons */
  .nav-item {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 400;
    font-family: inherit;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0 3px;
    border-bottom: 1px solid transparent;
    transition:
      border-color 0.25s ease,
      color 0.25s ease;
  }

  .nav-item:hover,
  .nav-item.is-active {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  /* ── Logo area (desktop) ─────────────────────────────────────────── */
  .nav-right {
    position: relative;
    display: flex;
    gap: 24px;
    align-items: center;
    height: 60px;
  }

  .logo {
    height: 60px;
    flex-shrink: 0;
    transition:
      transform 0.32s ease,
      opacity 0.32s ease;
  }

  .logo img {
    height: 100%;
    width: auto;
    display: block;
  }

  /* Logos exit to the right when panel opens */
  .logo--out {
    transform: translateX(80px);
    opacity: 0;
    pointer-events: none;
  }

  /* ── Close button (desktop panel) ────────────────────────────────── */
  .close-btn {
    position: absolute;
    right: 0;
    top: 50%;
    translate: 0 -50%;
    height: 48px;
    width: 48px;
    display: grid;
    place-items: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 0;
    transition: opacity 0.2s;
  }

  .close-btn:hover {
    opacity: 0.5;
  }

  .close-btn svg {
    width: 100%;
    height: 100%;
  }

  /* ── Brand logos + hamburger — hidden on desktop ─────────────────── */
  .brand-mobile {
    display: none;
    align-items: center;
    gap: 16px;
  }

  .brand-logo {
    height: 36px;
    flex-shrink: 0;
  }

  .brand-logo img {
    height: 100%;
    width: auto;
    display: block;
  }

  .burger {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 0;
  }

  .burger svg {
    width: 24px;
    height: 24px;
  }

  /* ── Mobile overlay — hidden on desktop as safety net ────────────── */
  .mobile-overlay {
    display: none;
  }

  /* ── Mobile (< 768px) ────────────────────────────────────────────── */
  @media (max-width: 767px) {
    .nav-left {
      display: none;
    }

    .nav-right {
      display: none;
    }

    .brand-mobile {
      display: flex;
    }

    .burger {
      display: flex;
    }

    .mobile-overlay {
      display: flex;
      position: fixed;
      top: var(--nav-h);
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 39;
      background: var(--paper);
      flex-direction: column;
      overflow-y: auto;
    }
  }

  /* ── Mobile menu content ─────────────────────────────────────────── */
  .mobile-menu {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: clamp(32px, 6vw, 48px) var(--gutter);
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: clamp(40px, 6vw, 56px);
  }

  .mobile-link {
    font-family: 'Jost', sans-serif;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
    font-weight: 400;
    color: var(--ink-2);
    transition: color 0.2s ease;
  }

  .mobile-link.is-active {
    color: var(--ink);
  }

  .mobile-link:hover {
    color: var(--ink);
  }

  /* ── Mobile language selector ────────────────────────────────────── */
  .mobile-lang {
    margin-bottom: auto;
  }

  .mobile-label {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    display: block;
    margin-bottom: 1rem;
  }

  .mobile-lang-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
  }

  .mobile-lang-item {
    font-family: 'Jost', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: var(--muted);
    transition: color 0.2s ease;
  }

  .mobile-lang-item:hover,
  .mobile-lang-item.is-current {
    color: var(--ink);
  }

  .mobile-lang-item.is-current {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
</style>
