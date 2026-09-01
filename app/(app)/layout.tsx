import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/conversations";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const conversations = await getConversationsForUser(user.id);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        user={{ id: user.id, name: user.name, email: user.email }}
        conversations={conversations.map((c) => ({
          id: c.id,
          title: c.title,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
      <main className="flex flex-1 flex-col min-w-0">{children}</main>
    </div>
  );
}