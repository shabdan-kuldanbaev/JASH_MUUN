import { datoRequest } from '../client';
import { LOCALIZED_ALT } from '../fragments';
import type { ArchiveItem } from '$lib/types/datocms';
import { datoKey } from '$lib/imgix';
import { CMS_FALLBACK_LOCALE, resolveContentLocale } from '$lib/i18n';
import type { Locale } from '$lib/i18n';

// The archive pulls EVERY image asset from the CMS into one mixed wall:
//   practice → coverImage + gallery + every page_sections image (SectionRecord
//              image/imageSecondary + nested StageBlockRecord image/imageSecondary),
//              tagged with the practice category
//   article  → coverImage + every SectionRecord image/imageSecondary, no category
// Images are de-duped by URL and interleaved across sources so the wall reads as
// one mixed collection rather than clusters of same-source photos.

// Shared image selection set (interpolated into the query — same fields the
// masonry needs: dims for aspect ratio, blurUpThumb for the blur-up).
const IMG = `{
  url
  ${LOCALIZED_ALT}
  width
  height
  blurUpThumb
}`;

const QUERY = /* GraphQL */ `
  query Archive($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!) {
    allPractices(
      locale: $locale
      fallbackLocales: $fallbackLocales
      filter: { _status: { eq: published } }
      orderBy: publishedDate_DESC
    ) {
      title
      slug
      category
      coverImage ${IMG}
      gallery ${IMG}
      pageSections {
        __typename
        ... on SectionRecord {
          image ${IMG}
          imageSecondary ${IMG}
          items {
            __typename
            ... on StageBlockRecord {
              image ${IMG}
              imageSecondary ${IMG}
            }
          }
        }
      }
    }
    allArticles(
      locale: $locale
      fallbackLocales: $fallbackLocales
      filter: { _status: { eq: published } }
      orderBy: publishedDate_DESC
    ) {
      title
      slug
      coverImage ${IMG}
      pageSections {
        __typename
        ... on SectionRecord {
          image ${IMG}
          imageSecondary ${IMG}
        }
      }
    }
  }
`;

interface RawImage {
  url: string;
  alt: string | null;
  width: number;
  height: number;
  blurUpThumb: string | null;
}

interface RawStage {
  __typename: string;
  image: RawImage | null;
  imageSecondary: RawImage | null;
}

interface RawSection {
  __typename: string;
  image: RawImage | null;
  imageSecondary: RawImage | null;
  items?: RawStage[] | null;
}

interface RawData {
  allPractices: Array<{
    title: string;
    slug: string;
    category: string | null;
    coverImage: RawImage | null;
    gallery: RawImage[] | null;
    pageSections: RawSection[] | null;
  }>;
  allArticles: Array<{
    title: string;
    slug: string;
    coverImage: RawImage | null;
    pageSections: RawSection[] | null;
  }>;
}

/** One source (practice/article) reduced to its ordered list of archive items. */
interface Source {
  images: ArchiveItem[];
}

// Every image a record exposes: cover, gallery, and each section image (incl.
// nested ritual stage frames). Order = cover → gallery → sections (reading order).
//
// EXTENSIBILITY: image sources are enumerated explicitly (GraphQL needs typed
// fields). To add a NEW image-bearing page_sections block type, extend BOTH the
// `... on XRecord { image ${IMG} ... }` fragment in QUERY above AND the switch
// below — otherwise its images are silently absent from the archive.
function collectImages(
  cover: RawImage | null,
  gallery: RawImage[] | null | undefined,
  sections: RawSection[] | null
): RawImage[] {
  const imgs: Array<RawImage | null> = [cover];
  if (gallery) imgs.push(...gallery);
  if (sections) {
    for (const sec of sections) {
      if (sec.__typename !== 'SectionRecord') continue;
      imgs.push(sec.image, sec.imageSecondary);
      if (sec.items) {
        for (const it of sec.items) {
          if (it.__typename === 'StageBlockRecord') imgs.push(it.image, it.imageSecondary);
        }
      }
    }
  }
  return imgs.filter((x): x is RawImage => x != null);
}

function toItem(image: RawImage, sourceTitle: string, category: string | null): ArchiveItem {
  return {
    key: datoKey(image.url),
    imageUrl: image.url,
    imageAlt: image.alt ?? sourceTitle,
    width: image.width,
    height: image.height,
    blurUpThumb: image.blurUpThumb,
    category
  };
}

export async function getArchiveItems(locale: Locale): Promise<ArchiveItem[]> {
  const resolved = resolveContentLocale(locale);
  const data = await datoRequest<RawData>(QUERY, {
    locale: resolved,
    fallbackLocales: [CMS_FALLBACK_LOCALE]
  });

  const sources: Source[] = [];

  for (const p of data.allPractices) {
    const images = collectImages(p.coverImage, p.gallery, p.pageSections).map((img) =>
      toItem(img, p.title, p.category)
    );
    if (images.length) sources.push({ images });
  }

  for (const a of data.allArticles) {
    const images = collectImages(a.coverImage, null, a.pageSections).map((img) =>
      toItem(img, a.title, null)
    );
    if (images.length) sources.push({ images });
  }

  // Interleave across sources (round-robin by position) + de-dup by base URL, so
  // the wall mixes practices/articles instead of showing them in source blocks.
  const out: ArchiveItem[] = [];
  const seen = new Set<string>();
  const maxLen = sources.reduce((m, s) => Math.max(m, s.images.length), 0);
  for (let row = 0; row < maxLen; row++) {
    for (const source of sources) {
      const item = source.images[row];
      if (item && !seen.has(item.key)) {
        seen.add(item.key);
        out.push(item);
      }
    }
  }

  return out;
}
