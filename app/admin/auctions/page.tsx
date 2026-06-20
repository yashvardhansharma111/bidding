"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { formatCurrency, formatDate, getAuctionStatusColor } from "@/lib/utils/formatters";
import { Plus, Search, Edit, Trash2, X, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Auction {
  _id: string;
  title: string;
  brand: string;
  status: string;
  currentBid: number;
  totalBids: number;
  endTime: string;
  category: string;
}

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const { data } = await axios.get(`/api/auctions?${params}`);
      setAuctions(data.data.data);
      setTotal(data.data.total);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/auctions/${id}`);
      toast.success("Auction deleted");
      fetch();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm("Close this auction now and determine winner?")) return;
    setClosingId(id);
    try {
      await axios.post(`/api/admin/auctions/${id}/close`);
      toast.success("Auction closed");
      fetch();
    } catch {
      toast.error("Failed to close auction");
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
          <p className="text-gray-500 text-sm">{total} total auctions</p>
        </div>
        <Link href="/admin/auctions/new" className="flex items-center gap-2 bg-[#2874F0] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
          <Plus size={17} /> New Auction
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search auctions..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2874F0]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2874F0]"
        >
          <option value="">All Status</option>
          <option value="live">Live</option>
          <option value="upcoming">Upcoming</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Auction</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Current Bid</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Bids</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">End Time</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                      <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded w-16" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    </tr>
                  ))
                : auctions.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{a.title}</p>
                          <p className="text-gray-400 text-xs">{a.brand} • {a.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getAuctionStatusColor(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#2874F0]">{formatCurrency(a.currentBid)}</td>
                      <td className="px-4 py-4 text-gray-600">{a.totalBids}</td>
                      <td className="px-4 py-4 text-gray-500">{formatDate(a.endTime)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/auctions/${a._id}/edit`} className="p-1.5 text-gray-500 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={15} />
                          </Link>
                          {a.status === "live" && (
                            <button
                              onClick={() => handleClose(a._id)}
                              disabled={closingId === a._id}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Close Auction"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(a._id, a.title)}
                            disabled={deletingId === a._id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
