<script lang="ts">
  import { page } from '$app/stores';
  import { base, resolve } from '$app/paths';
  import { LOCALES } from '$lib/types/datocms';

  let { locale }: { locale: string } = $props();

  // Derive which nav link is "current" from the URL pathname.
  const path = $derived($page.url.pathname);
  const isPractice = $derived(path.includes('/practices'));
  const isGallery = $derived(path.includes('/gallery'));
  const homeHref = $derived(resolve(`/${locale}/`));
  const practicesHref = $derived(resolve(`/${locale}/practices/`));
  const galleryHref = $derived(resolve(`/${locale}/gallery/`));
  const mainLogoSrc = $derived(`${base}/assets/main-logo.svg`);
  const supportingLogoSrc = $derived(`${base}/assets/supporting-logo.svg`);
</script>

<header class="nav">
  <nav class="nav-left" aria-label="Primary">
    <a href={homeHref} class:is-current={!isPractice && !isGallery}>Home</a>
    <a href={practicesHref} class:is-current={isPractice}>Practices</a>
    <a href={galleryHref} class:is-current={isGallery}>Archive</a>

    <span class="nav-lang" aria-label="Language">
      {#each LOCALES as l (l)}
        <a href={resolve(`/${l}/`)} class:on={l === locale}>{l.toUpperCase()}</a>
      {/each}
    </span>
  </nav>

  <div class="nav-right">
    <a href={homeHref} class="logo-main" aria-label="Jash-Muun — home">
      <img src={mainLogoSrc} alt="Jash-Muun" class="svg-main" />
    </a>
    <div class="nav-divider" aria-hidden="true"></div>
    <span class="logo-support" aria-label="ALIPH — supporting partner">
      <img src={supportingLogoSrc} alt="ALIPH" class="svg-supp" />
    </span>
  </div>
</header>

<style>
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
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
    gap: 36px;
    align-items: baseline;
  }
  .nav-left a {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: .02em;
    color: var(--ink);
    padding-bottom: 3px;
    border-bottom: 1px solid transparent;
    transition: border-color .25s ease, color .25s ease;
  }
  .nav-left a:hover { border-bottom-color: var(--ink); }
  .nav-left a.is-current { border-bottom-color: var(--ink); }

  .nav-lang {
    font-size: 12px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    gap: 10px;
    margin-left: 24px;
    align-items: center;
  }
  .nav-lang a { color: var(--muted); border-bottom: none; font-weight: 400; }
  .nav-lang a.on { color: var(--ink); font-weight: 500; }
  .nav-lang a:hover { color: var(--ink); border-bottom: none; }

  .nav-right {
    display: flex;
    gap: 28px;
    align-items: center;
  }
  .logo-main { height: 44px; width: auto; }
  .logo-main img { height: 100%; width: auto; display: block; }
  .nav-divider { width: 1px; height: 28px; background: var(--ink); opacity: .25; }
  .logo-support { height: 38px; }
  .logo-support img { height: 100%; width: auto; display: block; }
</style>
