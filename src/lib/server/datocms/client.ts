import { DATO_CMS_READONLY_TOKEN } from '$env/static/private';

const DATO_ENDPOINT = 'https://graphql.datocms.com/';

export interface DatoRequestOptions {
  preview?: boolean;
}

/** Thrown when a locale value is not configured in DatoCMS — catch silently. */
export class DatoLocaleError extends Error {
  constructor(locale: string) {
    super(`Locale '${locale}' is not configured in DatoCMS`);
    this.name = 'DatoLocaleError';
  }
}

/**
 * Send a GraphQL request to the DatoCMS Content Delivery API.
 * Server-only — never call from client-side code.
 */
export async function datoRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: DatoRequestOptions = {}
): Promise<T> {
  if (!DATO_CMS_READONLY_TOKEN) {
    throw new Error('[DatoCMS] DATO_CMS_READONLY_TOKEN is not set. Add it to your .env file.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DATO_CMS_READONLY_TOKEN}`,
    // Silently exclude invalid records (missing locales, broken references)
    'X-Exclude-Invalid': 'true'
  };

  if (options.preview) {
    headers['X-Include-Drafts'] = 'true';
  }

  const response = await fetch(DATO_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(
      `[DatoCMS] HTTP ${response.status} ${response.statusText} — check your token and network.`
    );
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: { message: string; locations?: unknown; path?: unknown }[];
  };

  if (json.errors?.length) {
    const messages = json.errors.map((e) => e.message).join('\n');
    // Detect "Variable $locale ... provided invalid value" — locale not yet in DatoCMS
    if (messages.includes('provided invalid value') && variables.locale) {
      throw new DatoLocaleError(String(variables.locale));
    }
    throw new Error(`[DatoCMS] GraphQL error:\n${messages}`);
  }

  return json.data as T;
}
