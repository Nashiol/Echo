import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-[240px] max-w-[1200px] mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <header className="md:hidden flex justify-between items-center h-16 w-full fixed top-0 left-0 px-4 bg-surface/80 backdrop-blur-md z-40 border-b border-outline-variant/30">
          <h1 className="text-lg font-bold tracking-tight text-primary">
            Echo
          </h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              Log In
            </Link>
          </div>
        </header>

        {children}
      </main>

      <BottomNav />
    </div>
  );
}
