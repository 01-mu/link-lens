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

.eyebrow {
  margin: 0;
  color: var(--teal);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.lede {
  max-width: 40rem;
  margin: 16px 0 0;
  color: rgba(23, 32, 51, 0.82);
  font-size: 1.05rem;
  line-height: 1.7;
}

.stack {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
  margin-top: 32px;

  span {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  input {
    width: 100%;
    border: 1px solid rgba(23, 32, 51, 0.12);
    border-radius: 24px;
    background: rgba(238, 243, 247, 0.82);
    padding: 16px 20px;
    outline: none;
    transition: border-color 120ms ease, box-shadow 120ms ease;

    &:focus {
      border-color: var(--teal);
      box-shadow: 0 0 0 4px rgba(31, 122, 140, 0.15);
    }
  }
}

button[type='submit'] {
  width: fit-content;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: white;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 120ms ease, opacity 120ms ease;

  &:hover:not(:disabled) {
    background: var(--teal);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.error-banner {
  margin-top: 16px;
  border: 1px solid rgba(240, 139, 111, 0.3);
  border-radius: 24px;
  background: rgba(240, 139, 111, 0.12);
  padding: 12px 16px;
}
</style>
