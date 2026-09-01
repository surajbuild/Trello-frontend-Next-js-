import { getCurrentUser } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/conversations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const conversations = await getConversationsForUser(user.id);
  return Response.json({ conversations });
}