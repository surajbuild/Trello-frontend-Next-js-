import { prisma } from "@/app/db";
import { notFound } from "next/navigation";
import { ChatBox } from "@/components/ChatBox";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    notFound();
  }

  const messages = conversation.messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    role: msg.role as "User" | "Assistant",
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <main className="flex flex-1 p-4 sm:p-6">
      <ChatBox
        initialConversationId={conversation.id}
        initialMessages={messages}
      />
    </main>
  );
}
