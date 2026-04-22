import { datoRequest } from '../client';
import type { PracticeSummary } from '$lib/types/datocms';
import { resolveContentLocale } from '$lib/i18n';

const QUERY = /* GraphQL */ `
  query PracticeIndex($locale: SiteLocale!) {
    allPractices(
      locale: $locale
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
  allPractices: Array<{
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

export async function getPracticeIndex(locale: string): Promise<PracticeSummary[]> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<RawData>(QUERY, { locale: resolved });
  return data.allPractices;
}
