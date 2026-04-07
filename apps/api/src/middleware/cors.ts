import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../lib/env';

export const corsMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const origin = c.env.CORS_ALLOW_ORIGIN ?? '*';

  return cors({
    origin,
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })(c, next);
};
