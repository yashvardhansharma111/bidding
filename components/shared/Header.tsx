"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Heart, User, Menu, X, ChevronDown, Gavel } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Gavel className="text-[#FFE500]" size={28} />
            <div className="hidden sm:block">
              <span className="text-white font-bold text-xl leading-none">BidKart</span>
              <span className="text-[#FFE500] text-xs block leading-none italic">Bid. Win. Own.</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative flex items-center bg-white rounded overflow-hidden shadow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for phones, brands, models..."
                className="flex-1 px-4 py-2.5 text-sm text-gray-900 outline-none"
              />
              <button
                type="submit"
                className="bg-[#FFE500] px-4 py-2.5 hover:bg-yellow-400 transition-colors"
                aria-label="Search"
              >
                <Search size={18} className="text-[#2874F0]" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
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

                {/* Watchlist */}
                <Link href="/dashboard/watchlist" className="hidden sm:block p-2 text-white hover:text-[#FFE500] transition-colors">
                  <Heart size={22} />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-1.5 text-white hover:text-[#FFE500] transition-colors p-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFE500] flex items-center justify-center">
                      <span className="text-[#2874F0] font-bold text-sm">{user.name[0].toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={14} className="hidden sm:block" />
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
              <div className="flex items-center gap-2">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 pb-2 text-sm">
          {[
            { href: "/auctions?status=live", label: "Live Auctions" },
            { href: "/auctions?status=upcoming", label: "Upcoming" },
            { href: "/auctions?category=bulk", label: "Bulk Lots" },
            { href: "/auctions?condition=refurbished", label: "Refurbished" },
            { href: "/auctions?brand=Apple", label: "iPhone" },
            { href: "/auctions?brand=Samsung", label: "Samsung" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/80 hover:text-white hover:text-[#FFE500] transition-colors font-medium"
            >
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
            <nav className="px-4 py-2 flex flex-col gap-1">
              {[
                { href: "/auctions?status=live", label: "Live Auctions" },
                { href: "/auctions?status=upcoming", label: "Upcoming" },
                { href: "/dashboard/watchlist", label: "Watchlist" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
