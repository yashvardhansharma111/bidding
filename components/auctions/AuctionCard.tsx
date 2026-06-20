"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Clock, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useCountdown } from "@/hooks/useCountdown";
import { formatCurrency, getConditionLabel } from "@/lib/utils/formatters";
import type { IAuction } from "@/types";

interface AuctionCardProps {
  auction: IAuction;
  isWatched?: boolean;
}

export function AuctionCard({ auction, isWatched = false }: AuctionCardProps) {
  const { watching, loading, toggle } = useWatchlist(auction._id, isWatched);
  const time = useCountdown(auction.endTime);
  const isLive = auction.status === "live";
  const isEnded = auction.status === "ended";

  const timeDisplay = isLive
    ? time.total > 0
      ? `${time.hours.toString().padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}:${time.seconds.toString().padStart(2, "0")}`
      : "Ending..."
    : auction.status === "upcoming"
    ? "Upcoming"
    : "Ended";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(40,116,240,0.15)" }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <Link href={`/auctions/${auction._id}`} className="block relative">
        <div className="relative h-44 bg-gray-50 overflow-hidden">
          {auction.images[0] ? (
            <Image
              src={auction.images[0]}
              alt={auction.title}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={auction.status as any}>{auction.status.toUpperCase()}</Badge>
          </div>
          {/* Condition badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={auction.condition as any}>{getConditionLabel(auction.condition)}</Badge>
          </div>
        </div>
      </Link>

      <div className="p-3">
        {/* Brand + Model */}
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
          {auction.brand}
        </p>
        <Link href={`/auctions/${auction._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-[#2874F0] transition-colors">
            {auction.title}
          </h3>
        </Link>

        {/* Specs summary */}
        {(auction.specs?.ram || auction.specs?.storage) && (
          <p className="text-xs text-gray-400 mt-1">
            {[auction.specs.ram, auction.specs.storage].filter(Boolean).join(" • ")}
          </p>
        )}

        {/* Current bid */}
        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Current Bid</p>
            <p className="text-lg font-bold text-[#2874F0]">{formatCurrency(auction.currentBid)}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggle(); }}
            disabled={loading}
            className={`p-2 rounded-full transition-colors ${watching ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-400 hover:bg-red-50"}`}
            aria-label="Toggle watchlist"
          >
            <Heart size={18} fill={watching ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Meta */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{auction.totalBidders} bidders</span>
          </div>
          <div className="flex items-center gap-1">
            {isLive && !isEnded && <TrendingUp size={12} className="text-green-500" />}
            <span className={isLive && time.total < 3600000 ? "text-red-500 font-semibold" : ""}>
              <Clock size={12} className="inline mr-0.5" />
              {timeDisplay}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/auctions/${auction._id}`}
          className={`mt-3 block text-center text-sm font-semibold py-2 rounded-lg transition-colors ${
            isLive
              ? "bg-[#2874F0] text-white hover:bg-blue-700"
              : isEnded
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-[#FFE500] text-[#2874F0] hover:bg-yellow-300"
          }`}
        >
          {isLive ? "Bid Now" : isEnded ? "View Result" : "View Details"}
        </Link>
      </div>
    </motion.div>
  );
}
