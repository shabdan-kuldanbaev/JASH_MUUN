import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageServerLoad } from './$types';
import { DEFAULT_LOCALE } from '$i18n';

export const load: PageServerLoad = async () => {
  redirect(302, resolve(`/${DEFAULT_LOCALE}/`));
};
