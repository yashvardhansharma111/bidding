"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSocket } from "./useSocket";
import { useAuctionStore } from "@/store/auctionStore";
import { useAuthStore } from "@/store/authStore";
import type { IAuction, IBid, BidUpdatePayload } from "@/types";

export function useBidding(auction: IAuction) {
  const socket = useSocket();
  const { user } = useAuthStore();
  const { updateLiveBid, addRecentBid, liveData } = useAuctionStore();
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const live = liveData[auction._id];

  useEffect(() => {
    updateLiveBid(auction._id, {
      auctionId: auction._id,
      currentBid: auction.currentBid,
      totalBids: auction.totalBids,
      totalBidders: auction.totalBidders,
      recentBids: [],
    });

    socket.emit("auction_join", { auctionId: auction._id, userId: user?._id });

    socket.on("bid_update", (payload: BidUpdatePayload) => {
      if (payload.auctionId === auction._id) {
        updateLiveBid(auction._id, {
          currentBid: payload.newBid,
          totalBids: payload.totalBids,
          totalBidders: payload.totalBidders,
          lastBidder: payload.bidder,
        });
        toast.success(`New bid: ₹${payload.newBid.toLocaleString("en-IN")}`, { id: "bid-update" });
      }
    });

    socket.on("outbid_notification", () => {
      toast.error("You've been outbid!", { id: "outbid" });
    });

    return () => {
      socket.off("bid_update");
      socket.off("outbid_notification");
      socket.emit("auction_leave", { auctionId: auction._id });
    };
  }, [auction._id, socket, user?._id]);

  const placeBid = useCallback(
    async (amount: number) => {
      if (!user) {
        toast.error("Please login to bid");
        return { success: false };
      }
      setIsPlacingBid(true);
      try {
        await axios.post(`/api/auctions/${auction._id}/bids`, { amount });
        toast.success("Bid placed successfully!");
        return { success: true };
      } catch (err: any) {
        const msg = err.response?.data?.error || "Failed to place bid";
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setIsPlacingBid(false);
      }
    },
    [auction._id, user]
  );

  return {
    currentBid: live?.currentBid ?? auction.currentBid,
    totalBids: live?.totalBids ?? auction.totalBids,
    totalBidders: live?.totalBidders ?? auction.totalBidders,
    lastBidder: live?.lastBidder,
    recentBids: live?.recentBids ?? [],
    isPlacingBid,
    placeBid,
    minNextBid: (live?.currentBid ?? auction.currentBid) + auction.minIncrement,
  };
}
