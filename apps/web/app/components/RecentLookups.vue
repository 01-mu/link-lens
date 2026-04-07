<script setup lang="ts">
defineProps<{
  recentUrls: string[];
}>();

const emit = defineEmits<{
  select: [url: string];
}>();

function prettifyHostname(input: string) {
  try {
    return new URL(input).hostname.replace(/^www\./, '');
  } catch {
    return input;
  }
}
</script>

<template>
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
        @click="emit('select', recentUrl)"
      >
        <div class="recent-title">{{ prettifyHostname(recentUrl) }}</div>
        <div class="recent-url">{{ recentUrl }}</div>
      </button>

      <div v-if="recentUrls.length === 0" class="empty-state empty-state-dark">
        No recent URLs yet.
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.panel {
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 32px;
  box-shadow: var(--panel-shadow);
}

.panel-dark {
  background: var(--ink);
  color: white;
  padding: 32px;
}

.aside-copy,
.empty-state {
  line-height: 1.7;
}

.aside-copy {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.72);
}

.stack {
  display: grid;
  gap: 16px;
}

.recent-list {
  margin-top: 24px;
}

.recent-card {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
  }
}

.recent-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.recent-url {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.65);
}

.empty-state {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  background: transparent;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
