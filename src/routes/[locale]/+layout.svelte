<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { localeState } from '$lib/locale.svelte.js';
  import { isValidLocale, DEFAULT_LOCALE, LOCALES } from '$i18n';
  import type { Locale } from '$i18n';
  import SlidePanel from '$components/layout/SlidePanel.svelte';
  import { panel } from '$lib/panel.svelte';

  let { children } = $props();

  $effect(() => {
    const locale = page.params.locale;
    localeState.current = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  });

  afterNavigate(() => panel.close());

  const path = $derived(page.url.pathname);
  const pathFromLocale = $derived(path.slice(path.indexOf(`/${localeState.current}`)));

  function localePath(targetLocale: Locale): `/${string}` {
    const localized = pathFromLocale.replace(/^\/[^/]+(?=\/|$)/, `/${targetLocale}`);
    return (localized || `/${targetLocale}/`) as `/${string}`;
  }

  function localeLabel(l: string): string {
    const labels: Record<string, string> = {
      ru: 'Русский',
      ky: 'Кыргызча',
      en: 'English',
      fr: 'Français'
    };
    return labels[l] ?? l.toUpperCase();
  }
</script>

<SlidePanel>
  {#snippet language()}
    <div class="panel-section">
      <nav class="lang-list" aria-label="Выбор языка">
        {#each LOCALES as l (l)}
          <a
            href={resolve(localePath(l))}
            class:current={l === localeState.current}
            onclick={() => panel.close()}
          >
            {localeLabel(l)}
          </a>
        {/each}
      </nav>
    </div>
  {/snippet}

  {#snippet practices()}
    <div class="panel-section">
      <nav class="practices-list" aria-label="Практики">
        <a href={resolve(`/${localeState.current}/practices/`)} onclick={() => panel.close()}>
          Все практики →
        </a>
      </nav>
    </div>
  {/snippet}

  {#snippet archive()}
    <div class="panel-section">
      <nav class="practices-list" aria-label="Практики">
        <a href={resolve(`/${localeState.current}/gallery/`)} onclick={() => panel.close()}>
          Архив →
        </a>
      </nav>
    </div>
  {/snippet}
</SlidePanel>

{@render children()}

<style>
  .panel-section {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .lang-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .practices-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lang-list a {
    font-family: 'Noto Serif Display', serif;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 400;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .practices-list a {
    font-family: 'Noto Serif Display', serif;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 400;
    color: var(--ink-2);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .practices-list a:hover {
    color: var(--ink);
  }

  .lang-list a:hover,
  .lang-list a.current {
    color: var(--ink);
  }

  .lang-list a.current {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
</style>
