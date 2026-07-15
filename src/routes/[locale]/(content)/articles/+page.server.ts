import type { PageServerLoad } from './$types';
import { LOCALES } from '$i18n';
import type { ArticleSummary } from '$lib/types/datocms';
import { getArticleIndex } from '$lib/server/datocms/queries/articleIndex';

export const prerender = true;

export function entries() {
  return LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  let articles: ArticleSummary[];
  try {
    articles = await getArticleIndex(parentData.locale);
  } catch {
    articles = [];
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    articles,
    page: 1
  };
};
