import { defineStore } from 'pinia';
import type { MetadataRecord } from '~/types/metadata';
import type { ApiError, MetadataResponse } from '~/types/api';

const RECENT_URLS_KEY = 'linklens.recent-urls';

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

export const useLinkLensStore = defineStore('linkLens', () => {
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
  } = useApiPost<MetadataResponse>('/metadata', {
    immediate: false,
    watch: false,
    key: computed(() => `metadata-${requestKey.value}`),
    body: computed(() => ({
      url: requestedUrl.value,
    })),
  });

  const isLoading = computed(() => requestStatus.value === 'pending');

  function hydrateRecentUrls() {
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
  }

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
    } catch (requestFailure) {
      error.value =
        requestFailure instanceof Error ? requestFailure.message : 'The metadata request failed.';
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

  return {
    error,
    handleSubmit,
    hydrateRecentUrls,
    isLoading,
    recentUrls,
    rerunRecent,
    result,
    submitUrl,
    url,
  };
});
