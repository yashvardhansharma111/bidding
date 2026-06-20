"use client";
import { create } from "zustand";
import type { IAuction, IBid } from "@/types";

interface LiveBidData {
  auctionId: string;
  currentBid: number;
  totalBids: number;
  totalBidders: number;
  recentBids: IBid[];
  lastBidder?: { _id: string; name: string };
}

interface AuctionStore {
  auctions: IAuction[];
  liveData: Record<string, LiveBidData>;
  filters: Record<string, string>;
  setAuctions: (auctions: IAuction[]) => void;
  updateLiveBid: (auctionId: string, data: Partial<LiveBidData>) => void;
  addRecentBid: (auctionId: string, bid: IBid) => void;
  setFilters: (filters: Record<string, string>) => void;
  clearFilters: () => void;
}

export const useAuctionStore = create<AuctionStore>((set) => ({
  auctions: [],
  liveData: {},
  filters: {},
  setAuctions: (auctions) => set({ auctions }),
  updateLiveBid: (auctionId, data) =>
    set((state) => ({
      liveData: {
        ...state.liveData,
        [auctionId]: { ...state.liveData[auctionId], ...data },
      },
    })),
  addRecentBid: (auctionId, bid) =>
    set((state) => {
      const existing = state.liveData[auctionId]?.recentBids || [];
      return {
        liveData: {
          ...state.liveData,
          [auctionId]: {
            ...state.liveData[auctionId],
            recentBids: [bid, ...existing].slice(0, 20),
          },
        },
      };
    }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
