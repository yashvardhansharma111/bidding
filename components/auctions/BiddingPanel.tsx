"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, TrendingUp, Users, AlertCircle, Zap, ShoppingBag, Truck, CheckCircle } from "lucide-react";
import { useBidding } from "@/hooks/useBidding";
import { useAuthStore } from "@/store/authStore";
import { CountdownTimer } from "./CountdownTimer";
import { formatCurrency } from "@/lib/utils/formatters";
import type { IAuction } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

// ─── Fixed-Price Buy Now Panel (bulk / refurbished) ───────────────────────────
function BuyNowPanel({ auction }: { auction: IAuction }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchased, setPurchased] = useState(false);

  const price = auction.buyNowPrice ?? auction.baseBidPrice;
  const total = price + (auction.deliveryCharges ?? 0);
  const isLive = auction.status === "live";
  const isEnded = auction.status === "ended";

  const handleBuyNow = async () => {
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/auctions/${auction._id}/buy-now`);
      setPurchased(true);
      setTimeout(() => router.push(`/payment/${data.data.orderId}`), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Purchase failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#2874F0] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
              {auction.category === "bulk" ? "Bulk Deal — Fixed Price" : "Refurbished — Fixed Price"}
            </p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(price)}</p>
            <p className="text-blue-200 text-xs mt-0.5">Fixed price — no bidding</p>
          </div>
          {isLive && (
            <div className="text-right">
              <CountdownTimer endTime={auction.endTime} large />
            </div>
          )}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border-b border-gray-100 px-5 py-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Item price</span>
          <span className="font-semibold text-gray-900">{formatCurrency(price)}</span>
        </div>
        {auction.deliveryCharges > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1"><Truck size={12} /> Delivery</span>
            <span className="font-semibold text-gray-900">{formatCurrency(auction.deliveryCharges)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm border-t border-gray-100 pt-1.5 mt-1.5">
          <span className="font-bold text-gray-800">Total payable</span>
          <span className="font-bold text-[#2874F0]">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Action area */}
      <div className="p-5">
        {purchased ? (
          <div className="flex flex-col items-center gap-2 py-3 text-green-600">
            <CheckCircle size={32} />
            <p className="font-bold">Purchase Confirmed!</p>
            <p className="text-sm text-gray-500">Redirecting to payment…</p>
          </div>
        ) : isEnded ? (
          <div className="text-center py-4">
            <p className="text-gray-500 font-medium">
              {auction.winner ? "This item has been sold." : "This listing has ended."}
            </p>
          </div>
        ) : !isLive ? (
          <div className="text-center py-4">
            <p className="text-[#2874F0] font-medium">Available soon</p>
            <CountdownTimer endTime={auction.startTime} label="Available in" />
          </div>
        ) : !user ? (
          <div className="space-y-3 text-center py-2">
            <p className="text-gray-600 text-sm">Login to purchase this item</p>
            <Link
              href="/login"
              className="block w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login to Buy
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="w-full bg-[#FFE500] text-[#0f172a] font-black py-3.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#0f172a]/30 border-t-[#0f172a] rounded-full animate-spin" />
              ) : (
                <ShoppingBag size={18} />
              )}
              {loading ? "Processing…" : `Buy Now — ${formatCurrency(total)}`}
            </button>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <p className="text-xs text-gray-400 text-center">
              One-time purchase · Payment due after confirmation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Regular Bidding Panel ─────────────────────────────────────────────────────
export function BiddingPanel({ auction }: { auction: IAuction }) {
  // Route to BuyNow panel for bulk/refurbished
  const isBuyNowOnly =
    auction.category === "bulk" || auction.condition === "refurbished";
  if (isBuyNowOnly) return <BuyNowPanel auction={auction} />;

  const { user } = useAuthStore();
  const { currentBid, totalBids, totalBidders, minNextBid, isPlacingBid, placeBid, lastBidder } = useBidding(auction);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");

  const isLive = auction.status === "live";
  const isEnded = auction.status === "ended";

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!amount || isNaN(amount)) { setError("Enter a valid bid amount"); return; }
    if (amount < minNextBid) { setError(`Minimum bid is ${formatCurrency(minNextBid)}`); return; }
    setError("");
    const result = await placeBid(amount);
    if (result.success) setBidAmount("");
  };

  const quickBids = [
    minNextBid,
    minNextBid + auction.minIncrement,
    minNextBid + auction.minIncrement * 2,
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#2874F0] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium">Current Highest Bid</p>
            <motion.p
              key={currentBid}
              initial={{ scale: 1.15, color: "#FFE500" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-3xl font-bold text-white"
            >
              {formatCurrency(currentBid)}
            </motion.p>
            {lastBidder && <p className="text-blue-200 text-xs mt-0.5">by {lastBidder.name}</p>}
          </div>
          <div className="text-right">
            <CountdownTimer endTime={auction.endTime} large />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x border-b border-gray-100">
        {[
          { icon: Gavel,     label: "Total Bids",   value: totalBids },
          { icon: Users,     label: "Bidders",       value: totalBidders },
          { icon: TrendingUp, label: "Min Increment", value: formatCurrency(auction.minIncrement) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="px-4 py-3 text-center">
            <Icon size={16} className="mx-auto mb-1 text-[#2874F0]" />
            <p className="text-gray-900 font-semibold text-sm">{value}</p>
            <p className="text-gray-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Bidding area */}
      <div className="p-5">
        {isEnded ? (
          <div className="text-center py-4">
            <p className="text-gray-500 font-medium">This auction has ended.</p>
            {auction.winner && <p className="text-green-600 font-semibold mt-1">Winner announced!</p>}
          </div>
        ) : !isLive ? (
          <div className="text-center py-4">
            <p className="text-[#2874F0] font-medium">Auction starting soon</p>
            <CountdownTimer endTime={auction.startTime} label="Starts in" />
          </div>
        ) : !user ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-gray-600 text-sm">Login to place your bid</p>
            <Link href="/login" className="block w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors text-center">
              Login to Bid
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Quick Bid</p>
              <div className="flex gap-2">
                {quickBids.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBidAmount(amount.toString())}
                    className="flex-1 text-sm border-2 border-[#2874F0] text-[#2874F0] rounded-lg py-2 font-semibold hover:bg-[#2874F0] hover:text-white transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Or enter amount</p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => { setBidAmount(e.target.value); setError(""); }}
                    placeholder={minNextBid.toString()}
                    min={minNextBid}
                    className="w-full pl-7 pr-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 font-semibold focus:border-[#2874F0] outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={handleBid}
                  disabled={isPlacingBid}
                  className="bg-[#2874F0] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPlacingBid ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap size={18} />
                  )}
                  Bid
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2"
                >
                  <AlertCircle size={15} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {auction.buyNowPrice && (
              <div className="border-t border-gray-100 pt-4">
                <button className="w-full bg-[#FFE500] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors">
                  Buy Now — {formatCurrency(auction.buyNowPrice)}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4 text-center">
          Min. bid increment: {formatCurrency(auction.minIncrement)} • Each bid extends timer by 30s
        </p>
      </div>
    </div>
  );
}
