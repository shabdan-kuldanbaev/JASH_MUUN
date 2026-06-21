import { datoRequest } from '../client';
import type { Practice } from '$lib/types/datocms';
import { LOCALES, CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';

const POST_QUERY = /* GraphQL */ `
  query Practice($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!, $slug: String!) {
    practice(locale: $locale, fallbackLocales: $fallbackLocales, filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      excerpt
      coverImage {
        url
        alt
        width
        height
        blurUpThumb
      }
      publishedDate
      featured
      content {
        value
        blocks {
          __typename
          ... on AssetRecord {
            id
            image {
              url
              alt
              width
              height
              blurUpThumb
            }
            images {
              url
              alt
              width
              height
              blurUpThumb
            }
          }
        }
      }
      gallery {
        url
        alt
        width
        height
        blurUpThumb
      }
      youtubeUrl
      seo {
        title
        description
        image {
          url
          alt
          width
          height
        }
      }
    }
  }
`;

export async function getAllPracticeSlugs(): Promise<{ locale: Locale; slug: string }[]> {
  const entries: { locale: Locale; slug: string }[] = [];

  for (const locale of LOCALES) {
    try {
      const resolved = resolveContentLocale(locale);
      const data = await datoRequest<{ allPractices: { slug: string }[] }>(
        /* GraphQL */ `
          query PracticeSlugs($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!) {
            allPractices(
              locale: $locale
              fallbackLocales: $fallbackLocales
              filter: { _status: { eq: published } }
            ) {
              slug
            }
          }
        `,
        { locale: resolved, fallbackLocales: [CMS_FALLBACK_LOCALE] }
      );
      for (const { slug } of data.allPractices) {
        entries.push({ locale, slug });
      }
    } catch {
      // Skip silently on error.
    }
  }

  // Deduplicate: same slug may appear for multiple locales when slugs are shared.
  const seen = new Set<string>();
  return entries.filter(({ locale, slug }) => {
    const key = `${locale}:${slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getPracticeBySlug(locale: Locale, slug: string): Promise<Practice | null> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<{ practice: Practice | null }>(POST_QUERY, {
    locale: resolved,
    fallbackLocales: [CMS_FALLBACK_LOCALE],
    slug
  });
  return data.practice;
}
