import { datoRequest } from '../client';
import type { Practice } from '$lib/types/datocms';
import { LOCALES, resolveContentLocale } from '$lib/types/datocms';

const POST_QUERY = /* GraphQL */ `
  query Practice($locale: SiteLocale!, $slug: String!) {
    practice(locale: $locale, filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      excerpt
      coverImage { url alt width height blurUpThumb }
      publishedDate
      featured
      content { value }
      gallery { url alt width height blurUpThumb }
      youtubeUrl
      seo {
        title
        description
        image { url alt width height }
      }
    }
  }
`;

export async function getAllPracticeSlugs(): Promise<{ locale: string; slug: string }[]> {
  const entries: { locale: string; slug: string }[] = [];

  for (const locale of LOCALES) {
    try {
      const resolved = resolveContentLocale(locale);
      const data = await datoRequest<{ allPractices: { slug: string }[] }>(
        /* GraphQL */ `
          query PracticeSlugs($locale: SiteLocale!) {
            allPractices(
              locale: $locale
              filter: { _status: { eq: published } }
            ) {
              slug
            }
          }
        `,
        { locale: resolved }
      );
      for (const { slug } of data.allPractices) {
        entries.push({ locale, slug });
      }
    } catch {
      // Skip silently on error.
    }
  }

  // Deduplicate: same slug may appear for multiple locales (all resolve to 'ru').
  const seen = new Set<string>();
  return entries.filter(({ locale, slug }) => {
    const key = `${locale}:${slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getPracticeBySlug(
  locale: string,
  slug: string
): Promise<Practice | null> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<{ practice: Practice | null }>(POST_QUERY, {
    locale: resolved,
    slug,
  });
  return data.practice;
}
