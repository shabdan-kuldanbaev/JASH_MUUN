import { LOCALES } from '$i18n';
import { SITE_URL } from '$lib/site';
import { getAllArticleSlugs } from '$lib/server/datocms/queries/article';
import { getAllPracticeSlugs } from '$lib/server/datocms/queries/practice';

export const prerender = true;

/** Escape XML special characters so a CMS-authored slug can never break the document. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  const urls: string[] = [];

  for (const locale of LOCALES) {
    urls.push(
      `${SITE_URL}/${locale}/`,
      `${SITE_URL}/${locale}/practices/`,
      `${SITE_URL}/${locale}/articles/`,
      `${SITE_URL}/${locale}/gallery/`
    );
  }

  const [practiceSlugs, articleSlugs] = await Promise.all([
    getAllPracticeSlugs(),
    getAllArticleSlugs()
  ]);

  // The slug queries swallow per-locale CMS errors; surface an empty result in the build log
  // so a transient outage cannot silently ship a sitemap without detail URLs.
  if (practiceSlugs.length === 0) {
    console.warn('[DatoCMS] getAllPracticeSlugs returned no entries, sitemap omits practice URLs');
  }
  if (articleSlugs.length === 0) {
    console.warn('[DatoCMS] getAllArticleSlugs returned no entries, sitemap omits article URLs');
  }

  for (const { locale, slug } of practiceSlugs) {
    if (!slug) continue;
    urls.push(`${SITE_URL}/${locale}/practices/${slug}/`);
  }
  for (const { locale, slug } of articleSlugs) {
    if (!slug) continue;
    urls.push(`${SITE_URL}/${locale}/articles/${slug}/`);
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>'
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
