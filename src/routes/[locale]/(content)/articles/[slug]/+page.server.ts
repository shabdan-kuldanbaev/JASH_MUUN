import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getArticleBySlug, getAllArticleSlugs } from '$lib/server/datocms/queries/article';
import { getArticleSections } from '$lib/server/datocms/queries/articleSections';

export const prerender = true;

export async function entries() {
  try {
    return await getAllArticleSlugs();
  } catch (err) {
    console.warn('[DatoCMS] getAllArticleSlugs failed, no article entries generated:', err);
    return [];
  }
}

export const load: PageServerLoad = async ({ params, parent }) => {
  const { slug } = params;
  const parentData = await parent();

  const article = await getArticleBySlug(parentData.locale, slug).catch((err) => {
    console.error(`[DatoCMS] getArticleBySlug failed (${parentData.locale}/${slug}):`, err);
    throw error(500, `Failed to load article: ${err}`);
  });

  if (!article) {
    throw error(404, `Article not found: ${slug}`);
  }

  // Articles render strictly through modular `page_sections` from DatoCMS.
  const sections = await getArticleSections(parentData.locale, slug).catch(() => null);

  // No sections → the article has no valid presentation. 404 rather than render
  // an empty shell. (Narrows `sections` to a non-null array for the page.)
  if (!sections || sections.length === 0) {
    throw error(404, `Article has no page sections: ${slug}`);
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    article,
    sections
  };
};
