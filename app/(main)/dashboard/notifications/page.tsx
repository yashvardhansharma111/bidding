"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { formatDate } from "@/lib/utils/formatters";
import { Bell, CheckCheck } from "lucide-react";
import type { INotification } from "@/types";

const TYPE_STYLES: Record<string, string> = {
  outbid: "bg-orange-100 text-orange-600",
  won: "bg-green-100 text-green-600",
  auction_start: "bg-blue-100 text-blue-600",
  auction_end: "bg-gray-100 text-gray-600",
  payment: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-600",
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { setNotifications, markAllRead } = useNotificationStore();
  const [notifications, setLocal] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    axios.get("/api/user/notifications").then(({ data }) => {
      setLocal(data.data.notifications);
      setNotifications(data.data.notifications);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleMarkAllRead = async () => {
    await axios.put("/api/user/notifications");
    setLocal((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllRead();
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 text-sm text-[#2874F0] hover:underline">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-gray-400 text-sm mt-1">You&apos;ll be notified about bid updates and auction results</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n._id} className={`bg-white rounded-xl border p-4 transition-colors ${n.isRead ? "border-gray-100" : "border-[#2874F0]/30 bg-blue-50/30"}`}>
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_STYLES[n.type] || TYPE_STYLES.system}`}>
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#2874F0] mt-2 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
