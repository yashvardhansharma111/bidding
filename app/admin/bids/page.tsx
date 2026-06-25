"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { formatCurrency } from "@/lib/utils/formatters";
import { Search, Gavel, Trophy, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Bid {
  _id: string;
  amount: number;
  isAutoBid: boolean;
  createdAt: string;
  bidder: { _id: string; name: string; email: string; walletBalance: number };
  auction: { _id: string; title: string; brand: string; status: string; currentBid: number; endTime: string };
}

export default function AdminBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingWinner, setSettingWinner] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/bids?limit=100");
      setBids(data.data.bids);
      setTotal(data.data.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBids(); }, [fetchBids]);

  const setWinner = async (auctionId: string, bidderId: string, bidderName: string) => {
    if (!confirm(`Set ${bidderName} as the winner of this auction?`)) return;
    setSettingWinner(bidderId + auctionId);
    try {
      await axios.post(`/api/admin/auctions/${auctionId}/winner`, { winnerId: bidderId });
      toast.success(`${bidderName} set as winner!`);
      fetchBids();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to set winner");
    } finally {
      setSettingWinner(null);
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  const filtered = bids.filter((b) =>
    !search ||
    b.bidder?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.auction?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.bidder?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Bids</h1>
          <p className="text-gray-500 text-sm">{total} total bids</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bidder name, email or auction..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2874F0]"
          />
        </div>
      </div>

      {/* Bids table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Gavel size={40} className="mx-auto mb-3 opacity-30" />
            <p>No bids found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Bidder</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Auction</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Bid Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Wallet</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Auction Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((bid) => {
                  const isTopBid = bid.auction?.currentBid === bid.amount;
                  const canSetWinner = ["live", "ended", "upcoming"].includes(bid.auction?.status ?? "");
                  return (
                    <tr key={bid._id} className={`hover:bg-gray-50/50 ${isTopBid ? "bg-green-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{bid.bidder?.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{bid.bidder?.email ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{bid.auction?.title ?? "—"}</p>
                        <p className="text-xs text-gray-400">{bid.auction?.brand ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${isTopBid ? "text-green-600" : "text-gray-900"}`}>
                          {formatCurrency(bid.amount)}
                        </span>
                        {isTopBid && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Highest</span>}
                        {bid.isAutoBid && <span className="ml-1 text-xs text-blue-500">(auto)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatCurrency(bid.bidder?.walletBalance ?? 0)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(bid.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                          bid.auction?.status === "live" ? "bg-green-100 text-green-700" :
                          bid.auction?.status === "ended" ? "bg-gray-100 text-gray-600" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {bid.auction?.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canSetWinner && bid.auction?.status !== "ended" && (
                          <button
                            onClick={() => setWinner(bid.auction._id, bid.bidder._id, bid.bidder.name)}
                            disabled={settingWinner === bid.bidder._id + bid.auction._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2874F0] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                          >
                            <Trophy size={12} />
                            Set Winner
                          </button>
                        )}
                        {bid.auction?.status === "ended" && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <CheckCircle size={13} /> Ended
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
