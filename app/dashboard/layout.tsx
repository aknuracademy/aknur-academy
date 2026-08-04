import type { ReactNode } from "react";
import AdminNavigation from "@/components/admin/AdminNavigation";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-8">
        <AdminNavigation />
      </div>

      {children}
    </>
  );
}