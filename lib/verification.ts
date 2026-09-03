import crypto from "crypto";
import { prisma } from "@/app/db";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function generateVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  // Delete any existing tokens for this user
  await prisma.$executeRaw`
    DELETE FROM "VerificationToken" WHERE "userId" = ${userId}
  `;

  await prisma.$executeRaw`
    INSERT INTO "VerificationToken" ("id", "token", "userId", "expiresAt")
    VALUES (${crypto.randomUUID()}, ${token}, ${userId}, ${expires})
  `;

  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const record = await prisma.$queryRaw<{ userId: string; expiresAt: Date }[]>`
    SELECT "userId", "expiresAt" FROM "VerificationToken" WHERE "token" = ${token}
  `;

  if (!record || record.length === 0) return null;

  if (new Date(record[0].expiresAt) < new Date()) {
    await prisma.$executeRaw`
      DELETE FROM "VerificationToken" WHERE "token" = ${token}
    `;
    return null;
  }

  const userId = record[0].userId;

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  await prisma.$executeRaw`
    DELETE FROM "VerificationToken" WHERE "userId" = ${userId}
  `;

  return userId;
}
