import { DATO_CMS_READONLY_TOKEN } from '$env/static/private';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

const DATO_ENDPOINT = 'https://graphql.datocms.com/';

/**
 * Preview stand: `DATO_CMS_PREVIEW=true yarn dev` serves draft records
 * (X-Include-Drafts) so unpublished content can be reviewed locally.
 * Never set in CI/production builds.
 */
const PREVIEW_STAND = env.DATO_CMS_PREVIEW === 'true';

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

/** Thrown on HTTP 401/403 — a token/permission problem, never a content problem. */
export class DatoAuthError extends Error {
  constructor(status: number) {
    super(`[DatoCMS] HTTP ${status} — DATO_CMS_READONLY_TOKEN is invalid or revoked`);
    this.name = 'DatoAuthError';
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

  if (options.preview ?? PREVIEW_STAND) {
    headers['X-Include-Drafts'] = 'true';
  }

  const response = await fetch(DATO_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const authError = new DatoAuthError(response.status);
      if (building) {
        // Fail-fast guard: with a dead token every tolerant catch downstream
        // degrades to "empty content", and the prerender would SUCCEED —
        // deploying an empty site over the live one. Kill the build instead;
        // the previous deploy stays up.
        console.error(authError.message);
        process.exit(1);
      }
      throw authError;
    }
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
