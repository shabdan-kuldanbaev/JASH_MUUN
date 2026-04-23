// Single public i18n module for the project.
//
// Everything related to localisation lives here:
//   - Message functions       import { m } from '$i18n'
//   - Locale constants        import { LOCALES, DEFAULT_LOCALE } from '$i18n'
//   - Locale helpers          import { isValidLocale, resolveContentLocale } from '$i18n'
//
// The generated output in src/lib/paraglide/ is compiled infrastructure.
// Do not import from it directly in components, routes, or server queries.

// ── Message functions ────────────────────────────────────────────────────────

export { m } from '$lib/paraglide/messages.js';

// ── Locale constants ─────────────────────────────────────────────────────────
// Must stay in sync with the locales array in project.inlang/settings.json.

export const LOCALES = ['ru', 'ky', 'en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

/** Locale shown to users when no valid locale segment is found in the URL. */
export const DEFAULT_LOCALE: Locale = 'ru';

// ── Locale helpers ────────────────────────────────────────────────────────────

/** Returns true when `value` is one of the supported route locales. */
export function isValidLocale(value: unknown): value is Locale {
  return (LOCALES as readonly string[]).includes(value as string);
}

/**
 * Maps a route locale to an available DatoCMS locale.
 * Falls back to 'ru' until additional CMS locales are configured.
 */
export function resolveContentLocale(locale: Locale): Locale {
  const available = ['ru'];
  return available.includes(locale) ? locale : 'ru';
}
