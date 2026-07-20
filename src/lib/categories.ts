import { m } from '$i18n';
import type { PracticeCategory } from '$lib/types/datocms';

// Single source of truth for the practice-category vocabulary — shared by the
// practices index and the archive filter. Add a category here (+ its message key
// in messages/*.json) and both surfaces pick it up.

/** Canonical category order (drives filter-chip order). */
export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  'crafts',
  'music',
  'rituals',
  'cuisine',
  'games'
];

/**
 * Localized label for a category value. Unknown or absent values return `null`
 * — callers render no chip/badge rather than echoing a raw CMS token to the UI.
 * (Paraglide has no dynamic key lookup, so the mapping is explicit.)
 */
export function categoryLabel(category: string | null | undefined): string | null {
  switch (category) {
    case 'crafts':
      return m.category_crafts();
    case 'music':
      return m.category_music();
    case 'rituals':
      return m.category_rituals();
    case 'cuisine':
      return m.category_cuisine();
    case 'games':
      return m.category_games();
    default:
      return null;
  }
}
