import { datoRequest, DatoLocaleError } from '../client';
import { LOCALIZED_ALT } from '../fragments';
import type { SiteSettings } from '$lib/types/datocms';
import { CMS_FALLBACK_LOCALE } from '$lib/i18n';
import type { Locale } from '$lib/i18n';

// Uses only the built-in DatoCMS _site global SEO.
// There is no site_settings singleton model in this project.

const QUERY = /* GraphQL */ `
  query SiteSettings($locale: SiteLocale!, $fallbackLocales: [SiteLocale!]!) {
    _site {
      globalSeo(locale: $locale, fallbackLocales: $fallbackLocales) {
        siteName
        fallbackSeo {
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
  }
`;

interface RawData {
  _site: {
    globalSeo: {
      siteName: string;
      fallbackSeo: {
        title: string | null;
        description: string | null;
        image: { url: string; alt: string | null; width: number; height: number } | null;
      } | null;
    } | null;
  };
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  try {
    const data = await datoRequest<RawData>(QUERY, {
      locale,
      fallbackLocales: [CMS_FALLBACK_LOCALE]
    });
    return {
      siteName: data._site.globalSeo?.siteName ?? 'Jash-Muun',
      defaultSeo: data._site.globalSeo?.fallbackSeo ?? null
    };
  } catch (err) {
    if (!(err instanceof DatoLocaleError)) {
      console.warn('[DatoCMS] getSiteSettings failed, using defaults:', err);
    }
    return { siteName: 'Jash-Muun', defaultSeo: null };
  }
}
