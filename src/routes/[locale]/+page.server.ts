import type { PageServerLoad } from './$types';
import { LOCALES } from '$i18n';
import type { PracticeSummary } from '$lib/types/datocms';
import { getPracticeIndex } from '$lib/server/datocms/queries/practiceIndex';

export const prerender = true;

export function entries() {
  return LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  let practices: PracticeSummary[];
  try {
    const all = await getPracticeIndex(parentData.locale);
    practices = all.slice(0, 6);
  } catch {
    practices = [];
  }

  return { locale: parentData.locale, practices };
};
