import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPracticeBySlug, getAllPracticeSlugs } from '$lib/server/datocms/queries/practice';
import { getPracticeSections } from '$lib/server/datocms/queries/practiceSections';

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

  // Practices render strictly through modular `page_sections` from DatoCMS.
  const sections = await getPracticeSections(parentData.locale, slug).catch(() => null);

  // No sections → the practice has no valid presentation. 404 rather than render
  // an empty immersive shell. (Narrows `sections` to a non-null array for the page.)
  if (!sections || sections.length === 0) {
    throw error(404, `Practice has no page sections: ${slug}`);
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    practice,
    sections
  };
};
