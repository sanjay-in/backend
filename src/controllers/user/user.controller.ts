import { Context, Next } from "hono";
/**
  * @description To register a new user and send email verification
  * @param c Context
  * @param next Next
*/
export async function registerUser(c: Context, next: Next) {
  const {
    name,
    email,
    bio,
    password
  } = await c.req.json();

  // Simple validation (ensure fields are present)
  if (!email || !password || !password || !name) {
    return c.json({ error: 'Fields are missing' }, 400)
  }

}
