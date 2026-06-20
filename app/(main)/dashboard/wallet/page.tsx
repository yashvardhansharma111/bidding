"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

const TX_ICONS: Record<string, { icon: typeof Wallet; color: string; sign: string }> = {
  registration_credit: { icon: ArrowDownCircle, color: "text-green-500", sign: "+" },
  admin_credit:        { icon: ArrowDownCircle, color: "text-green-500", sign: "+" },
  admin_debit:         { icon: ArrowUpCircle,   color: "text-red-500",   sign: "-" },
  bid_hold:            { icon: ArrowUpCircle,   color: "text-orange-500",sign: "-" },
  bid_refund:          { icon: ArrowDownCircle, color: "text-blue-500",  sign: "+" },
  auction_won_debit:   { icon: ArrowUpCircle,   color: "text-red-500",   sign: "-" },
};

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/wallet").then(({ data }) => {
      setBalance(data.data.balance);
      setTransactions(data.data.transactions);
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-gradient-to-r from-[#2874F0] to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={24} className="text-[#FFE500]" />
          <span className="font-semibold text-blue-200">BidKart Wallet</span>
        </div>
        <p className="text-4xl font-bold">{balance !== null ? fmt(balance) : "—"}</p>
        <p className="text-blue-200 text-sm mt-1">Available balance</p>
        <p className="text-blue-300 text-xs mt-3">Minimum ₹100 required to place bids</p>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock size={32} className="mx-auto mb-2 opacity-40" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const meta = TX_ICONS[tx.type] ?? { icon: Wallet, color: "text-gray-400", sign: "" };
              const Icon = meta.icon;
              const isCredit = meta.sign === "+";
              return (
                <div key={tx._id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCredit ? "bg-green-50" : "bg-red-50"}`}>
                    <Icon size={18} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-red-600"}`}>
                      {meta.sign}{fmt(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">Bal: {fmt(tx.balanceAfter)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
