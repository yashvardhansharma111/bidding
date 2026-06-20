"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { formatCurrency } from "@/lib/utils/formatters";
import { Package, Users, Zap, DollarSign, Clock, AlertCircle, Plus, ExternalLink } from "lucide-react";

interface Analytics {
  totalAuctions: number;
  liveAuctions: number;
  upcomingAuctions: number;
  endedAuctions: number;
  totalUsers: number;
  totalRevenue: number;
  pendingPayments: number;
  recentAuctions: Array<{
    _id: string;
    title: string;
    status: string;
    currentBid: number;
    endTime: string;
    brand: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/analytics").then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        { icon: Package, label: "Total Auctions", value: data.totalAuctions, sub: `${data.liveAuctions} live`, color: "bg-blue-50 text-[#2874F0]" },
        { icon: Zap, label: "Live Now", value: data.liveAuctions, sub: `${data.upcomingAuctions} upcoming`, color: "bg-green-50 text-green-600" },
        { icon: Users, label: "Total Users", value: data.totalUsers, sub: "registered", color: "bg-purple-50 text-purple-600" },
        { icon: DollarSign, label: "Revenue", value: formatCurrency(data.totalRevenue), sub: "from paid orders", color: "bg-yellow-50 text-yellow-600" },
        { icon: AlertCircle, label: "Pending Payments", value: data.pendingPayments, sub: "awaiting payment", color: "bg-red-50 text-red-600" },
      ]
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, Admin</p>
        </div>
        <Link
          href="/admin/auctions/new"
          className="flex items-center gap-2 bg-[#2874F0] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={17} /> New Auction
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Auctions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Auctions</h2>
          <Link href="/admin/auctions" className="text-sm text-[#2874F0] hover:underline flex items-center gap-1">
            View all <ExternalLink size={13} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              ))
            : data?.recentAuctions.map((a) => (
                <div key={a._id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.brand}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#2874F0]">{formatCurrency(a.currentBid)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === "live" ? "bg-green-100 text-green-700" :
                      a.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {a.status}
                    </span>
                    <Link href={`/admin/auctions/${a._id}/edit`} className="text-xs text-[#2874F0] hover:underline">Edit</Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
