import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono()

app.use("/api/*", cors({
  origin: Bun.env.CORS_ORIGIN || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/', (c) => c.text('Hello Bun!'))

export default {
  port: Bun.env.PORT ?? 4000,
  fetch: app.fetch,
}