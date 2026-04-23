import { Context, Next } from "hono";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { createAuthToken } from "../../lib/auth";
import { MongoClient } from "mongodb";
import { getDB } from "../../lib/mongo";

export async function registerUser(c: Context, next: Next) {
  const { 
    name, 
    email, 
    university, 
    nationality,
    bio,
    password
  } = await c.req.json();

  // Simple validation (ensure fields are present)
  if (!email || !password || !university || !nationality || !password || !name) {
    return c.json({ error: 'Fields are missing' }, 400)
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    email,
    password: hashedPassword,
    name,
    isEmailVerified: false,
    bio,
    createdAt: Date.now(),
    isActive: 1,
  };

  // Connection to Database
  const db = await getDB();
  const usersCollection = db.collection('users');

  try {
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return c.json({ error: 'Email already in use' }, 400);
    }

    const result = await usersCollection.insertOne(newUser);

    // Creates JWT token with expiry
    const token = jwt.sign(
      { userId: result.insertedId, email },
      Bun.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const emailVerificationCollection = db.collection('email_verification_tokens'); 
    
    const emailVerificationToken = {
      token,
      objectId: result.insertedId,
      expiresAt: ,
      createdAt: Date.now() 
    }

    const emailResponse = await emailVerificationCollection.insertOne(emailVerificationToken);

    // Send mail

    return c.json({ message: 'Registration successful! Please check your email for verification.', token }, 200);
  } catch (error) {
    console.error('Error inserting user into MongoDB:', error);
    return c.json({ error: 'An error occurred while registering the user.' }, 500);
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

}