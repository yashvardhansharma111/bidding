"use client";
import { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export function useWatchlist(auctionId: string, initialWatching = false) {
  const { isAuthenticated } = useAuthStore();
  const [watching, setWatching] = useState(initialWatching);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to watchlist");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/auctions/${auctionId}/watchlist`);
      setWatching(data.data.watching);
      toast.success(data.data.watching ? "Added to watchlist" : "Removed from watchlist");
    } catch {
      toast.error("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  }, [auctionId, isAuthenticated]);

  return { watching, loading, toggle };
}
