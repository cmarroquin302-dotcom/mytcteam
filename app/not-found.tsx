import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-6">
          <span className="text-3xl font-bold text-slate-400">?</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
