<script setup lang="ts">
const model = defineModel<string>({ required: true });

defineProps<{
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [];
}>();
</script>

<template>
  <div class="panel panel-light">
    <p class="eyebrow">LinkLens</p>
    <h1>Inspect a page before you open ten tabs.</h1>
    <p class="lede">
      Paste any URL and LinkLens will fetch the page through the Hono API, inspect the raw HTML,
      and surface the metadata you actually care about.
    </p>

    <form class="stack" @submit.prevent="emit('submit')">
      <label class="field">
        <span>URL</span>
        <input
          v-model="model"
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
</template>
