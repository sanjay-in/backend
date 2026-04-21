import { Hono } from 'hono';
import { cors } from 'hono/cors';
import userRouter from "./src/routes/user.routes";
import { connectToDB } from './src/lib/mongo';

const app = new Hono()

app.use("/api/*", cors({
  origin: Bun.env.CORS_ORIGIN || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.route("/api/user", userRouter);

app.get('/', (c) => c.text('Hello Bun!'))

  await connectToDB();
  console.log("Database connected successfully");

export default {
  port: Bun.env.PORT ?? 5000,
  fetch: app.fetch,
}