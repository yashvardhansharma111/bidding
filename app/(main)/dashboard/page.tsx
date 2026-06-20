"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Gavel, Trophy, Heart, Package, Bell } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    axios.get("/api/user/dashboard").then(({ data }) => {
      setData(data.data);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Gavel, label: "Active Bids", value: data?.activeBids?.length || 0, href: "/dashboard/bids", color: "text-[#2874F0] bg-blue-50" },
    { icon: Trophy, label: "Won Auctions", value: data?.orders?.filter((o: any) => o.status !== "cancelled").length || 0, href: "/dashboard/orders", color: "text-yellow-600 bg-yellow-50" },
    { icon: Heart, label: "Watchlist", value: data?.watchlist?.length || 0, href: "/dashboard/watchlist", color: "text-red-500 bg-red-50" },
    { icon: Bell, label: "Unread", value: data?.unreadNotifications || 0, href: "/dashboard/notifications", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, href, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={href} className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/auctions?status=live" className="bg-[#2874F0] text-white rounded-xl p-5 hover:bg-blue-700 transition-colors">
          <Gavel size={24} className="mb-2" />
          <p className="font-bold">Browse Live Auctions</p>
          <p className="text-blue-200 text-sm mt-1">Place bids now</p>
        </Link>
        <Link href="/dashboard/orders" className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <Package size={24} className="text-[#2874F0] mb-2" />
          <p className="font-bold text-gray-900">My Orders</p>
          <p className="text-gray-400 text-sm mt-1">Track won auctions</p>
        </Link>
        <Link href="/dashboard/watchlist" className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
          <Heart size={24} className="text-red-500 mb-2" />
          <p className="font-bold text-gray-900">Watchlist</p>
          <p className="text-gray-400 text-sm mt-1">Saved auctions</p>
        </Link>
      </div>
    </div>
  );
}
