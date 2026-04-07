import { Hono } from 'hono';
import type { AppEnv } from '../lib/env';

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get('/health', (c) => c.json({ ok: true }));
