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

<style scoped lang="scss">
.panel {
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 32px;
  box-shadow: var(--panel-shadow);
}

.panel-light {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  padding: 32px;
}

.result-panel {
  margin-top: 32px;
}

.result-header {
  display: flex;
  flex-direction: column;
  gap: 12px;

  a {
    color: var(--teal);
    font-weight: 600;
    text-decoration-color: rgba(31, 122, 140, 0.3);
    text-underline-offset: 4px;
  }
}

.eyebrow {
  margin: 0;
  color: var(--teal);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.result-grid {
  display: grid;
  gap: 16px;
  margin-top: 32px;
}

.result-card {
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 24px;
  background: rgba(247, 241, 232, 0.72);
  padding: 16px;

  a,
  p {
    margin: 12px 0 0;
    word-break: break-word;
    line-height: 1.7;
  }
}

.result-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.muted {
  color: rgba(23, 32, 51, 0.45);
}

.empty-state {
  border: 1px dashed rgba(23, 32, 51, 0.15);
  border-radius: 24px;
  background: rgba(238, 243, 247, 0.55);
  padding: 20px;
  color: rgba(23, 32, 51, 0.6);
  line-height: 1.7;
}

.empty-state-large {
  margin-top: 32px;
}

.image-frame {
  overflow: hidden;
  margin-top: 24px;
  border-radius: 24px;
  background: rgba(23, 32, 51, 0.06);

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
