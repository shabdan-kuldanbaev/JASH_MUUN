import type { Handle } from '@sveltejs/kit';
import { AsyncLocalStorage } from 'async_hooks';
import { DEFAULT_LOCALE, isValidLocale } from '$lib/i18n';
import { overwriteServerAsyncLocalStorage } from '$lib/paraglide/runtime.js';

// Give paraglide its AsyncLocalStorage so getLocale() works per-request on the server.
const paraglideStorage = new AsyncLocalStorage<{ locale: string; origin: string }>();
overwriteServerAsyncLocalStorage(paraglideStorage as any);

function extractLocale(pathname: string): string {
  // Scan segments left-to-right; first valid locale wins.
  // Base-path-agnostic: /JASH_MUUN/ru/... and /ru/... both resolve correctly.
  for (const segment of pathname.split('/')) {
    if (segment && isValidLocale(segment)) return segment;
  }
  return DEFAULT_LOCALE;
}

export const handle: Handle = async ({ event, resolve }) => {
  const locale = extractLocale(event.url.pathname);
  const origin = event.url.origin;

  return paraglideStorage.run({ locale, origin }, () =>
    resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale),
    })
  );
};
