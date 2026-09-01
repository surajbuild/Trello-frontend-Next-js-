import { prisma } from "@/app/db";

/** Truncate a long first message into a usable conversation title. */
function toTitle(content: string): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  return singleLine.length > 60 ? `${singleLine.slice(0, 60)}…` : singleLine;
}

/**
 * List a user's conversations, most recently updated first, for the sidebar.
 */
export async function getConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
}

/**
 * Build a title from the user's first message if the conversation has none yet.
 */
export async function ensureConversationTitle(conversationId: string, content: string) {
  await prisma.conversation.updateMany({
    where: { id: conversationId, title: null },
    data: { title: toTitle(content) },
  });
}

export { toTitle };