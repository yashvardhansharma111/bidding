"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ShoppingBag, Heart, CheckCircle, AlertCircle, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils/formatters";
import type { IAuction } from "@/types";
import Link from "next/link";

export function AuctionQuickActions({ auction, showBuyNow = true }: { auction: IAuction; showBuyNow?: boolean }) {
  const { user } = useAuthStore();
  const router = useRouter();

  const price = auction.buyNowPrice ?? auction.baseBidPrice;
  const total = price + (auction.deliveryCharges ?? 0);
  const isLive = auction.status === "live";
  const isEnded = auction.status === "ended";

  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [buyError, setBuyError] = useState("");

  const [watching, setWatching] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);

  // Load watchlist state
  useEffect(() => {
    if (!user) return;
    axios
      .get(`/api/auctions/${auction._id}/watchlist`)
      .then(({ data }) => setWatching(data.data?.watching ?? false))
      .catch(() => {});
  }, [auction._id, user]);

  const handleBuyNow = async () => {
    if (!user) return;
    setBuyError("");
    setBuying(true);
    try {
      const { data } = await axios.post(`/api/auctions/${auction._id}/buy-now`);
      setBought(true);
      setTimeout(() => router.push(`/orders/${data.data.orderId}/address`), 1200);
    } catch (err: any) {
      setBuyError(err?.response?.data?.error ?? "Purchase failed. Try again.");
    } finally {
      setBuying(false);
    }
  };

  const handleWatchlist = async () => {
    if (!user) return;
    setWatchLoading(true);
    try {
      const { data } = await axios.post(`/api/auctions/${auction._id}/watchlist`);
      setWatching(data.data?.watching ?? false);
    } catch {
    } finally {
      setWatchLoading(false);
    }
  };

  if (bought) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center space-y-2">
        <CheckCircle size={36} className="text-green-500 mx-auto" />
        <p className="font-bold text-gray-900">Purchase Confirmed!</p>
        <p className="text-sm text-gray-400">Redirecting to address form…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-500 mb-4">Quick Actions</h2>

      {!user ? (
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-[#2874F0] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <LogIn size={18} /> Login to Buy
          </Link>
          <p className="text-center text-xs text-gray-400">Login required to purchase or save this item</p>
        </div>
      ) : isEnded ? (
        <p className="text-center text-gray-500 py-4 font-medium">
          {auction.winner ? "This item has been sold." : "This listing has ended."}
        </p>
      ) : !isLive ? (
        <p className="text-center text-[#2874F0] py-4 font-medium">
          Coming soon — save it to your watchlist!
        </p>
      ) : (
        <>
          {/* Buy Now */}
          {showBuyNow && (
            <>
              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="w-full flex items-center justify-center gap-2 bg-[#FFE500] text-[#0f172a] font-black py-3.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-60 text-base"
              >
                {buying ? (
                  <span className="w-5 h-5 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full animate-spin" />
                ) : (
                  <ShoppingBag size={18} />
                )}
                {buying ? "Processing…" : `Buy Now — ${formatCurrency(total)}`}
              </button>

              {buyError && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle size={14} /> {buyError}
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* Watchlist */}
      <button
        onClick={handleWatchlist}
        disabled={watchLoading || !user}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-colors disabled:opacity-50 ${
          watching
            ? "border-red-300 text-red-500 bg-red-50 hover:bg-red-100"
            : "border-gray-200 text-gray-600 hover:border-[#2874F0] hover:text-[#2874F0] hover:bg-blue-50"
        }`}
      >
        <Heart size={16} className={watching ? "fill-red-500" : ""} />
        {watching ? "Saved to Watchlist" : "Save to Watchlist"}
      </button>
    </div>
  );
}
