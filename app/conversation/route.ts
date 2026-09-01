import { prisma } from "@/app/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return Response.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ conversation });
}

export async function POST(req: NextRequest) {
  const { content, role, conversationId } = await req.json();

  if (!content || !role) {
    return Response.json(
      { error: "Missing required fields: content, role" },
      { status: 400 }
    );
  }

  let convoId = conversationId;

  if (!convoId) {
    const conversation = await prisma.conversation.create({
      data: { initialPrompt: content },
    });
    convoId = conversation.id;
  }

  const message = await prisma.message.create({
    data: { content, role, conversationId: convoId },
  });

  return Response.json({ conversationId: convoId, message });
}
