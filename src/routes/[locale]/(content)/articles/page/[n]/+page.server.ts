import type { PageServerLoad, EntryGenerator } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { LOCALES } from '$i18n';
import type { ArticleSummary } from '$lib/types/datocms';
import { getArticleIndex } from '$lib/server/datocms/queries/articleIndex';
import { ARTICLES_PAGE_SIZE, computeTotalPages } from '$lib/pagination';

export const prerender = true;

// Build-time page-count per locale. Page 1 carries the featured hero, so the paginated
// bento is over the REST (count - 1). A dataset ≤ (1 + PAGE_SIZE) emits no page/[n] entries.
export const entries: EntryGenerator = async () => {
  const out: Array<{ locale: string; n: string }> = [];
  for (const locale of LOCALES) {
    let count: number;
    try {
      count = (await getArticleIndex(locale)).length;
    } catch {
      count = 0;
    }
    const restCount = Math.max(0, count - 1);
    const totalPages = computeTotalPages(restCount, ARTICLES_PAGE_SIZE);
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

  const featured = articles.find((a) => a.featured) ?? articles[0];
  const restCount = articles.filter((a) => a !== featured).length;
  const totalPages = computeTotalPages(restCount, ARTICLES_PAGE_SIZE);
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
