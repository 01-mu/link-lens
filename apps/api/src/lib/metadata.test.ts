import { describe, expect, it } from 'vitest';
import { extractMetadata } from './metadata';

describe('extractMetadata', () => {
  it('extracts key metadata fields from html', () => {
    const html = `
      <html>
        <head>
          <title>Example title</title>
          <meta name="description" content="Example description" />
          <meta property="og:site_name" content="Example site" />
          <meta property="og:image" content="/og.png" />
          <link rel="canonical" href="/canonical" />
          <link rel="icon" href="/favicon.png" />
        </head>
      </html>
    `;

    expect(extractMetadata(html, 'https://example.com/page')).toEqual({
      title: 'Example title',
      description: 'Example description',
      siteName: 'Example site',
      ogImage: 'https://example.com/og.png',
      canonical: 'https://example.com/canonical',
      favicon: 'https://example.com/favicon.png',
      finalUrl: 'https://example.com/page',
    });
  });
});
