<script lang="ts">
  import { page } from '$app/state';
  import { resolve, asset } from '$app/paths';
  import { m, LOCALES } from '$i18n';

  let { locale }: { locale: string } = $props();

  // Derive which nav link is "current" from the URL pathname.
  const path = $derived(page.url.pathname);
  // Slice from the locale segment onward — strips any base-path prefix automatically.
  const pathFromLocale = $derived(path.slice(path.indexOf(`/${locale}`)));
  const isPractice = $derived(path.includes('/practices'));
  const isGallery = $derived(path.includes('/gallery'));
  const homeHref = $derived(resolve(`/${locale}/`));
  const practicesHref = $derived(resolve(`/${locale}/practices/`));
  const galleryHref = $derived(resolve(`/${locale}/gallery/`));
  const mainLogoSrc = asset('/assets/main-logo.svg');
  const supportingLogoSrc = asset('/assets/supporting-logo.svg');
  const coFounderLogoSrc = asset('/assets/eu-logo.svg');

  function localePath(targetLocale: string): `/${string}` {
    const localized = pathFromLocale.replace(/^\/[^/]+(?=\/|$)/, `/${targetLocale}`);
    return (localized || `/${targetLocale}/`) as `/${string}`;
  }
</script>

<header class="nav">
  <nav class="nav-left" aria-label="Primary">
    <a href={homeHref} class:is-current={!isPractice && !isGallery}>{m.nav_home()}</a>
    <a href={practicesHref} class:is-current={isPractice}>{m.nav_practices()}</a>
    <a href={galleryHref} class:is-current={isGallery}>{m.nav_archive()}</a>

    <span class="nav-lang" aria-label={m.nav_language()}>
      {#each LOCALES as l (l)}
        <a href={resolve(localePath(l))} class:on={l === locale}>{l.toUpperCase()}</a>
      {/each}
    </span>
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
    gap: 24px;
    align-items: center;
  }
  .logo { height: 80px; width: auto; }
  .logo img { height: 100%; width: auto; display: block; }
</style>
