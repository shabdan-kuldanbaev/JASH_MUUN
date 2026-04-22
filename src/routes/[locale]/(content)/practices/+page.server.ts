import type { PageServerLoad } from './$types';
import { LOCALES, type PracticeSummary } from '$lib/types/datocms';
import { getPracticeIndex } from '$lib/server/datocms/queries/practiceIndex';

export const prerender = true;

export function entries() {
  return LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = async ({ params, parent }) => {
  const { locale } = params;
  const parentData = await parent();

  let practices: PracticeSummary[];
  try {
    practices = await getPracticeIndex(locale);
  } catch {
    practices = [];
  }

  return {
    locale,
    siteSettings: parentData.siteSettings,
    practices,
  };
};
