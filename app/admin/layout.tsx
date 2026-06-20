"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Gavel, LayoutDashboard, Package, Users, ListOrdered, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/auctions", label: "Auctions", icon: Package },
  { href: "/admin/bids", label: "All Bids", icon: ListOrdered },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login");
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0f172a] text-white flex flex-col shrink-0 fixed h-full">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Gavel size={22} className="text-[#FFE500]" />
            <div>
              <span className="font-bold text-white">BidKart</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-[#2874F0] text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2874F0] flex items-center justify-center text-white text-sm font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1.5"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
