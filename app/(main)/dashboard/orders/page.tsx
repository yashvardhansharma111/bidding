"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Package, CreditCard, Truck, CheckCircle, ArrowRight } from "lucide-react";

interface Order {
  _id: string;
  status: string;
  finalAmount: number;
  totalAmount: number;
  deliveryCharges: number;
  createdAt: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  shippingLabel?: string;
  auction: {
    _id: string;
    title: string;
    images: string[];
    brand: string;
    model: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  won: { label: "Won — Payment Pending", color: "bg-yellow-100 text-yellow-800", icon: Package },
  pending_payment: { label: "Pending Payment", color: "bg-orange-100 text-orange-800", icon: CreditCard },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: Package },
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    axios.get("/api/user/dashboard").then(({ data }) => {
      setOrders(data.data.orders || []);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Win an auction to see your orders here</p>
          <Link href="/auctions?status=live" className="inline-block mt-4 bg-[#2874F0] text-white px-5 py-2 rounded-lg font-semibold text-sm">Browse Live Auctions</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.won;
            const Icon = config.icon;
            const needsPayment = order.status === "won" || order.status === "pending_payment";
            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {order.auction.images?.[0] ? (
                      <img src={order.auction.images[0]} alt={order.auction.title} className="w-full h-full object-contain rounded-lg p-1" />
                    ) : (
                      <Package size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">{order.auction.title}</h3>
                      <p className="text-base sm:text-lg font-bold text-gray-900 shrink-0">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">{order.auction.brand} {order.auction.model}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${config.color}`}>
                        <Icon size={11} /> {config.label}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.deliveryCharges > 0 && (
                      <p className="text-xs text-gray-400 mt-1">+{formatCurrency(order.deliveryCharges)} delivery</p>
                    )}
                  </div>
                </div>
                {needsPayment && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link
                      href={`/payment/${order._id}`}
                      className="flex items-center justify-center gap-2 bg-[#2874F0] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto sm:float-right"
                    >
                      <CreditCard size={15} /> Pay Now — {formatCurrency(order.totalAmount)}
                    </Link>
                  </div>
                )}
                {(order.status === "shipped" || order.status === "delivered") && order.awbCode && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <Truck size={14} className="text-purple-500" />
                      <span className="font-medium">{order.courierName}</span>
                      <span className="text-gray-400 hidden sm:inline">·</span>
                      <span className="text-gray-500 text-xs">AWB: {order.awbCode}</span>
                    </div>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-100 transition-colors"
                      >
                        <Truck size={13} /> Track Package
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
