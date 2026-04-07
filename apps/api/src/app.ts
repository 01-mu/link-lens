import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { healthRoutes } from './routes/health';
import { metadataRoutes } from './routes/metadata';
import type { AppEnv } from './lib/env';

export function createApp() {
  const app = new Hono<AppEnv>();

  app.use('*', corsMiddleware);
  app.route('/', healthRoutes);
  app.route('/', metadataRoutes);

  return app;
}
