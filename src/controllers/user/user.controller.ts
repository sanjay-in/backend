import { Context, Next } from "hono";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { getDB } from "../../lib/mongo";
import { sendVerificationEmail } from "../../lib/email";
import { CreateUser } from "../../types/user/user.types";
import User from "../../models/User.model";

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

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser: CreateUser = new User({
    email,
    password: hashedPassword,
    name,
    bio,
    isVerified: false,
    isActive: true,
    createdAt: new Date(),
  });


  // Starts session for database to make transaction if success
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Checks if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return c.json({ error: 'Email already in use' }, 400);
    }

    const result = await User.insertOne(newUser);

    // Creates JWT token with expiry
    const token = jwt.sign(
      { userId: result._id, email },
      Bun.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Send verification email
    await sendVerificationEmail(email, name, result._id.toString());

    // Commits the entry of registered user to the database
    await session.commitTransaction();
    return c.json({ message: 'Registration successful! Please check your email for verification.', token }, 200);

  } catch (error) {
    // aborts session if error
    await session.abortTransaction();
    console.error('Error inserting user into MongoDB:', error);
    return c.json({ error: 'An error occurred while registering the user.' }, 500);
    next();
  } finally {
    // ends session and registers the user
    session.endSession();
  }
}

export async function login(c: Context, next: Next) {
  const { email, password } = await c.req.json();

  const db = await getDB();
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({ email });

  if (!user) {
    return c.json({ error: 'Invalid credentials or email not verified.' }, 400);
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return c.json({ error: 'Invalid credentials.' }, 400);
  }

  return c.json({ message: 'Login Success' }, 200);

  // const accessToken = jwt.sign({ userId: user._id }, Bun.env.JWT_SECRET!, { expiresIn: Bun.env.JWT_EXPIRATION });
  // const refreshToken = jwt.sign({ userId: user._id }, Bun.env.JWT_SECRET!, { expiresIn: Bun.env.JWT_REFRESH_EXPIRATION });

  // return c.json({ accessToken, refreshToken });
}

export async function refreshToken(c: Context, next: Next) {
  const { refreshToken } = await c.req.json();

  if (!refreshToken) {
    return c.json({ error: 'Refresh token is required' }, 400);
  }

  try {
    const decoded: any = jwt.verify(refreshToken, Bun.env.JWT_SECRET!);
    const newAccessToken = jwt.sign({ userId: decoded.userId }, Bun.env.JWT_SECRET!, { expiresIn: Bun.env.JWT_EXPIRATION });

    return c.json({ accessToken: newAccessToken });
  } catch (error) {
    return c.json({ error: 'Invalid or expired refresh token' }, 400);
  }
};

export async function verifyUser(c: Context, next: Next) {
  const url = new URL(c.req.url);
  const token = url.searchParams.get("_id")?.toString();
      try {
        const { email } = jwt.verify(token!, Bun.env.JWT_SECRET!);
        const user = user.find(u => u.email === email);
        if (!user) throw new Error("User not found");

        user.verified = true;
        return new Response("Email verified successfully", { status: 200 });
      } catch (err) {
        return new Response("Invalid or expired token", { status: 400 });
      }
}