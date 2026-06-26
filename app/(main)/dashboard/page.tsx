import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { connectDB } from "@/lib/db/connect";
import Bid from "@/lib/db/models/Bid";
import Order from "@/lib/db/models/Order";
import Watchlist from "@/lib/db/models/Watchlist";
import Notification from "@/lib/db/models/Notification";
import { Gavel, Trophy, Heart, Package, Bell } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  await connectDB();
  const [activeBids, wonOrders, watchlistCount, unreadNotifications] = await Promise.all([
    Bid.countDocuments({ bidder: user._id }),
    Order.countDocuments({ winner: user._id, status: { $ne: "cancelled" } }),
    Watchlist.countDocuments({ user: user._id }),
    Notification.countDocuments({ user: user._id, isRead: false }),
  ]);

  const stats = [
    { icon: Gavel,   label: "Active Bids",   value: activeBids,           href: "/dashboard/bids",          color: "text-[#2874F0] bg-blue-50"   },
    { icon: Trophy,  label: "Won Auctions",   value: wonOrders,            href: "/dashboard/orders",        color: "text-yellow-600 bg-yellow-50" },
    { icon: Heart,   label: "Watchlist",      value: watchlistCount,       href: "/dashboard/watchlist",     color: "text-red-500 bg-red-50"       },
    { icon: Bell,    label: "Unread",         value: unreadNotifications,  href: "/dashboard/notifications", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-0 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user.name}!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, href, color }) => (
          <Link key={label} href={href} className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

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
