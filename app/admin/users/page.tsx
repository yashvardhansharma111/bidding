"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils/formatters";
import { Search, Ban, CheckCircle, Wallet, Plus, Minus } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isBanned: boolean;
  isVerified: boolean;
  walletBalance: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [walletModal, setWalletModal] = useState<{ user: User; type: "credit" | "debit" } | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const { data } = await axios.get(`/api/admin/users?${params}`);
      setUsers(data.data.data);
      setTotal(data.data.total);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (id: string, name: string, currentlyBanned: boolean) => {
    if (!confirm(`${currentlyBanned ? "Unban" : "Ban"} ${name}?`)) return;
    setBanningId(id);
    try {
      const { data } = await axios.post(`/api/admin/users/${id}/ban`);
      toast.success(data.message);
      fetchUsers();
    } catch {
      toast.error("Action failed");
    } finally {
      setBanningId(null);
    }
  };

  const handleWallet = async () => {
    if (!walletModal || !walletAmount) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) return toast.error("Enter a valid amount");
    setWalletLoading(true);
    try {
      const { data } = await axios.post(`/api/admin/users/${walletModal.user._id}/wallet`, {
        amount,
        type: walletModal.type === "credit" ? "admin_credit" : "admin_debit",
        description: `Admin ${walletModal.type} of ₹${amount}`,
      });
      toast.success(data.message);
      setWalletModal(null);
      setWalletAmount("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Wallet action failed");
    } finally {
      setWalletLoading(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{total} registered users</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#2874F0]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">User</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Wallet</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Verified</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Joined</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                      ))}
                    </tr>
                  ))
                : users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2874F0] flex items-center justify-center text-white text-xs font-bold">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-gray-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{u.phone || "—"}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{fmt(u.walletBalance ?? 0)}</span>
                          <button
                            onClick={() => { setWalletModal({ user: u, type: "credit" }); setWalletAmount(""); }}
                            className="w-6 h-6 bg-green-100 text-green-700 rounded flex items-center justify-center hover:bg-green-200 transition-colors"
                            title="Add to wallet"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => { setWalletModal({ user: u, type: "debit" }); setWalletAmount(""); }}
                            className="w-6 h-6 bg-red-100 text-red-700 rounded flex items-center justify-center hover:bg-red-200 transition-colors"
                            title="Deduct from wallet"
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isVerified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                          {u.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleBan(u._id, u.name, u.isBanned)}
                          disabled={banningId === u._id}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            u.isBanned
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {u.isBanned ? <><CheckCircle size={13} /> Unban</> : <><Ban size={13} /> Ban</>}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet Modal */}
      {walletModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${walletModal.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                <Wallet size={20} className={walletModal.type === "credit" ? "text-green-600" : "text-red-600"} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {walletModal.type === "credit" ? "Add to Wallet" : "Deduct from Wallet"}
                </h3>
                <p className="text-sm text-gray-500">{walletModal.user.name} · Current: {fmt(walletModal.user.walletBalance ?? 0)}</p>
              </div>
            </div>
            <input
              type="number"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              placeholder="Enter amount (₹)"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setWalletModal(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWallet}
                disabled={walletLoading}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                  walletModal.type === "credit" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {walletLoading ? "Processing..." : walletModal.type === "credit" ? `Add ₹${walletAmount || 0}` : `Deduct ₹${walletAmount || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
