<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { m, LOCALES, DEFAULT_LOCALE } from '$i18n';
  import { SITE_URL } from '$lib/site';

  const target = resolve(`/${DEFAULT_LOCALE}/`);
  const canonical = `${SITE_URL}/${DEFAULT_LOCALE}/`;

  onMount(() => {
    location.replace(target);
  });
</script>

<svelte:head>
  <title>{m.home_meta_title()}</title>
  <meta name="description" content={m.home_meta_description()} />
  <link rel="canonical" href={canonical} />
  {#each LOCALES as locale (locale)}
    <link rel="alternate" hreflang={locale} href={`${SITE_URL}/${locale}/`} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={canonical} />
  <meta http-equiv="refresh" content={`0; url=${target}`} />
</svelte:head>

<div class="root-gate">
  <a href={target}>{m.home_meta_title()}</a>
</div>

<style>
  .root-gate {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--paper);
  }

  .root-gate a {
    color: var(--ink);
    font-size: 1.125rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-decoration: none;
  }

  .root-gate a:hover,
  .root-gate a:focus-visible {
    color: var(--ink-2);
  }
</style>
