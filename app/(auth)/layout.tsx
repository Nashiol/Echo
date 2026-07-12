import Link from "next/link";
import { AudioLines } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-outline-variant">
            <AudioLines size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary tracking-tight">
              Echo
            </h1>
            <p className="text-[11px] text-on-surface-variant">AI Transcription</p>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
