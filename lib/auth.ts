import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-in-production"
);

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

export interface UserPayload {
  id: string;
  name: string;
  email: string;
}

export interface JWTPayload extends UserPayload {
  iat: number;
  exp: number;
}

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a JWT token for the user.
 */
export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token and return the payload.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set the auth cookie in the response.
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Clear the auth cookie.
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * Get the current user from the auth cookie.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return { id: payload.id, name: payload.name, email: payload.email };
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength (min 8 chars).
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate name (non-empty, reasonable length).
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}