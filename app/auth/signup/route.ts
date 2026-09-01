import { prisma } from "@/app/db";
import { NextRequest } from "next/server";
import {
  createToken,
  hashPassword,
  isValidEmail,
  isValidName,
  isValidPassword,
  setAuthCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { name?: unknown; email?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidName(name)) {
    return Response.json(
      { error: "Name must be between 2 and 100 characters" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return Response.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    const token = await createToken({ id: user.id, name: user.name, email: user.email });
    await setAuthCookie(token);

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error signing up:", error);
    return Response.json({ error: "Failed to create account" }, { status: 500 });
  }
}