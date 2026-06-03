"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Download,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: "hr" | "manager" | "management";
  userEmail: string;
}

const HR_NAV: NavItem[] = [
  { href: "/hr", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hr/submissions", label: "Submissions", icon: FileText },
  { href: "/hr/exports", label: "Exports", icon: Download },
  { href: "/hr/reports", label: "Reports", icon: BarChart3 },
];

const MANAGER_NAV: NavItem[] = [
  { href: "/manager", label: "Dashboard", icon: LayoutDashboard },
];

const MGMT_NAV: NavItem[] = [
  { href: "/management", label: "Dashboard", icon: LayoutDashboard },
];

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "hr" ? HR_NAV : role === "manager" ? MANAGER_NAV : MGMT_NAV;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-sm font-bold leading-tight text-white">BLANCO STEEL</h1>
        <p className="text-xs text-slate-400 mt-1">Appraisal System FY 2026-27</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-blanco-primary text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-4">
        <p className="text-xs text-slate-400 truncate mb-2">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
