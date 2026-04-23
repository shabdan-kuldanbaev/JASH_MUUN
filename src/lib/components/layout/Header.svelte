<script lang="ts">
  import { page } from '$app/state';
  import { resolve, asset } from '$app/paths';
  import { m } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import { panel, type PanelId } from '$lib/panel.svelte';
  import { fade } from 'svelte/transition';

  let { locale }: { locale: Locale } = $props();

  const path = $derived(page.url.pathname);
  const isPractice = $derived(path.includes('/practices'));
  const isGallery = $derived(path.includes('/gallery'));
  const homeHref = $derived(resolve(`/${locale}/`));

  const logos = [
    { src: asset('/assets/main-logo.svg'), alt: 'Jash Muun', label: m.nav_brand_home() },
    { src: asset('/assets/supporting-logo.svg'), alt: 'ALIPH', label: m.nav_support_partner() },
    { src: asset('/assets/eu-logo.svg'), alt: 'EU', label: m.nav_support_partner() }
  ];

  const isOpen = $derived(panel.active !== null);

  function onHeaderClick(e: MouseEvent, id: PanelId) {
    e.preventDefault();
    if (!panel.active) {
      panel.open(id as NonNullable<PanelId>);
      return;
    }
    if (panel.active !== id) {
      panel.switchTo(id as NonNullable<PanelId>);
      return;
    }
    panel.close();
  }
</script>

<header class="nav">
  <nav class="nav-left" aria-label="Primary">
    <a class="nav-item" href={homeHref} class:is-active={!isPractice && !isGallery}>
      {m.nav_home()}
    </a>

    <button
      class="nav-item"
      class:is-active={isPractice || panel.active === 'practices'}
      onclick={(e) => onHeaderClick(e, 'practices')}
      aria-expanded={panel.active === 'practices'}
      aria-label={m.nav_practices()}>{m.nav_practices()}</button
    >

    <button
      class="nav-item"
      class:is-active={isGallery}
      onclick={(e) => onHeaderClick(e, 'archive')}
      aria-expanded={panel.active === 'archive'}
      aria-label={m.nav_archive()}>{m.nav_archive()}</button
    >

    <button
      class="nav-item"
      class:is-active={panel.active === 'language'}
      onclick={(e) => onHeaderClick(e, 'language')}
      aria-expanded={panel.active === 'language'}
      aria-label={m.nav_language()}>{locale.toUpperCase()}</button
    >
  </nav>

  <div class="nav-right">
    <!--
      Logos stay in DOM at all times — CSS transitions handle enter/exit.
      Removing from DOM via {#if} caused coexistence flicker with the close button.
    -->
    {#each logos as logo, i (logo.alt)}
      <span
        class="logo"
        class:logo--out={isOpen}
        aria-label={logo.label}
        style="transition-delay: {isOpen ? `${i * 50}ms` : `${(2 - i) * 100}ms`}"
      >
        <img src={logo.src} alt={logo.alt} />
      </span>
    {/each}

    <!-- Close button overlays the logo area while panel is open -->
    {#if isOpen}
      <button
        class="close-btn"
        onclick={() => panel.close()}
        aria-label="Закрыть"
        in:fade={{ duration: 280, delay: 200 }}
        out:fade={{ duration: 180 }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    {/if}
  </div>
</header>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--gutter);
    z-index: 40;
    background: var(--paper);
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

  /* ── Logo area ──────────────────────────────────────────────────────── */
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

  /* ── Close button ───────────────────────────────────────────────────── */
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
</style>
