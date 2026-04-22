import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isValidLocale, DEFAULT_LOCALE } from '$lib/types/datocms';
import { getSiteSettings } from '$lib/server/datocms/queries/siteSettings';

export const load: LayoutServerLoad = async ({ params }) => {
  const { locale } = params;

  if (!isValidLocale(locale)) {
    redirect(302, `/${DEFAULT_LOCALE}/`);
  }

  const siteSettings = await getSiteSettings(locale);

  return { locale, siteSettings };
};
