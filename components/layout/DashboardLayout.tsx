import { Sidebar } from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
  role: "hr" | "manager" | "management";
  userEmail: string;
  title: string;
  children: React.ReactNode;
}

export function DashboardLayout({ role, userEmail, title, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} userEmail={userEmail} />
      <div className="ml-64">
        <header className="sticky top-0 z-30 border-b bg-white px-8 py-4 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
