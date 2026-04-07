import { Hono } from 'hono';
import * as v from 'valibot';
import { getFetchTimeoutMs, type AppEnv } from '../lib/env';
import { jsonError } from '../lib/http';
import { fetchMetadata, MetadataFetchError } from '../features/metadata/service';
import { metadataRequestSchema } from '../features/metadata/schema';

export const metadataRoutes = new Hono<AppEnv>();

metadataRoutes.post('/metadata', async (c) => {
  let json: unknown;

  try {
    json = await c.req.json();
  } catch {
    return c.json(jsonError('INVALID_JSON', 'Request body must be valid JSON.'), 400);
  }

  const parsed = v.safeParse(metadataRequestSchema, json);

  if (!parsed.success) {
    const message = parsed.issues[0]?.message ?? 'Invalid request body.';
    return c.json(jsonError('INVALID_URL', message), 400);
  }

  const timeoutMs = getFetchTimeoutMs(c.env.FETCH_TIMEOUT_MS);

  try {
    const data = await fetchMetadata(parsed.output.url, timeoutMs);
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
