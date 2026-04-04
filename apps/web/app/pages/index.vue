<script setup lang="ts">
import type { MetadataField, MetadataRecord } from '~/types/metadata';

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

const metadataFields: MetadataField[] = [
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
      <MetadataForm v-model="url" :error="error" :is-loading="isLoading" @submit="handleSubmit" />
      <RecentLookups :recent-urls="recentUrls" @select="rerunRecent" />
    </section>

    <MetadataResults :metadata-fields="metadataFields" :result="result" />
  </main>
</template>
