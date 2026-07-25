import { datoRequest } from '../client';
import { LOCALIZED_ALT } from '../fragments';
import type { PracticeSummary } from '$lib/types/datocms';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';

const QUERY = /* GraphQL */ `
  query PracticeIndex($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!) {
    allPractices(
      locale: $locale
      fallbackLocales: $fallbackLocales
      orderBy: publishedDate_DESC
      filter: { _status: { eq: published } }
    ) {
      id
      title
      shortTitle
      slug
      excerpt
      coverImage {
        url
        ${LOCALIZED_ALT}
        width
        height
        blurUpThumb
      }
      publishedDate
      featured
      category
    }
  }
`;

interface RawData {
  allPractices: Array<{
    id: string;
    title: string;
    shortTitle: string | null;
    slug: string;
    excerpt: string | null;
    coverImage: {
      url: string;
      alt: string | null;
      width: number;
      height: number;
      blurUpThumb: string | null;
    } | null;
    publishedDate: string;
    featured: boolean;
    category: string | null;
  }>;
}

export async function getPracticeIndex(locale: Locale): Promise<PracticeSummary[]> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<RawData>(QUERY, {
    locale: resolved,
    fallbackLocales: [CMS_FALLBACK_LOCALE]
  });
  return data.allPractices;
}
