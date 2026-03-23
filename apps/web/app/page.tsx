'use client';

import { FormEvent, useEffect, useState } from 'react';

type MetadataRecord = {
  title: string | null;
  description: string | null;
  siteName: string | null;
  ogImage: string | null;
  canonical: string | null;
  favicon: string | null;
  finalUrl: string;
};

type ApiSuccess = {
  ok: true;
  data: MetadataRecord;
};

type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

const RECENT_URLS_KEY = 'linklens.recent-urls';
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8787';

const metadataFields: Array<{ key: keyof MetadataRecord; label: string }> = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'siteName', label: 'Site name' },
  { key: 'canonical', label: 'Canonical URL' },
  { key: 'favicon', label: 'Favicon' },
  { key: 'ogImage', label: 'OG image' },
  { key: 'finalUrl', label: 'Final URL' },
];

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function prettifyHostname(input: string) {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return input;
  }
}

function mergeRecentUrls(nextUrl: string, currentUrls: string[]) {
  return [nextUrl, ...currentUrls.filter((candidate) => candidate !== nextUrl)].slice(0, 5);
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<MetadataRecord | null>(null);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(RECENT_URLS_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;

      if (Array.isArray(parsed)) {
        setRecentUrls(parsed.filter((value): value is string => typeof value === 'string'));
      }
    } catch {
      window.localStorage.removeItem(RECENT_URLS_KEY);
    }
  }, []);

  async function submitUrl(nextUrl: string) {
    const trimmed = nextUrl.trim();

    if (!isHttpUrl(trimmed)) {
      setError('Enter a valid http:// or https:// URL.');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmed }),
      });

      const payload = (await response.json()) as ApiSuccess | ApiError;

      if (!response.ok || !payload.ok) {
        const message =
          payload.ok === false ? payload.error.message : 'The metadata request failed.';
        throw new Error(message);
      }

      setResult(payload.data);

      setRecentUrls((current) => {
        const nextRecent = mergeRecentUrls(trimmed, current);
        window.localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(nextRecent));
        return nextRecent;
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'The metadata request failed.';
      setError(message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitUrl(url);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">
            LinkLens
          </p>
          <h1 className="mt-4 text-4xl leading-tight text-ink sm:text-5xl">
            Inspect a page before you open ten tabs.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/80 sm:text-lg">
            Paste any URL and LinkLens will fetch the page through the Hono API, inspect the raw
            HTML, and surface the metadata you actually care about.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink/75">URL</span>
              <input
                className="w-full rounded-3xl border border-ink/10 bg-mist/80 px-5 py-4 text-base outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </label>
            <button
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal disabled:cursor-not-allowed disabled:bg-ink/40"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Inspecting...' : 'Fetch metadata'}
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-3xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink">
              {error}
            </div>
          ) : null}
        </div>

        <aside className="rounded-4xl border border-white/70 bg-ink p-6 text-white shadow-panel sm:p-8">
          <h2 className="text-2xl">Recent lookups</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Results are stored in your browser only. Use a recent URL to rerun the lookup quickly.
          </p>

          <div className="mt-6 space-y-3">
            {recentUrls.length > 0 ? (
              recentUrls.map((recentUrl) => (
                <button
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/30 hover:bg-white/10"
                  key={recentUrl}
                  type="button"
                  onClick={() => {
                    setUrl(recentUrl);
                    void submitUrl(recentUrl);
                  }}
                >
                  <div className="text-sm font-semibold">{prettifyHostname(recentUrl)}</div>
                  <div className="mt-1 truncate text-xs text-white/65">{recentUrl}</div>
                </button>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/20 px-4 py-5 text-sm text-white/60">
                No recent URLs yet.
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-8 rounded-4xl border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Result</p>
            <h2 className="mt-2 text-3xl text-ink">Metadata snapshot</h2>
          </div>
          {result ? (
            <a
              className="text-sm font-medium text-teal underline decoration-teal/30 underline-offset-4"
              href={result.finalUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open final URL
            </a>
          ) : null}
        </div>

        {result ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {metadataFields.map(({ key, label }) => {
              const value = result[key];
              const isLinkValue =
                typeof value === 'string' &&
                (value.startsWith('http://') || value.startsWith('https://'));

              return (
                <article
                  className="rounded-3xl border border-ink/10 bg-sand/60 p-4"
                  key={key}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                    {label}
                  </p>
                  {value ? (
                    isLinkValue ? (
                      <a
                        className="mt-3 block break-all text-sm leading-6 text-teal underline decoration-teal/30 underline-offset-4"
                        href={value}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-ink/85">{value}</p>
                    )
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-ink/45">Not found</p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-ink/15 bg-mist/50 px-5 py-12 text-center text-sm leading-6 text-ink/60">
            Submit a URL to inspect its metadata.
          </div>
        )}

        {result?.ogImage ? (
          <div className="mt-6 overflow-hidden rounded-4xl border border-ink/10 bg-white">
            {/* Use a native img tag to avoid remote image configuration for arbitrary URLs. */}
            <img
              alt={result.title ? `${result.title} OG image` : 'Open Graph preview'}
              className="h-auto max-h-[24rem] w-full object-cover"
              src={result.ogImage}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
