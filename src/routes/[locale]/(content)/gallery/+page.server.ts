import type { PageServerLoad } from './$types';
import { LOCALES } from '$i18n';
import type { GalleryItem } from '$lib/types/datocms';
import { getGalleryItems } from '$lib/server/datocms/queries/gallery';
import { DatoLocaleError } from '$lib/server/datocms/client';

export const prerender = true;

export function entries() {
  return LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  let items: GalleryItem[];
  try {
    items = await getGalleryItems(parentData.locale);
  } catch (err) {
    if (!(err instanceof DatoLocaleError)) {
      console.warn('[DatoCMS] getGalleryItems failed:', err);
    }
    items = [];
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    items
  };
};
