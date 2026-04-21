import { Context, Next } from "hono";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { createAuthToken } from "../../lib/auth";
import { MongoClient } from "mongodb";

export async function registerUser(c: Context, next: Next) {
  const { 
    name, 
    email, 
    university, 
    nationality,
    bio,
    password, 
    confirmPassword,
  } = await c.req.json()

  // Simple validation (ensure email and password are provided)
  if (!email || !password || !university || !nationality || !password || !confirmPassword || !name) {
    return c.json({ error: 'Fields are missing' }, 400)
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    email,
    password: hashedPassword,
    name,
    nationality,
    university,
    emailVerified: false,
    createdAt: Date.now(),
  };

const client = new MongoClient(Bun.env.MONGODB_URI!);

  try {
    const userCollection = client.db(Bun.env.DB_NAME).collection(Bun.env.USERS_COLLECTION!);
    const existingUser = await userCollection.findOne({ email });

    if (existingUser) {
      return c.json({ error: 'Email already in use' }, 400);
    }

    const result = await userCollection.insertOne(newUser);


    return c.json({ message: 'Registration successful! Please check your email for verification.' }, 201);
  } catch (error) {
    console.error('Error inserting user into MongoDB:', error);
    return c.json({ error: 'An error occurred while registering the user.' }, 500);
  }

  // Check if user already exists
 //   const userExists = users.find(user => user.email === email)
 //   if (userExists) {
//     return c.json({ error: 'User already exists' }, 400)
//   }

  // Hash the password
//   const hashedPassword = await bcrypt.hash(password, 10)

  // Store the new user (In real applications, store this in a database)
  // users.push({ email, password: hashedPassword })

  // Generate JWT token for the new user
//   const token = createAuthToken(email)

  // Respond with the JWT token
  return c.json({ message: 'User registered successfully', token })

}

export async function login(c: Context, next: Next) {
  const { email, password } = await c.req.json();

  const userCollection = client.db(DB_NAME).collection(USERS_COLLECTION);
  const user = await userCollection.findOne({ email });

  if (!user) {
    return c.json({ error: 'Invalid credentials or email not verified.' }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const validPassword = await bcrypt.compare(hashedPassword, user.password);
  if (!validPassword) {
    return c.json({ error: 'Invalid credentials.' }, 400);
  }

  const accessToken = jwt.sign({ userId: user._id }, Bun.env.JWT_SECRET!, { expiresIn: Bun.env.JWT_EXPIRATION });
  const refreshToken = jwt.sign({ userId: user._id }, Bun.env.JWT_SECRET!, { expiresIn: Bun.env.JWT_REFRESH_EXPIRATION });

  return c.json({ accessToken, refreshToken });
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