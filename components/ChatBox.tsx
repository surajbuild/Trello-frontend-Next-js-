"use client";
import { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
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

interface SendResponse {
  conversationId: string;
  message: Message;
}

export function ChatBox({ initialConversationId, initialMessages }: ChatBoxProps) {
  const router = useRouter();
  const conversationIdRef = useRef<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      content,
      role: "User",
      createdAt: new Date().toISOString(),
    };

    const wasNewConversation = !conversationIdRef.current;
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const { data } = await axios.post<SendResponse>("/conversation", {
        content,
        role: "User",
        conversationId: conversationIdRef.current,
      });

      conversationIdRef.current = data.conversationId;

      if (wasNewConversation) {
        // A brand-new conversation was created. Navigate to its page, which
        // loads the full history (user message + assistant reply) server-side.
        router.push(`/conversation/${data.conversationId}`);
        return;
      }

      // Existing conversation: replace the optimistic user bubble if it was
      // assigned a real id, then append the assistant reply.
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id && data.message.role === "User"
            ? { ...m, id: data.message.id }
            : m
        )
      );
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const fallback =
        axiosError?.response?.status && axiosError.response.status >= 500
          ? "Failed to send message. Please try again."
          : "Something went wrong. Please try again.";
      setError(axiosError?.response?.data?.error ?? fallback);
      // Roll back the optimistic bubble on failure.
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto border rounded-lg overflow-hidden bg-white dark:bg-neutral-900 dark:border-neutral-700">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && !sending && (
          <div className="text-center text-sm text-neutral-500 py-10">
            Start a conversation. Type a message below to get a reply.
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "User" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg whitespace-pre-wrap break-words ${
                msg.role === "User"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2 rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse [animation-delay:150ms]">•</span>
                <span className="animate-pulse [animation-delay:300ms]">•</span>
              </span>
              Assistant is typing…
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 border-t p-3">
        <input
          type="text"
          placeholder="Start typing..."
          className="outline-none flex-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-60"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={sending}
          aria-label="Message"
        />
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={sendMessage}
          disabled={sending || !input.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}