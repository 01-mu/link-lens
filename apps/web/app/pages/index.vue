<script setup lang="ts">
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

const metadataFields: Array<{ key: keyof MetadataRecord; label: string }> = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'siteName', label: 'Site name' },
  { key: 'canonical', label: 'Canonical URL' },
  { key: 'favicon', label: 'Favicon' },
  { key: 'ogImage', label: 'OG image' },
  { key: 'finalUrl', label: 'Final URL' },
];

const config = useRuntimeConfig();

const url = ref('');
const result = ref<MetadataRecord | null>(null);
const recentUrls = ref<string[]>([]);
const error = ref<string | null>(null);
const isLoading = ref(false);

const apiBaseUrl = computed(() =>
  (config.public.apiBaseUrl || 'http://127.0.0.1:8787').replace(/\/$/, ''),
);

useHead({
  title: 'LinkLens',
  meta: [
    {
      name: 'description',
      content: 'A small URL metadata viewer built with Nuxt and Hono.',
    },
  ],
});

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

onMounted(() => {
  const stored = window.localStorage.getItem(RECENT_URLS_KEY);

  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;

    if (Array.isArray(parsed)) {
      recentUrls.value = parsed.filter((value): value is string => typeof value === 'string');
    }
  } catch {
    window.localStorage.removeItem(RECENT_URLS_KEY);
  }
});

async function submitUrl(nextUrl: string) {
  const trimmed = nextUrl.trim();

  if (!isHttpUrl(trimmed)) {
    error.value = 'Enter a valid http:// or https:// URL.';
    result.value = null;
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${apiBaseUrl.value}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: trimmed }),
    });

    const payload = (await response.json()) as ApiSuccess | ApiError;

    if (!response.ok || !payload.ok) {
      const message = payload.ok === false ? payload.error.message : 'The metadata request failed.';
      throw new Error(message);
    }

    result.value = payload.data;
    recentUrls.value = mergeRecentUrls(trimmed, recentUrls.value);
    window.localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(recentUrls.value));
  } catch (requestError) {
    error.value =
      requestError instanceof Error ? requestError.message : 'The metadata request failed.';
    result.value = null;
  } finally {
    isLoading.value = false;
  }
}

async function handleSubmit() {
  await submitUrl(url.value);
}

async function rerunRecent(recentUrl: string) {
  url.value = recentUrl;
  await submitUrl(recentUrl);
}
</script>

<template>
  <main class="page-shell">
    <section class="hero-grid">
      <div class="panel panel-light">
        <p class="eyebrow">LinkLens</p>
        <h1>Inspect a page before you open ten tabs.</h1>
        <p class="lede">
          Paste any URL and LinkLens will fetch the page through the Hono API, inspect the raw
          HTML, and surface the metadata you actually care about.
        </p>

        <form class="stack" @submit.prevent="handleSubmit">
          <label class="field">
            <span>URL</span>
            <input
              v-model="url"
              type="url"
              inputmode="url"
              placeholder="https://example.com"
            />
          </label>
          <button :disabled="isLoading" type="submit">
            {{ isLoading ? 'Inspecting...' : 'Fetch metadata' }}
          </button>
        </form>

        <div v-if="error" class="error-banner">
          {{ error }}
        </div>
      </div>

      <aside class="panel panel-dark">
        <h2>Recent lookups</h2>
        <p class="aside-copy">
          Results are stored in your browser only. Use a recent URL to rerun the lookup quickly.
        </p>

        <div class="stack recent-list">
          <button
            v-for="recentUrl in recentUrls"
            :key="recentUrl"
            class="recent-card"
            type="button"
            @click="rerunRecent(recentUrl)"
          >
            <div class="recent-title">{{ prettifyHostname(recentUrl) }}</div>
            <div class="recent-url">{{ recentUrl }}</div>
          </button>

          <div v-if="recentUrls.length === 0" class="empty-state">
            No recent URLs yet.
          </div>
        </div>
      </aside>
    </section>

    <section class="panel panel-light result-panel">
      <div class="result-header">
        <div>
          <p class="eyebrow">Result</p>
          <h2>Metadata snapshot</h2>
        </div>
        <a v-if="result" :href="result.finalUrl" rel="noreferrer" target="_blank">
          Open final URL
        </a>
      </div>

      <div v-if="result" class="result-grid">
        <article v-for="{ key, label } in metadataFields" :key="key" class="result-card">
          <p class="result-label">{{ label }}</p>
          <a
            v-if="result[key] && typeof result[key] === 'string' && /^(http|https):\/\//.test(result[key]!)"
            :href="result[key]!"
            rel="noreferrer"
            target="_blank"
          >
            {{ result[key] }}
          </a>
          <p v-else-if="result[key]">{{ result[key] }}</p>
          <p v-else class="muted">Not found</p>
        </article>
      </div>

      <div v-else class="empty-state empty-state-large">
        Submit a URL to inspect its metadata.
      </div>

      <div v-if="result?.ogImage" class="image-frame">
        <img
          :alt="result.title ? `${result.title} OG image` : 'Open Graph preview'"
          :src="result.ogImage"
        />
      </div>
    </section>
  </main>
</template>
