import { datoRequest } from '../client';
import type { GalleryItem } from '$lib/types/datocms';
import { resolveContentLocale } from '$lib/types/datocms';

// Gallery items are derived from the `gallery` asset gallery field on practice records.

const QUERY = /* GraphQL */ `
  query GalleryItems($locale: SiteLocale!) {
    allPractices(
      locale: $locale
      filter: { _status: { eq: published } }
      orderBy: publishedDate_DESC
    ) {
      id
      title
      slug
      publishedDate
      gallery { url alt width height blurUpThumb }
    }
  }
`;

interface RawPost {
  id: string;
  title: string;
  slug: string;
  publishedDate: string;
  gallery: Array<{
    url: string;
    alt: string | null;
    width: number;
    height: number;
    blurUpThumb: string | null;
  }>;
}

export async function getGalleryItems(locale: string): Promise<GalleryItem[]> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<{ allPractices: RawPost[] }>(QUERY, { locale: resolved });
  const items: GalleryItem[] = [];
  for (const post of data.allPractices) {
    for (const image of post.gallery) {
      items.push({
        imageUrl: image.url,
        imageAlt: image.alt ?? post.title,
        postTitle: post.title,
        postSlug: post.slug,
        locale,
        publishedDate: post.publishedDate,
      });
    }
  }
  return items;
}
