export function useApi<T>(
  path: Parameters<typeof useFetch<T>>[0],
  options?: Parameters<typeof useFetch<T>>[1],
) {
  const config = useRuntimeConfig();
  const baseURL = (config.public.apiBaseUrl || 'http://127.0.0.1:8787').replace(/\/$/, '');

  return useFetch<T>(path, {
    ...(options ?? {}),
    baseURL,
  });
}
