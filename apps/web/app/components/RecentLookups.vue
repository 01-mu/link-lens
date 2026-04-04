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
