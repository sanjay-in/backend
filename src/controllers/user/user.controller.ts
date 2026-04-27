import { Context, Next } from "hono";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { getDB } from "../../lib/mongo";
import { sendVerificationEmail } from "../../lib/email";
import { CreateUser } from "../../types/user/user.types";
import User from "../../models/User.model";
import EmailVerify from "../../models/Email.model";

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

  const user = await User.findOne({ email });

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

/**
  * @description Verifies the user by comparing the URL with the hashed token in the database
  * @param c Context
  * @param next Next
*/
export async function verifyUser(c: Context, next: Next) {
  const url = new URL(c.req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return c.json({ error: 'Verification token is missing' }, 400);
  }

  try {
    // Find the token in the email verification collection
    const emailVerification = await EmailVerify.findOne({ token });

    // Check if the token is found and has expired
    if (!emailVerification) {
      return c.json({ error: 'Invalid or expired verification token' }, 400);
    }

    if (Number(emailVerification.expiresAt) < Date.now()) {
      return c.json({ error: 'Verification token has expired' }, 400);
    }

    // Find the user associated with the token
    const user = await User.findOne({ email: emailVerification.email });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // If the user is already verified, return a message
    if (user.isVerified) {
      return c.json({ message: 'User is already verified' }, 200);
    }

    // Compare the token with the hashed value in the database
    const isValidToken = await bcrypt.compare(token, emailVerification.token);

    if (!isValidToken) {
      return c.json({ error: 'Invalid verification token' }, 400);
    }

    // Update the user verification status
    user.isVerified = true;
    await user.save();

    // Return a success response
    return c.json({ message: 'Email verified successfully' }, 200);
  } catch (err) {
    console.error('Error verifying email:', err);
    return c.json({ error: 'Something went wrong while verifying the email' }, 500);
  }
}