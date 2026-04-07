const DEFAULT_FETCH_TIMEOUT_MS = 8000;

export type Bindings = {
  CORS_ALLOW_ORIGIN?: string;
  FETCH_TIMEOUT_MS?: string;
};

export type AppEnv = {
  Bindings: Bindings;
};

export function getFetchTimeoutMs(value: string | undefined) {
  const parsed = Number(value ?? String(DEFAULT_FETCH_TIMEOUT_MS));
  return Number.isFinite(parsed) ? parsed : DEFAULT_FETCH_TIMEOUT_MS;
}
