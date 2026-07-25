// Shared GraphQL selection snippets for DatoCMS queries.

/**
 * Localized asset `alt`.
 *
 * Asset metadata (alt/title) is localized independently of the record, and the
 * record-level `locale:` argument does NOT reliably propagate down to it —
 * inside modular-content blocks DatoCMS returns the default-locale alt for every
 * language. So every `alt` must carry its own `locale`.
 *
 * Deliberately NO `fallbackLocales` here, unlike the record fields. Falling back
 * would put e.g. French alt text on a Kyrgyz page — a screen reader would then
 * announce the wrong language. Returning null instead lets the call sites fall
 * back to something already localized (practice/article title, caption, category).
 *
 * Interpolate in place of a bare `alt` selection; the surrounding query must
 * declare `$locale: SiteLocale!`.
 */
export const LOCALIZED_ALT = 'alt(locale: $locale)';
