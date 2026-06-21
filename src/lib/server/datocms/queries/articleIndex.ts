import { datoRequest } from '../client';
import type { ArticleSummary } from '$lib/types/datocms';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';

const QUERY = /* GraphQL */ `
  query ArticleIndex($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!) {
    allArticles(
      locale: $locale
      fallbackLocales: $fallbackLocales
      orderBy: publishedDate_DESC
      filter: { _status: { eq: published } }
    ) {
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
    }
  }
`;

interface RawData {
  allArticles: Array<{
    id: string;
    title: string;
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
  }>;
}

export async function getArticleIndex(locale: Locale): Promise<ArticleSummary[]> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<RawData>(QUERY, {
    locale: resolved,
    fallbackLocales: [CMS_FALLBACK_LOCALE]
  });
  return data.allArticles;
}
