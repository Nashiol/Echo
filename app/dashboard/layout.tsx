import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="w-full px-4 py-14 md:px-6 md:py-6 flex flex-col gap-6">
        {children}
      </main>
    </div>
  );
}
