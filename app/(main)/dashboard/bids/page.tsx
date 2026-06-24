"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { CountdownTimer } from "@/components/auctions/CountdownTimer";
import { Gavel, TrendingUp } from "lucide-react";

interface ActiveBid {
  _id: string;
  amount: number;
  createdAt: string;
  auction: {
    _id: string;
    title: string;
    images: string[];
    currentBid: number;
    endTime: string;
    status: string;
    brand: string;
    model: string;
  };
}

export default function BidsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [bids, setBids] = useState<ActiveBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    axios.get("/api/user/dashboard").then(({ data }) => {
      setBids(data.data.activeBids || []);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bids</h1>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-16">
          <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No bids placed yet</p>
          <Link href="/auctions?status=live" className="inline-block mt-4 bg-[#2874F0] text-white px-5 py-2 rounded-lg font-semibold text-sm">Start Bidding</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => {
            const isLeading = bid.auction.currentBid === bid.amount;
            const isLive = bid.auction.status === "live";
            return (
              <Link key={bid._id} href={`/auctions/${bid.auction._id}`} className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {bid.auction.images?.[0] ? (
                      <img src={bid.auction.images[0]} alt={bid.auction.title} className="w-full h-full object-contain p-1 rounded-lg" />
                    ) : <Gavel size={20} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">{bid.auction.title}</h3>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#2874F0] flex items-center gap-1">
                          <TrendingUp size={12} />
                          {formatCurrency(bid.auction.currentBid)}
                        </p>
                        <p className="text-[10px] text-gray-400">current</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{bid.auction.brand} • {formatDate(bid.createdAt)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isLeading ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {isLeading ? "Leading" : "Outbid"}
                      </span>
                      <span className="text-xs text-gray-500">Your bid: {formatCurrency(bid.amount)}</span>
                      {isLive && <CountdownTimer endTime={bid.auction.endTime} label="" />}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
