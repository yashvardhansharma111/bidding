"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Heart } from "lucide-react";
import type { IAuction } from "@/types";

export default function WatchlistPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [auctions, setAuctions] = useState<IAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    axios.get("/api/user/dashboard").then(({ data }) => {
      setAuctions((data.data.watchlist || []).map((w: any) => w.auction));
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Watchlist</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Your watchlist is empty</p>
          <p className="text-gray-400 text-sm mt-1">Click the heart icon on auctions to save them</p>
          <Link href="/auctions" className="inline-block mt-4 bg-[#2874F0] text-white px-5 py-2 rounded-lg font-semibold text-sm">Browse Auctions</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} isWatched />
          ))}
        </div>
      )}
    </div>
  );
}
