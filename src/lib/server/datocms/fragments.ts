// Shared GraphQL selection snippets for DatoCMS queries.

/**
 * Localized asset `alt`.
 *
 * Asset metadata (alt/title) is localized independently of the record, and the
 * record-level `locale:` argument does NOT reliably propagate down to it —
 * inside modular-content blocks DatoCMS returns the default-locale alt for every
 * language. So every `alt` must carry its own `locale` / `fallbackLocales`.
 *
 * Interpolate in place of a bare `alt` selection; the surrounding query must
 * declare `$locale: SiteLocale!` and `$fallbackLocales: [SiteLocale!]!`.
 */
export const LOCALIZED_ALT = 'alt(locale: $locale, fallbackLocales: $fallbackLocales)';
