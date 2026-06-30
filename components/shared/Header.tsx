"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Heart, User, Menu, X, ChevronDown, Gavel, Wallet } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/notificationStore";

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { unreadCount } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdown, setUserDropdown] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2874F0] shadow-md">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <Gavel className="text-[#FFE500]" size={26} />
            <div className="hidden sm:block">
              <span className="text-white font-bold text-xl leading-none">CashBid</span>
              <span className="text-[#FFE500] text-xs block leading-none italic">Bid More. Pay Less.</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative flex items-center bg-white rounded overflow-hidden shadow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones..."
                className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none min-w-0"
              />
              <button
                type="submit"
                className="bg-[#FFE500] px-3 py-2.5 hover:bg-yellow-400 transition-colors shrink-0"
                aria-label="Search"
              >
                <Search size={16} className="text-[#2874F0]" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link href="/dashboard/notifications" className="relative p-2 text-white hover:text-[#FFE500] transition-colors">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#FFE500] text-[#2874F0] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Wallet / bid count — desktop only */}
                <Link
                  href="/dashboard/wallet"
                  className="hidden sm:flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                >
                  <Wallet size={14} className="text-[#FFE500]" />
                  {Math.floor((user.walletBalance ?? 0) / 100)} bid{Math.floor((user.walletBalance ?? 0) / 100) !== 1 ? "s" : ""}
                </Link>

                {/* Watchlist — desktop only */}
                <Link href="/dashboard/watchlist" className="hidden sm:block p-2 text-white hover:text-[#FFE500] transition-colors">
                  <Heart size={22} />
                </Link>

                {/* User avatar + dropdown — desktop */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-1.5 text-white hover:text-[#FFE500] transition-colors p-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFE500] flex items-center justify-center">
                      <span className="text-[#2874F0] font-bold text-sm">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {userDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                          <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>
                        <nav className="py-1">
                          <Link href="/dashboard" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <User size={15} /> My Dashboard
                          </Link>
                          <Link href="/dashboard/bids" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Gavel size={15} /> My Bids
                          </Link>
                          {user.role === "admin" && (
                            <Link href="/admin" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-medium">
                              Admin Panel
                            </Link>
                          )}
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => { setUserDropdown(false); logout(); }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Sign Out
                          </button>
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Login/Register — desktop only; mobile uses hamburger menu */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-white text-sm font-medium px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-[#2874F0] text-sm font-bold px-3 py-1.5 rounded bg-[#FFE500] hover:bg-yellow-300 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 pb-2 text-sm">
          {[
            { href: "/auctions?status=live",           label: "Live Auctions", icon: "🔨" },
            { href: "/auctions?status=upcoming",       label: "Upcoming",      icon: "🕐" },
            { href: "/auctions?category=bulk",         label: "Bulk Lots",     icon: "📦" },
            { href: "/auctions?condition=refurbished", label: "Refurbished",   icon: "♻️" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/80 hover:text-[#FFE500] transition-colors font-medium flex items-center gap-1.5"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="sm:hidden overflow-hidden bg-[#1a5dcf]"
          >
            <nav className="px-4 py-2 flex flex-col">
              {/* Auctions links */}
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold pt-2 pb-1">Auctions</p>
              {[
                { href: "/auctions?status=live",           label: "Live Auctions", icon: "🔨" },
                { href: "/auctions?status=upcoming",       label: "Upcoming",      icon: "🕐" },
                { href: "/auctions?category=bulk",         label: "Bulk Lots",     icon: "📦" },
                { href: "/auctions?condition=refurbished", label: "Refurbished",   icon: "♻️" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white py-2.5 text-sm font-medium border-b border-white/10 flex items-center gap-2"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 py-3 border-b border-white/10">
                    <div className="w-9 h-9 rounded-full bg-[#FFE500] flex items-center justify-center shrink-0">
                      <span className="text-[#2874F0] font-bold">{user.name[0].toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-white/60 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold pt-2 pb-1">My Account</p>
                  {[
                    { href: "/dashboard",               label: "Dashboard"     },
                    { href: "/dashboard/wallet",        label: `Wallet — ${Math.floor((user.walletBalance ?? 0) / 100)} bids available` },
                    { href: "/dashboard/bids",          label: "My Bids"       },
                    { href: "/dashboard/orders",        label: "Orders"        },
                    { href: "/dashboard/watchlist",     label: "Watchlist"     },
                    { href: "/dashboard/notifications", label: "Notifications" },
                    { href: "/dashboard/invite",        label: "Invite & Earn" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-white/90 py-2.5 text-sm font-medium border-b border-white/10"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-[#FFE500] py-2.5 text-sm font-bold border-b border-white/10">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="text-left text-red-300 py-3 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                /* Not logged in — show Login + Register */
                <div className="flex gap-3 py-4">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-white font-semibold text-sm py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-[#2874F0] font-bold text-sm py-2.5 rounded-lg bg-[#FFE500] hover:bg-yellow-300 transition-colors"
                  >
                    Register Free
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
