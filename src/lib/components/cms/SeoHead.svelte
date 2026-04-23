<script lang="ts">
  import type { Locale } from '$lib/i18n';
  import type { DatoSeo } from '$lib/types/datocms';

  let {
    title,
    description = null,
    seo = null,
    canonicalUrl = null,
    locale = 'ru',
    alternateLocales = [],
  }: {
    title: string;
    description?: string | null;
    seo?: DatoSeo | null;
    canonicalUrl?: string | null;
    locale?: Locale;
    alternateLocales?: { locale: Locale; url: string }[];
  } = $props();

  const resolvedTitle = $derived(seo?.title ?? title);
  const resolvedDescription = $derived(seo?.description ?? description);
  const ogImage = $derived(seo?.image?.url ?? null);
</script>

<svelte:head>
  <title>{resolvedTitle}</title>
  {#if resolvedDescription}
    <meta name="description" content={resolvedDescription} />
  {/if}
  {#if canonicalUrl}
    <link rel="canonical" href={canonicalUrl} />
  {/if}

  <!-- Open Graph -->
  <meta property="og:title" content={resolvedTitle} />
  {#if resolvedDescription}
    <meta property="og:description" content={resolvedDescription} />
  {/if}
  <meta property="og:locale" content={locale} />
  {#if canonicalUrl}
    <meta property="og:url" content={canonicalUrl} />
  {/if}
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
  {/if}

  <!-- Alternate locale links for hreflang -->
  {#each alternateLocales as alt (alt.locale)}
    <link rel="alternate" hreflang={alt.locale} href={alt.url} />
  {/each}
</svelte:head>
