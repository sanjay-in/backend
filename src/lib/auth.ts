import { Context } from "hono";
import User from "../models/User.model";

export async function verifyEmail(c: Context) {
  const body = await c.req.json();

  const user = body.record;

  if (!user?.id) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  await User.updateOne(
    { email: user.email },
    {
      $set: {
        isVerified: !!user.email_confirmed_at,
        verifiedAt: new Date()
      }
    },
    { upsert: true
    }
  );

  return c.json({ received: true });
}