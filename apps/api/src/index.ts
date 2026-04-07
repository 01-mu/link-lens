import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { healthRoutes } from './routes/health';
import { metadataRoutes } from './routes/metadata';
import type { AppEnv } from './lib/env';

const app = new Hono<AppEnv>();

app.use('*', corsMiddleware);
app.route('/', healthRoutes);
app.route('/', metadataRoutes);

export default app;
