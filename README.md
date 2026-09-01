# Trello Chat

A Next.js (App Router) AI chat application. Users start a conversation, send a
message, and the assistant replies. Conversations and messages are persisted to
PostgreSQL via Prisma.

## Tech stack

- Next.js 16 (App Router) — React 19, TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma ORM 7 (driver adapters)
- axios (client HTTP)

## Getting started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values.

```bash
cp .env.example .env
```

Required for the database:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/postgres
```

To enable real AI responses, provide an OpenAI-compatible endpoint:

```
AI_BASE_URL=https://api.openai.com/v1   # or a compatible endpoint (Groq, etc.)
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini                    # optional, default gpt-4o-mini
```

If `AI_BASE_URL` / `AI_API_KEY` are left unset, the assistant falls back to a
deterministic offline responder so the app remains usable.

### 3. Set up the database

```bash
bunx prisma migrate dev
bunx prisma generate
```

### 4. Run

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable       | Required | Description                                                            |
| -------------- | -------- | ---------------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string.                                          |
| `AI_BASE_URL`  | No       | Base URL of an OpenAI-compatible chat completions API. Offline fallback if omitted. |
| `AI_API_KEY`   | No       | API key for the endpoint above.                                        |
| `AI_MODEL`     | No       | Model name (default `gpt-4o-mini`).                                    |
| `AI_TIMEOUT_MS`| No       | Upstream request timeout in ms (default `60000`).                      |

## Scripts

- `bun run dev` — development server (Turbopack). Use `bun run dev --webpack` if you hit Turbopack HMR panics.
- `bun run build` — production build
- `bun run start` — start the production server
- `bun run lint` — ESLint