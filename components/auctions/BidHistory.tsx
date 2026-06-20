"use client";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import type { IBid, IUser } from "@/types";

interface BidHistoryProps {
  bids: IBid[];
  isLoading?: boolean;
}

export function BidHistory({ bids, isLoading }: BidHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="font-medium">No bids yet</p>
        <p className="text-sm mt-1">Be the first to bid!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
      <AnimatePresence initial={false}>
        {bids.map((bid, index) => {
          const bidder = bid.bidder as IUser;
          return (
            <motion.div
              key={bid._id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${index === 0 ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2874F0] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(bidder?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {bidder?.name || "Anonymous"}
                    {index === 0 && <span className="ml-2 text-xs text-[#2874F0] font-medium">Highest</span>}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(bid.createdAt)}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${index === 0 ? "text-[#2874F0]" : "text-gray-700"}`}>
                {formatCurrency(bid.amount)}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
