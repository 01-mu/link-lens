<script setup lang="ts">
import type { MetadataField, MetadataRecord } from '~/types/metadata';
import type { ApiError, MetadataResponse } from '~/types/api';

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

const url = ref('');
const requestedUrl = ref('');
const result = ref<MetadataRecord | null>(null);
const recentUrls = ref<string[]>([]);
const error = ref<string | null>(null);
const requestKey = ref(0);

const {
  data: metadataResponse,
  error: requestError,
  status: requestStatus,
  execute: executeMetadataRequest,
} = useApi<MetadataResponse>('/metadata', {
  method: 'POST',
  immediate: false,
  watch: false,
  key: computed(() => `metadata-${requestKey.value}`),
  body: computed(() => ({
    url: requestedUrl.value,
  })),
});

const isLoading = computed(() => requestStatus.value === 'pending');

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

function getRequestErrorMessage(requestFailure: unknown) {
  if (requestFailure && typeof requestFailure === 'object') {
    const payload = (requestFailure as { data?: ApiError }).data;

    if (payload?.ok === false) {
      return payload.error.message;
    }

    const message = (requestFailure as { message?: string }).message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return 'The metadata request failed.';
}

function getMetadataResult(payload: MetadataResponse | null) {
  if (payload?.ok === true) {
    return payload.data;
  }

  return null;
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

  error.value = null;
  requestedUrl.value = trimmed;
  requestKey.value += 1;

  try {
    await executeMetadataRequest();

    if (requestError.value) {
      throw new Error(getRequestErrorMessage(requestError.value));
    }

    const metadata = getMetadataResult(metadataResponse.value ?? null);

    if (!metadata) {
      throw new Error('The metadata request failed.');
    }

    result.value = metadata;
    recentUrls.value = mergeRecentUrls(trimmed, recentUrls.value);
    window.localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(recentUrls.value));
  } catch (requestError) {
    error.value =
      requestError instanceof Error ? requestError.message : 'The metadata request failed.';
    result.value = null;
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

<style scoped lang="scss">
.page-shell {
  width: min(100%, 1200px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 32px 16px 48px;
}

.hero-grid {
  display: grid;
  gap: 24px;
}

@media (min-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
    align-items: start;
  }
}
</style>
