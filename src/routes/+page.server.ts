import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageServerLoad } from './$types';
import { DEFAULT_LOCALE } from '$lib/types/datocms';

export const load: PageServerLoad = async () => {
  redirect(302, `${base}/${DEFAULT_LOCALE}/`);
};
