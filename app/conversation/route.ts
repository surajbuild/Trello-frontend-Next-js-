import { prisma } from "@/app/db";
import { NextRequest } from "next/server";
import { createAssistantReply } from "@/lib/ai";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return Response.json({ error: "Missing conversationId" }, { status: 400 });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    return Response.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return Response.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: { content?: unknown; role?: unknown; conversationId?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const role: string = typeof body.role === "string" ? body.role : "";
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";

  if (!content) {
    return Response.json({ error: "Message content is required" }, { status: 400 });
  }

  if (role !== "User" && role !== "Assistant") {
    return Response.json(
      { error: "role must be either 'User' or 'Assistant'" },
      { status: 400 }
    );
  }

  if (role !== "User") {
    return Response.json(
      { error: "Only 'User' messages can be sent directly" },
      { status: 400 }
    );
  }

  try {
    if (conversationId) {
      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true },
      });

      if (!existing) {
        return Response.json({ error: "Conversation not found" }, { status: 404 });
      }
    }

    // Create the conversation (if new) and the user message; the assistant
    // reply is generated afterwards and persisted separately. Using a
    // transaction keeps the conversation + user message atomic.
    let convoId = conversationId;

    await prisma.$transaction(async (tx) => {
      if (!convoId) {
        const conv = await tx.conversation.create({
          data: { initialPrompt: content },
        });
        convoId = conv.id;
      }

      await tx.message.create({
        data: { content, role: "User", conversationId: convoId },
      });
    });

    const assistantMessage = await createAssistantReply(convoId, content);

    return Response.json(
      { conversationId: convoId, message: assistantMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating message:", error);
    return Response.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}