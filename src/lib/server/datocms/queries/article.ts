import { datoRequest } from '../client';
import { LOCALIZED_ALT } from '../fragments';
import type { Article } from '$lib/types/datocms';
import { LOCALES, CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';

const ARTICLE_QUERY = /* GraphQL */ `
  query Article($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!, $slug: String!) {
    article(locale: $locale, fallbackLocales: $fallbackLocales, filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      excerpt
      seo {
        title
        description
        image {
          url
          ${LOCALIZED_ALT}
          width
          height
        }
      }
    }
  }
`;

export async function getAllArticleSlugs(): Promise<{ locale: Locale; slug: string }[]> {
  const entries: { locale: Locale; slug: string }[] = [];

  for (const locale of LOCALES) {
    try {
      const resolved = resolveContentLocale(locale);
      const data = await datoRequest<{ allArticles: { slug: string }[] }>(
        /* GraphQL */ `
          query ArticleSlugs($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!) {
            allArticles(
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
      for (const { slug } of data.allArticles) {
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

export async function getArticleBySlug(locale: Locale, slug: string): Promise<Article | null> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<{ article: Article | null }>(ARTICLE_QUERY, {
    locale: resolved,
    fallbackLocales: [CMS_FALLBACK_LOCALE],
    slug
  });
  return data.article;
}
