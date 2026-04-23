<script lang="ts">
  import { page } from '$app/state';
  import { localeState } from '$lib/locale.svelte.js';
  import { isValidLocale, DEFAULT_LOCALE } from '$i18n';

  let { children } = $props();

  // Sync reactive locale state on every client-side navigation.
  // $page.params.locale is a reactive store value — $effect re-runs when it changes.
  // Updating localeState.current ($state) causes all m.*() calls in templates
  // to re-evaluate automatically via Svelte 5's fine-grained reactivity.
  $effect(() => {
    const locale = page.params.locale;
    localeState.current = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  });
</script>

{@render children()}
