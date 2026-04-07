<script setup lang="ts">
import type { MetadataField } from '~/types/metadata';

const metadataFields: MetadataField[] = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'siteName', label: 'Site name' },
  { key: 'canonical', label: 'Canonical URL' },
  { key: 'favicon', label: 'Favicon' },
  { key: 'ogImage', label: 'OG image' },
  { key: 'finalUrl', label: 'Final URL' },
];

const linkLensStore = useLinkLensStore();
const { error, isLoading, recentUrls, result, url } = storeToRefs(linkLensStore);
const { handleSubmit, hydrateRecentUrls, rerunRecent } = linkLensStore;

useHead({
  title: 'LinkLens',
  meta: [
    {
      name: 'description',
      content: 'A small URL metadata viewer built with Nuxt and Hono.',
    },
  ],
});

onMounted(() => {
  hydrateRecentUrls();
});
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
