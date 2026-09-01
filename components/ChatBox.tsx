'use client'
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  role: "User" | "Assistant";
  createdAt: string;
}

interface ChatBoxProps {
  initialConversationId?: string;
  initialMessages?: Message[];
}

export function ChatBox({ initialConversationId, initialMessages }: ChatBoxProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const { data } = await axios.post("/conversation", {
      content: input,
      role: "User",
      conversationId,
    });

    if (!conversationId) {
      router.push(`/conversation/${data.conversationId}`);
      return;
    }

    setConversationId(data.conversationId);
    setMessages((prev) => [...prev, data.message]);
    setInput("");
  };

  useEffect(() => {
    if (!conversationId || initialMessages) return;

    axios
      .get(`/conversation?conversationId=${conversationId}`)
      .then((res) => setMessages(res.data.conversation.messages));
  }, [conversationId, initialMessages]);

  return (
    <div className="flex flex-col w-96 h-80">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-2 rounded ${
              msg.role === "User" ? "bg-blue-500 ml-auto" : "bg-gray-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex border rounded">
        <input
          type="text"
          placeholder="Start typing..."
          className="outline-none flex-1 p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="px-4 cursor-pointer border-l" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
