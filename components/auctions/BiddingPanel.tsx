"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, TrendingUp, Users, AlertCircle, Zap } from "lucide-react";
import { useBidding } from "@/hooks/useBidding";
import { useAuthStore } from "@/store/authStore";
import { CountdownTimer } from "./CountdownTimer";
import { formatCurrency } from "@/lib/utils/formatters";
import type { IAuction } from "@/types";
import Link from "next/link";

export function BiddingPanel({ auction }: { auction: IAuction }) {
  const { user } = useAuthStore();
  const { currentBid, totalBids, totalBidders, minNextBid, isPlacingBid, placeBid, lastBidder } = useBidding(auction);
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");

  const isLive = auction.status === "live";
  const isEnded = auction.status === "ended";

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!amount || isNaN(amount)) {
      setError("Enter a valid bid amount");
      return;
    }
    if (amount < minNextBid) {
      setError(`Minimum bid is ${formatCurrency(minNextBid)}`);
      return;
    }
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
            {lastBidder && (
              <p className="text-blue-200 text-xs mt-0.5">by {lastBidder.name}</p>
            )}
          </div>
          <div className="text-right">
            <CountdownTimer endTime={auction.endTime} large />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x border-b border-gray-100">
        {[
          { icon: Gavel, label: "Total Bids", value: totalBids },
          { icon: Users, label: "Bidders", value: totalBidders },
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
            {/* Quick bid buttons */}
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

            {/* Manual input */}
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

            {/* Buy Now */}
            {auction.buyNowPrice && (
              <div className="border-t border-gray-100 pt-4">
                <button className="w-full bg-[#FFE500] text-[#2874F0] font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors">
                  Buy Now — {formatCurrency(auction.buyNowPrice)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rule hint */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Min. bid increment: {formatCurrency(auction.minIncrement)} • Each bid extends timer by 30s
        </p>
      </div>
    </div>
  );
}
