import type { PageServerLoad, EntryGenerator } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { LOCALES } from '$i18n';
import type { PracticeSummary } from '$lib/types/datocms';
import { getPracticeIndex } from '$lib/server/datocms/queries/practiceIndex';
import { PRACTICES_PAGE_SIZE, computeTotalPages } from '$lib/pagination';

export const prerender = true;

// Build-time: one CMS read per locale to compute how many pages exist (pages 2..N).
export const entries: EntryGenerator = async () => {
  const out: Array<{ locale: string; n: string }> = [];
  for (const locale of LOCALES) {
    let count: number;
    try {
      count = (await getPracticeIndex(locale)).length;
    } catch {
      count = 0;
    }
    const totalPages = computeTotalPages(count, PRACTICES_PAGE_SIZE);
    for (let n = 2; n <= totalPages; n++) out.push({ locale, n: String(n) });
  }
  return out;
};

export const load: PageServerLoad = async ({ params, parent }) => {
  const parentData = await parent();

  const n = Number(params.n);
  // Page 1 lives at the base route; anything below 2 redirects there (base-path safe).
  if (!Number.isInteger(n) || n < 2) {
    redirect(308, resolve(`/${parentData.locale}/practices/`));
  }

  let practices: PracticeSummary[];
  try {
    practices = await getPracticeIndex(parentData.locale);
  } catch {
    practices = [];
  }

  const totalPages = computeTotalPages(practices.length, PRACTICES_PAGE_SIZE);
  if (n > totalPages) {
    error(404, 'Page not found');
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    practices,
    page: n
  };
};
