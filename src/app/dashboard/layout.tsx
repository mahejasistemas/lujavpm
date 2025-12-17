"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isConfigPage = pathname?.startsWith("/dashboard/configuracion");

  return (
    <div className="min-h-screen bg-gray-50">
      {!isConfigPage && <Sidebar />}
      <div className={`${isConfigPage ? "w-full" : "ml-64"} flex flex-col min-h-screen transition-all duration-200`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
