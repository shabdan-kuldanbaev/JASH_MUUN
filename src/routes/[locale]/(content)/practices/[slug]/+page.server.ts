import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPracticeBySlug, getAllPracticeSlugs } from '$lib/server/datocms/queries/practice';

export const prerender = true;

export async function entries() {
  try {
    return await getAllPracticeSlugs();
  } catch (err) {
    console.warn('[DatoCMS] getAllPracticeSlugs failed, no practice entries generated:', err);
    return [];
  }
}

export const load: PageServerLoad = async ({ params, parent }) => {
  const { slug } = params;
  const parentData = await parent();

  const practice = await getPracticeBySlug(parentData.locale, slug).catch((err) => {
    console.error(`[DatoCMS] getPracticeBySlug failed (${parentData.locale}/${slug}):`, err);
    throw error(500, `Failed to load practice: ${err}`);
  });

  if (!practice) {
    throw error(404, `Practice not found: ${slug}`);
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    practice,
  };
};
