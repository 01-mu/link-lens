type UseApiPath<T> = Parameters<typeof useFetch<T>>[0];
type UseApiOptions<T> = Parameters<typeof useFetch<T>>[1];
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function getApiBaseUrl() {
  const config = useRuntimeConfig();
  return (config.public.apiBaseUrl || 'http://127.0.0.1:8787').replace(/\/$/, '');
}

function useApiWithMethod<T>(
  method: ApiMethod,
  path: UseApiPath<T>,
  options?: UseApiOptions<T>,
) {
  return useFetch<T>(path, {
    ...(options ?? {}),
    baseURL: getApiBaseUrl(),
    method,
  });
}

export function useApi<T>(path: UseApiPath<T>, options?: UseApiOptions<T>) {
  return useFetch<T>(path, {
    ...(options ?? {}),
    baseURL: getApiBaseUrl(),
  });
}

export function useApiGet<T>(path: UseApiPath<T>, options?: UseApiOptions<T>) {
  return useApiWithMethod('GET', path, options);
}

export function useApiPost<T>(path: UseApiPath<T>, options?: UseApiOptions<T>) {
  return useApiWithMethod('POST', path, options);
}

export function useApiPut<T>(path: UseApiPath<T>, options?: UseApiOptions<T>) {
  return useApiWithMethod('PUT', path, options);
}

export function useApiPatch<T>(path: UseApiPath<T>, options?: UseApiOptions<T>) {
  return useApiWithMethod('PATCH', path, options);
}

export function useApiDelete<T>(path: UseApiPath<T>, options?: UseApiOptions<T>) {
  return useApiWithMethod('DELETE', path, options);
}
