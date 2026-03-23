export type MetadataResult = {
  title: string | null;
  description: string | null;
  siteName: string | null;
  ogImage: string | null;
  canonical: string | null;
  favicon: string | null;
  finalUrl: string;
};

export class MetadataFetchError extends Error {
  constructor(
    public readonly code: 'FETCH_FAILED' | 'NOT_HTML' | 'REQUEST_TIMEOUT',
    message: string,
    public readonly status: 415 | 502 | 504,
  ) {
    super(message);
  }
}

const META_TAG_PATTERN = /<meta\b[^>]*>/gi;
const LINK_TAG_PATTERN = /<link\b[^>]*>/gi;
const TITLE_TAG_PATTERN = /<title\b[^>]*>([\s\S]*?)<\/title>/i;
const ATTRIBUTE_PATTERN =
  /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

function getHeadChunk(html: string) {
  const headEnd = html.search(/<\/head>/i);
  return html.slice(0, headEnd > -1 ? headEnd : 65_536);
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCharCode(Number(value)))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAttributes(tag: string) {
  const attributes = new Map<string, string>();

  for (const match of tag.matchAll(ATTRIBUTE_PATTERN)) {
    const [, rawName, doubleQuoted, singleQuoted, unquoted] = match;
    const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
    attributes.set(rawName.toLowerCase(), decodeHtmlEntities(value));
  }

  return attributes;
}

function pickMetaContent(tags: Array<Map<string, string>>, keys: string[]) {
  for (const key of keys) {
    const normalizedKey = key.toLowerCase();

    for (const attributes of tags) {
      const candidate = attributes.get('property') ?? attributes.get('name');

      if (candidate?.toLowerCase() === normalizedKey) {
        return attributes.get('content') ?? null;
      }
    }
  }

  return null;
}

function resolveUrl(candidate: string | null, baseUrl: string) {
  if (!candidate) {
    return null;
  }

  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

export function extractMetadata(html: string, finalUrl: string): MetadataResult {
  const headChunk = getHeadChunk(html);
  const metaTags = Array.from(headChunk.matchAll(META_TAG_PATTERN), (match) =>
    parseAttributes(match[0]),
  );
  const linkTags = Array.from(headChunk.matchAll(LINK_TAG_PATTERN), (match) =>
    parseAttributes(match[0]),
  );
  const titleMatch = headChunk.match(TITLE_TAG_PATTERN);

  const canonicalLink =
    linkTags.find((attributes) => attributes.get('rel')?.toLowerCase().includes('canonical')) ??
    null;

  const faviconLink =
    linkTags.find((attributes) => {
      const rel = attributes.get('rel')?.toLowerCase() ?? '';
      return rel.includes('icon');
    }) ?? null;

  return {
    title:
      pickMetaContent(metaTags, ['og:title', 'twitter:title']) ??
      (titleMatch ? decodeHtmlEntities(titleMatch[1]) : null),
    description: pickMetaContent(metaTags, ['description', 'og:description', 'twitter:description']),
    siteName: pickMetaContent(metaTags, ['og:site_name', 'application-name']),
    ogImage: resolveUrl(pickMetaContent(metaTags, ['og:image', 'twitter:image']), finalUrl),
    canonical: resolveUrl(canonicalLink?.get('href') ?? null, finalUrl),
    favicon:
      resolveUrl(faviconLink?.get('href') ?? null, finalUrl) ??
      new URL('/favicon.ico', finalUrl).toString(),
    finalUrl,
  };
}

export async function fetchMetadata(url: string, timeoutMs: number): Promise<MetadataResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'LinkLens/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new MetadataFetchError(
        'FETCH_FAILED',
        `The remote server responded with ${response.status}.`,
        502,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    const isHtml =
      contentType.includes('text/html') || contentType.includes('application/xhtml+xml');

    if (!isHtml) {
      throw new MetadataFetchError(
        'NOT_HTML',
        `Expected an HTML document but received "${contentType || 'unknown content type'}".`,
        415,
      );
    }

    const html = await response.text();
    return extractMetadata(html, response.url);
  } catch (error) {
    if (error instanceof MetadataFetchError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new MetadataFetchError(
        'REQUEST_TIMEOUT',
        `The remote page did not respond within ${timeoutMs}ms.`,
        504,
      );
    }

    throw new MetadataFetchError(
      'FETCH_FAILED',
      'Unable to fetch the remote page.',
      502,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
