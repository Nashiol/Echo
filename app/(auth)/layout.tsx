import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/dashboard" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-primary">
              graphic_eq
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">
              Echo
            </h1>
            <p className="text-sm text-on-surface-variant">AI Transcription</p>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
