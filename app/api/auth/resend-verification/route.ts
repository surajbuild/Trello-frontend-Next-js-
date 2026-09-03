import { prisma } from "@/app/db";
import { NextRequest } from "next/server";
import { isValidEmail } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: { email?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return Response.json({ message: "If an account exists, a verification email was sent." });
    }

    const token = await generateVerificationToken(user.id);
    await sendVerificationEmail(user.email, user.name, token);

    return Response.json({ message: "If an account exists, a verification email was sent." });
  } catch (error) {
    console.error("Error resending verification:", error);
    return Response.json({ error: "Failed to resend verification email" }, { status: 500 });
  }
}
