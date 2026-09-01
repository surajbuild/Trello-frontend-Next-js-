import { prisma } from "@/app/db";

type Role = "User" | "Assistant";

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

const DEFAULT_MODEL = "gpt-4o-mini";

function env(key: string, fallback?: string) {
  return process.env[key] ?? fallback;
}

/** Returns the configured baseUrl when present, otherwise the default. */
function baseUrl(): string {
  return env("AI_BASE_URL", "https://api.openai.com/v1")!;
}

/** Returns the configured API key. Caller must check isAiConfigured first. */
function apiKey(): string {
  return env("AI_API_KEY")!;
}

/**
 * Returns true when an OpenAI-compatible endpoint has been configured.
 * When false, the assistant falls back to a deterministic offline response
 * so the chat remains functional without an external AI provider.
 */
export function isAiConfigured(): boolean {
  return Boolean(env("AI_BASE_URL") && env("AI_API_KEY"));
}

/**
 * Asks the configured OpenAI-compatible chat completion endpoint for a reply
 * given the conversation history. Throws if the upstream call fails.
 */
async function generateReply(messages: { role: Role; content: string }[]): Promise<string> {
  const model = env("AI_MODEL", DEFAULT_MODEL)!;
  const url = baseUrl().replace(/\/$/, "");

  const endpoint = url.endsWith("/chat/completions")
    ? url
    : `${url}/chat/completions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({ model, messages }),
    signal: AbortSignal.timeout(
      Number(env("AI_TIMEOUT_MS", "60000"))
    ),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Upstream chat completion failed (${response.status}): ${body.slice(0, 300)}`
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Upstream chat completion returned an empty response");
  }

  return content.trim();
}

/**
 * Deterministic offline fallback so the interface stays interactive when no
 * AI endpoint is configured. Recognises a few simple intents.
 */
function offlineReply(userInput: string): string {
  const input = userInput.trim().toLowerCase();

  if (/^(hi|hello|hey)\b/.test(input)) {
    return "Hello! How can I help you today?";
  }

  if (input.includes("how are you")) {
    return "I'm doing well, thank you for asking! How can I assist you?";
  }

  if (input.includes("who are you")) {
    return "I'm your AI assistant. I can help answer questions and have conversations with you.";
  }

  if (input.includes("your name")) {
    return "I'm Trello Chat, your friendly assistant!";
  }

  return (
    "I received your message: \"" +
    userInput.trim() +
    "\". To get intelligent responses, configure an OpenAI-compatible endpoint by " +
    "setting the AI_BASE_URL and AI_API_KEY environment variables."
  );
}

/**
 * Produces an assistant reply for the given conversation, persists it to the
 * database, and returns the created message.
 */
export async function createAssistantReply(conversationId: string, userInput: string) {
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  const messages: { role: Role; content: string }[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const reply =
    isAiConfigured()
      ? await generateReply(messages)
      : offlineReply(userInput);

  return prisma.message.create({
    data: { content: reply, role: "Assistant", conversationId },
  });
}