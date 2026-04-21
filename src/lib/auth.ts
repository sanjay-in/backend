import jwt from "jsonwebtoken";

interface User {
  _id: string | number;
  email: string;
  fullName: string;
}

// ExpiresIn 7 days => 604800 secs
export function createAuthToken(user: User, expiresIn: number = 604800): string {
  const payload = {
    sub: user._id?.toString ? user._id.toString() : user._id,
    email: user.email,
    fullName: user.fullName,
    iat: Math.floor(Date.now() / 1000),
  }

  return jwt.sign(payload, Bun.env.JWT_SECRET!, {expiresIn});
}

function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, Bun.env.JWT_SECRET!);
  } catch {
    return null;
  }
}