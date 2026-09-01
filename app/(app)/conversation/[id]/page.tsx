import { prisma } from "@/app/db";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChatBox } from "@/components/ChatBox";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: user.id },
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
    <div className="flex flex-1 p-4 sm:p-6">
      <ChatBox
        initialConversationId={conversation.id}
        initialMessages={messages}
      />
    </div>
  );
}