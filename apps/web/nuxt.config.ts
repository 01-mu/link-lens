const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;

export default defineNuxtConfig({
  css: ['~/app/assets/css/app.scss'],
  runtimeConfig: {
    public: {
      apiBaseUrl: env?.NUXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8787',
    },
  },
});
