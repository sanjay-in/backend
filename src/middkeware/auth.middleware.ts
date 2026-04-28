import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';

const SUPABASE_JWT_SECRET = Bun.env.SUPABASE_JWT_SECRET;

/**
 * @description Acts as a middleware for routes that have been logged in
 * @param c Hono.Context
 * @param next Hono.Next
 */
export async function verifyJWT(c: Context, next: Next) {
  // Gets the header embedded in the URL sent from client
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Token is stored in second part of the Header
  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SUPABASE_JWT_SECRET)
    );

    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}