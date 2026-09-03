"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-4">Check your email</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-2">
          We&apos;ve sent a verification link to
        </p>
        {email && (
          <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-6">
            {email}
          </p>
        )}
        {!email && (
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            your email address.
          </p>
        )}
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Click the link in the email to verify your account. The link expires in 24 hours.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-full flex-1 items-center justify-center p-4">
        <p className="text-neutral-500">Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
