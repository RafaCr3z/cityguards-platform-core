import Sidebar from "@/app/components/dashboard/Sidebar";
import Header from "@/app/components/dashboard/Header";

/**
 * Shared layout for all dashboard pages.
 *
 * Provides the Sidebar and Header chrome. Each child page only needs
 * to render its main content area.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col ml-[280px]">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
