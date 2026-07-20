import type { PageServerLoad } from './$types';
import { LOCALES } from '$i18n';
import type { ArchiveItem } from '$lib/types/datocms';
import { getArchiveItems } from '$lib/server/datocms/queries/archive';
import { DatoLocaleError } from '$lib/server/datocms/client';

export const prerender = true;

export function entries() {
  return LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();

  let items: ArchiveItem[];
  try {
    items = await getArchiveItems(parentData.locale);
  } catch (err) {
    if (!(err instanceof DatoLocaleError)) {
      console.warn('[DatoCMS] getArchiveItems failed:', err);
    }
    items = [];
  }

  return {
    locale: parentData.locale,
    siteSettings: parentData.siteSettings,
    items
  };
};
