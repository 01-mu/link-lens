import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { fetchMetadata, MetadataFetchError } from './lib/metadata';

const DEFAULT_FETCH_TIMEOUT_MS = 8000;

type Bindings = {
  CORS_ALLOW_ORIGIN?: string;
  FETCH_TIMEOUT_MS?: string;
};

type AppContext = {
  Bindings: Bindings;
};

const app = new Hono<AppContext>();

const requestSchema = z.object({
  url: z
    .string()
    .trim()
    .url('Enter a valid URL.')
    .refine((value) => {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }, 'Only http:// and https:// URLs are supported.'),
});

function jsonError(code: string, message: string) {
  return {
    ok: false as const,
    error: {
      code,
      message,
    },
  };
}

function getFetchTimeoutMs(value: string | undefined) {
  const parsed = Number(value ?? String(DEFAULT_FETCH_TIMEOUT_MS));
  return Number.isFinite(parsed) ? parsed : DEFAULT_FETCH_TIMEOUT_MS;
}

function applyCors(origin: string) {
  return cors({
    origin,
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  });
}

app.use('*', async (c, next) => {
  const origin = c.env.CORS_ALLOW_ORIGIN ?? '*';
  return applyCors(origin)(c, next);
});

app.get('/health', (c) => c.json({ ok: true }));

app.post('/metadata', async (c) => {
  let json: unknown;

  try {
    json = await c.req.json();
  } catch {
    return c.json(jsonError('INVALID_JSON', 'Request body must be valid JSON.'), 400);
  }

  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request body.';
    return c.json(jsonError('INVALID_URL', message), 400);
  }

  const timeoutMs = getFetchTimeoutMs(c.env.FETCH_TIMEOUT_MS);

  try {
    const data = await fetchMetadata(parsed.data.url, timeoutMs);
    return c.json({
      ok: true as const,
      data,
    });
  } catch (error) {
    if (error instanceof MetadataFetchError) {
      return c.json(jsonError(error.code, error.message), error.status);
    }

    return c.json(jsonError('INTERNAL_ERROR', 'Unexpected server error.'), 500);
  }
});

export default app;
