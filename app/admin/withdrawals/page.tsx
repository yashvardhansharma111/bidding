"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Send, CheckCircle, XCircle, Clock } from "lucide-react";

interface Withdrawal {
  _id: string;
  user: { _id: string; name: string; email: string };
  amount: number;
  upiId: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(() => {
    axios.get("/api/admin/withdrawals")
      .then(({ data }) => setWithdrawals(data.data.requests))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await axios.post(`/api/admin/withdrawals/${id}`, { action, adminNote: adminNote.trim() || undefined });
      setNoteModal(null);
      setAdminNote("");
      load();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: string } } };
      alert(axErr.response?.data?.error ?? "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  const pending = withdrawals.filter((w) => w.status === "pending");
  const processed = withdrawals.filter((w) => w.status !== "pending");

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Send size={22} className="text-[#2874F0]" />
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        {pending.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{pending.length} pending</span>
        )}
      </div>

      {/* Pending */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Pending Approvals</h2>
        </div>
        {pending.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Clock size={28} className="mx-auto mb-2 opacity-40" />
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((w) => (
              <div key={w._id} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{w.user?.name}</p>
                  <p className="text-sm text-gray-500">{w.user?.email}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-bold text-green-600">{fmt(w.amount)}</span> → <span className="font-mono text-gray-600">{w.upiId}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(w.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setNoteModal({ id: w._id, action: "approve" })}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={() => setNoteModal({ id: w._id, action: "reject" })}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Processed</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {processed.map((w) => (
              <div key={w._id} className="flex items-center gap-4 px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{w.user?.name} · <span className="text-gray-500 text-sm">{w.user?.email}</span></p>
                  <p className="text-sm text-gray-600">{fmt(w.amount)} → {w.upiId}</p>
                  {w.adminNote && <p className="text-xs text-gray-500 mt-0.5">Note: {w.adminNote}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(w.createdAt)}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                  w.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-gray-900">
              {noteModal.action === "approve" ? "Approve" : "Reject"} Withdrawal
            </h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Optional admin note (shown to user)"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2874F0] resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setNoteModal(null); setAdminNote(""); }}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(noteModal.id, noteModal.action)}
                disabled={actionLoading !== null}
                className={`flex-1 text-white font-bold py-2.5 rounded-lg disabled:opacity-60 ${
                  noteModal.action === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading ? "Processing…" : noteModal.action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
