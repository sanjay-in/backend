import { Hono } from 'hono';
import { cors } from 'hono/cors';
import userRouter from './src/routes/user.routes';
import createRouter from './src/routes/creator.routes';
import purchaseRouter from './src/routes/purchase.routes';

const app = new Hono<{ Bindings: { CORS_ORIGIN: string; MONGODB_URI?: string } }>();

app.use('/api/*', (c, next) => {
  const origin = c.env.CORS_ORIGIN ?? '*';
  return cors({
    origin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })(c, next);
});

app.route('/api/user', userRouter);
app.route('/api/create', createRouter);
app.route('/api/buy', purchaseRouter);

app.get('/', (c) => c.text('Hello Worker!'));

export default app;  // ← just this change