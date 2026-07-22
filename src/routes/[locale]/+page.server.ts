import type { PageServerLoad } from './$types';
import { LOCALES } from '$i18n';
import type { PracticeSummary, ArchiveItem } from '$lib/types/datocms';
import { getPracticeIndex } from '$lib/server/datocms/queries/practiceIndex';
import { getArchiveItems } from '$lib/server/datocms/queries/archive';

export const prerender = true;

export function entries() {
  return LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  // Each source degrades to an empty list on failure (locale/content issues) —
  // the homepage still renders its section headings.
  let practices: PracticeSummary[];
  try {
    const all = await getPracticeIndex(parentData.locale);
    practices = all.slice(0, 3);
  } catch {
    practices = [];
  }

  let archive: ArchiveItem[];
  try {
    const all = await getArchiveItems(parentData.locale);
    archive = all.slice(0, 5);
  } catch {
    archive = [];
  }

  return { locale: parentData.locale, practices, archive };
};
