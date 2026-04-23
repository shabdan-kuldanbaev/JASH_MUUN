<script lang="ts">
  import { page } from '$app/state';
  import { resolve, asset } from '$app/paths';
  import { m } from '$i18n';
  import type { Locale } from '$lib/i18n';
  import { panel, type PanelId } from '$lib/panel.svelte';

  let { locale }: { locale: Locale } = $props();

  const path = $derived(page.url.pathname);
  const isPractice = $derived(path.includes('/practices'));
  const isGallery = $derived(path.includes('/gallery'));
  const homeHref = $derived(resolve(`/${locale}/`));
  const mainLogoSrc = asset('/assets/main-logo.svg');
  const supportingLogoSrc = asset('/assets/supporting-logo.svg');
  const coFounderLogoSrc = asset('/assets/eu-logo.svg');

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
    <a class="nav-item" href={homeHref} class:is-active={!isPractice && !isGallery}
      >{m.nav_home()}</a
    >

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
      aria-label={m.nav_language()}
    >
      {locale.toUpperCase()}
    </button>
  </nav>

  <div class="nav-right">
    <span class="logo" aria-label={m.nav_brand_home()}>
      <img src={mainLogoSrc} alt="Jash Muun" class="svg-supp" />
    </span>
    <span class="logo" aria-label={m.nav_support_partner()}>
      <img src={supportingLogoSrc} alt="ALIPH" class="svg-supp" />
    </span>
    <span class="logo" aria-label={m.nav_support_partner()}>
      <img src={coFounderLogoSrc} alt="ALIPH" class="svg-supp" />
    </span>
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

  /* Unified style for all nav items — links and the locale button */
  .nav-item {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 400;
    font-family: inherit;

    /* button reset */
    background: none;
    border: none;
    cursor: pointer;

    /* underline indicator */
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

  .nav-right {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .logo {
    height: 60px;
    width: auto;
  }

  .logo img {
    height: 100%;
    width: auto;
    display: block;
  }
</style>
