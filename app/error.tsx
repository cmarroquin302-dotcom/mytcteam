"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 mb-8">
          An unexpected error occurred. We&apos;ve logged it and will look into it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-slate-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
