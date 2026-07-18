<script lang="ts">
  import { page } from '$app/state';
  import { LOCALES, DEFAULT_LOCALE } from '$i18n';
  import type { Locale } from '$i18n';
  import type { DatoSeo } from '$lib/types/datocms';
  import { SITE_URL } from '$lib/site';

  let {
    title,
    description = null,
    seo = null,
    locale = 'ky',
    type = 'website'
  }: {
    title: string;
    description?: string | null;
    seo?: DatoSeo | null;
    locale?: Locale;
    type?: 'website' | 'article';
  } = $props();

  /** og:locale territory codes per supported locale. */
  const OG_LOCALE: Record<Locale, string> = {
    ky: 'ky_KG',
    ru: 'ru_RU',
    en: 'en_US',
    fr: 'fr_FR'
  };

  /** Replaces the leading locale segment of `pathname` with `target`. */
  function localizePath(pathname: string, target: Locale): string {
    return pathname.replace(/^\/[^/]+/, `/${target}`);
  }

  const resolvedTitle = $derived(seo?.title ?? title);
  const resolvedDescription = $derived(seo?.description ?? description);
  const ogImage = $derived(seo?.image?.url ?? null);

  const pathname = $derived(page.url.pathname);
  const canonicalUrl = $derived(SITE_URL + pathname);
  const alternates = $derived(
    LOCALES.map((l) => ({ locale: l, url: SITE_URL + localizePath(pathname, l) }))
  );
  const xDefaultUrl = $derived(SITE_URL + localizePath(pathname, DEFAULT_LOCALE));
</script>

<svelte:head>
  <title>{resolvedTitle}</title>
  {#if resolvedDescription}
    <meta name="description" content={resolvedDescription} />
  {/if}
  <link rel="canonical" href={canonicalUrl} />

  <!-- Alternate locale links for hreflang (absolute URLs) -->
  {#each alternates as alt (alt.locale)}
    <link rel="alternate" hreflang={alt.locale} href={alt.url} />
  {/each}
  <link rel="alternate" hreflang="x-default" href={xDefaultUrl} />

  <!-- Open Graph -->
  <meta property="og:site_name" content="Jash-Muun" />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={resolvedTitle} />
  {#if resolvedDescription}
    <meta property="og:description" content={resolvedDescription} />
  {/if}
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:locale" content={OG_LOCALE[locale]} />
  {#each LOCALES.filter((l) => l !== locale) as alt (alt)}
    <meta property="og:locale:alternate" content={OG_LOCALE[alt]} />
  {/each}
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
  {/if}

  <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
</svelte:head>
