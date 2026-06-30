"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Gavel, LayoutDashboard, Package, Users, ListOrdered, LogOut, ChevronRight, Send, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard, exact: true },
  { href: "/admin/auctions",    label: "Auctions",    icon: Package },
  { href: "/admin/orders",      label: "Orders",      icon: Package },
  { href: "/admin/bids",        label: "All Bids",    icon: ListOrdered },
  { href: "/admin/users",       label: "Users",       icon: Users },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: Send },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("[admin layout] isLoading:", isLoading, "| isAuthenticated:", isAuthenticated, "| role:", user?.role, "| email:", user?.email);
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("[admin layout] Not authenticated → redirecting to /login");
        router.push("/login");
      } else if (user?.role !== "admin") {
        console.log("[admin layout] Role is not admin (got:", user?.role, ") → redirecting to /login");
        router.push("/login");
      } else {
        console.log("[admin layout] Access granted for admin:", user?.email);
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role !== "admin") return null;

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Gavel size={22} className="text-[#FFE500]" />
          <div>
            <span className="font-bold text-white">CashBid</span>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-[#2874F0] text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
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
          <div className="w-8 h-8 rounded-full bg-[#2874F0] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(user.name?.[0] ?? "A").toUpperCase()}
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
    </>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar — fixed, always visible */}
      <aside className="hidden md:flex w-60 bg-[#0f172a] text-white flex-col shrink-0 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — slide-in drawer */}
      <>
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Drawer */}
        <aside
          className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#0f172a] text-white flex flex-col z-50 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
          <SidebarContent />
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-[#0f172a] text-white flex items-center gap-3 px-4 h-14 shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white">
            <Menu size={22} />
          </button>
          <Gavel size={18} className="text-[#FFE500]" />
          <span className="font-bold text-white text-sm">CashBid Admin</span>
          <div className="ml-auto w-7 h-7 rounded-full bg-[#2874F0] flex items-center justify-center text-white text-xs font-bold">
            {(user.name?.[0] ?? "A").toUpperCase()}
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
