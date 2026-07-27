import type { PageServerLoad, EntryGenerator } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { LOCALES } from '$i18n';
import type { ArticleSummary } from '$lib/types/datocms';
import { getArticleIndex } from '$lib/server/datocms/queries/articleIndex';
import { ARTICLES_PAGE_SIZE, computeTotalPages } from '$lib/pagination';

export const prerender = true;

// Build-time page-count per locale. The featured article is no longer carved out of
// pagination — it is simply the lead card of page 1 — so the count is the whole list.
// A dataset ≤ PAGE_SIZE emits no page/[n] entries.
export const entries: EntryGenerator = async () => {
  const out: Array<{ locale: string; n: string }> = [];
  for (const locale of LOCALES) {
    let count: number;
    try {
      count = (await getArticleIndex(locale)).length;
    } catch {
      count = 0;
    }
    const totalPages = computeTotalPages(count, ARTICLES_PAGE_SIZE);
    for (let n = 2; n <= totalPages; n++) out.push({ locale, n: String(n) });
  }
  return out;
};

export const load: PageServerLoad = async ({ params, parent }) => {
  const parentData = await parent();

  const n = Number(params.n);
  if (!Number.isInteger(n) || n < 2) {
    redirect(308, resolve(`/${parentData.locale}/articles/`));
  }

  let articles: ArticleSummary[];
  try {
    articles = await getArticleIndex(parentData.locale);
  } catch {
    articles = [];
  }

  const totalPages = computeTotalPages(articles.length, ARTICLES_PAGE_SIZE);
  if (n > totalPages) {
    error(404, 'Page not found');
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    articles,
    page: n
  };
};
