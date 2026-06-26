"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, Heart, Bell, Package, Wallet, Gift } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Overview", icon: Gavel, exact: true },
  { href: "/dashboard/bids", label: "My Bids", icon: Gavel },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/invite", label: "Invite & Earn", icon: Gift },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Mobile scrollable tab bar */}
      <div className="lg:hidden sticky top-[64px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <nav className="flex overflow-x-auto px-2 py-1 gap-1 no-scrollbar">
          {TABS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  active ? "bg-[#2874F0] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop sidebar + content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-52 shrink-0">
            <nav className="flex flex-col gap-1">
              {TABS.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? "bg-[#2874F0] text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
