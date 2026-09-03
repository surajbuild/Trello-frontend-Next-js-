"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import axios, { AxiosError } from "axios";

export default function ResendVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(prefillEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await axios.post("/api/auth/resend-verification", { email });
      setMessage("Verification email sent! Check your inbox.");
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError?.response?.data?.error ?? "Failed to resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">
          Resend verification email
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
          Enter your email to receive a new verification link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {message && (
            <p className="rounded-md bg-green-50 dark:bg-green-950/40 px-3 py-2 text-sm text-green-600 dark:text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Sending..." : "Resend email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
