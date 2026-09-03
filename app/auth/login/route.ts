import { prisma } from "@/app/db";
import { NextRequest } from "next/server";
import {
  createToken,
  isValidEmail,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidEmail(email) || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return Response.json(
        { error: "Please verify your email before logging in" },
        { status: 403 }
      );
    }

    const token = await createToken({ id: user.id, name: user.name, email: user.email });
    await setAuthCookie(token);

    return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error logging in:", error);
    return Response.json({ error: "Failed to log in" }, { status: 500 });
  }
}
