<script setup lang="ts">
import type { MetadataField, MetadataRecord } from '~/types/metadata';

defineProps<{
  result: MetadataRecord | null;
  metadataFields: MetadataField[];
}>();

function isLink(value: string | null) {
  return typeof value === 'string' && /^(http|https):\/\//.test(value);
}
</script>

<template>
  <section class="panel panel-light result-panel">
    <div class="result-header">
      <div>
        <p class="eyebrow">Result</p>
        <h2>Metadata snapshot</h2>
      </div>
      <a v-if="result" :href="result.finalUrl" rel="noreferrer" target="_blank">Open final URL</a>
    </div>

    <div v-if="result" class="result-grid">
      <article v-for="{ key, label } in metadataFields" :key="key" class="result-card">
        <p class="result-label">{{ label }}</p>
        <a
          v-if="isLink(result[key])"
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
      <img :alt="result.title ? `${result.title} OG image` : 'Open Graph preview'" :src="result.ogImage" />
    </div>
  </section>
</template>
