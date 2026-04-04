export default defineNuxtConfig({
  css: ['~/app/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8787',
    },
  },
});
