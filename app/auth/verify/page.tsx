import { verifyEmailToken } from "@/lib/verification";
import Link from "next/link";

interface VerifyPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-4">Invalid Link</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            This verification link is invalid or missing a token.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
          >
            Sign up again
          </Link>
        </div>
      </div>
    );
  }

  const userId = await verifyEmailToken(token);

  if (!userId) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-4">Verification Failed</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            This verification link has expired or is invalid.
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

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-4">Email Verified!</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          Your email has been verified successfully. You can now log in.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
