"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, Plus, Gift, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => { console.log("[razorpay] Script loaded"); resolve(true); };
    script.onerror = () => { console.error("[razorpay] Script failed to load"); resolve(false); };
    document.body.appendChild(script);
  });
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface WithdrawalRequest {
  _id: string;
  amount: number;
  upiId: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
}

const TX_ICONS: Record<string, { icon: typeof Wallet; color: string; sign: string }> = {
  registration_credit: { icon: ArrowDownCircle, color: "text-green-500",  sign: "+" },
  topup:               { icon: ArrowDownCircle, color: "text-green-500",  sign: "+" },
  admin_credit:        { icon: ArrowDownCircle, color: "text-green-500",  sign: "+" },
  admin_debit:         { icon: ArrowUpCircle,   color: "text-red-500",    sign: "-" },
  bid_hold:            { icon: ArrowUpCircle,   color: "text-orange-500", sign: "-" },
  bid_refund:          { icon: ArrowDownCircle, color: "text-blue-500",   sign: "+" },
  auction_won_debit:   { icon: ArrowUpCircle,   color: "text-red-500",    sign: "-" },
  referral_bonus:      { icon: Gift,            color: "text-purple-500", sign: "+" },
  withdrawal:          { icon: Send,            color: "text-red-500",    sign: "-" },
};

const TOPUP_OPTIONS = [
  { amount: 1,    bids: 0,  label: "₹1",    sublabel: "Test",    popular: false, test: true  },
  { amount: 100,  bids: 1,  label: "₹100",  sublabel: "1 Bid",   popular: false, test: false },
  { amount: 500,  bids: 5,  label: "₹500",  sublabel: "5 Bids",  popular: true,  test: false },
  { amount: 1000, bids: 10, label: "₹1000", sublabel: "10 Bids", popular: false, test: false },
];

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

export default function WalletPage() {
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [tab, setTab] = useState<"transactions" | "withdraw">("transactions");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const load = useCallback(() => {
    Promise.all([
      axios.get("/api/wallet"),
      axios.get("/api/wallet/withdraw"),
    ]).then(([walletRes, withdrawRes]) => {
      setBalance(walletRes.data.data.balance);
      setBonusBalance(walletRes.data.data.bonusBalance ?? 0);
      setTransactions(walletRes.data.data.transactions);
      setWithdrawals(withdrawRes.data.data.requests);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTopup = async (amount: number) => {
    console.log("[topup] Starting top-up for amount:", amount);
    setTopupLoading(true);
    try {
      // Dynamically load Razorpay if not already loaded
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        console.error("[topup] Razorpay script failed to load");
        alert("Payment SDK failed to load. Check your internet connection and try again.");
        return;
      }
      console.log("[topup] Razorpay SDK ready");

      console.log("[topup] Calling /api/wallet/topup...");
      const { data } = await axios.post("/api/wallet/topup", { amount });
      console.log("[topup] API response:", data);

      const { orderId, keyId } = data.data;
      console.log("[topup] Razorpay orderId:", orderId, "| keyId:", keyId ? `${keyId.slice(0, 8)}...` : "MISSING");

      if (!orderId) {
        console.error("[topup] orderId missing in API response");
        alert("Payment order creation failed. Check server logs.");
        return;
      }
      if (!keyId) {
        console.error("[topup] RAZORPAY_KEY_ID missing — check .env.local");
        alert("Payment config missing. Contact support.");
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: amount * 100,
        currency: "INR",
        name: "CashBid",
        description: "Wallet Top-up",
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          console.log("[topup] Payment success, verifying:", response.razorpay_payment_id);
          try {
            const verifyRes = await axios.post("/api/wallet/topup/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount,
            });
            console.log("[topup] Verify response:", verifyRes.data);
            await Promise.all([load(), refreshUser()]);
          } catch (verifyErr: any) {
            console.error("[topup] Verify failed:", verifyErr?.response?.data ?? verifyErr);
            alert("Payment received but verification failed. Contact support with payment ID: " + response.razorpay_payment_id);
          }
        },
        modal: {
          ondismiss: () => console.log("[topup] Razorpay modal dismissed by user"),
        },
        theme: { color: "#2874F0" },
      });
      rzp.open();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Unknown error";
      const status = err?.response?.status;
      console.error("[topup] Error initiating payment — status:", status, "| message:", msg);
      console.error("[topup] Full error response:", JSON.stringify(err?.response?.data ?? {}, null, 2));
      alert(`Payment failed: ${msg}${status ? ` (HTTP ${status})` : ""}\n\nCheck browser console + server logs for details.`);
    } finally {
      setTopupLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    const amt = Number(withdrawAmount);
    if (!amt || amt < 100) { setWithdrawError("Minimum withdrawal is ₹100"); return; }
    if (!upiId.trim()) { setWithdrawError("Enter your UPI ID"); return; }
    setWithdrawLoading(true);
    try {
      await axios.post("/api/wallet/withdraw", { amount: amt, upiId: upiId.trim() });
      setWithdrawAmount("");
      setUpiId("");
      load();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: string } } };
      setWithdrawError(axErr.response?.data?.error ?? "Failed to submit request");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const bidCount = Math.floor((balance ?? 0) / 100);

  return (
    <>
      <div className="space-y-4 px-3 sm:px-0">
        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-[#2874F0] to-blue-700 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Wallet size={22} className="text-[#FFE500]" />
              <span className="font-semibold text-blue-200 text-sm">Wallet Balance</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">{balance !== null ? fmt(balance) : "—"}</p>
            <p className="text-blue-200 text-sm mt-1">
              {bidCount} bid{bidCount !== 1 ? "s" : ""} available · ₹100 per bid
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Gift size={22} className="text-yellow-300" />
              <span className="font-semibold text-purple-200 text-sm">Bonus Balance</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">{fmt(bonusBalance)}</p>
            <p className="text-purple-200 text-sm mt-1">Redeemable at device purchase only</p>
          </div>
        </div>

        {/* Top-up section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={18} className="text-[#2874F0]" />
            <h2 className="font-bold text-gray-900">Top Up Wallet</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOPUP_OPTIONS.map(({ amount, label, sublabel, popular, test }) => (
              <button
                key={amount}
                onClick={() => handleTopup(amount)}
                disabled={topupLoading}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 py-3 sm:py-4 px-2 sm:px-3 transition-all hover:shadow-md disabled:opacity-60 ${
                  popular
                    ? "border-[#2874F0] bg-blue-50"
                    : test
                    ? "border-dashed border-gray-300 bg-gray-50 hover:border-gray-400"
                    : "border-gray-200 bg-white hover:border-[#2874F0]"
                }`}
              >
                {popular && (
                  <span className="absolute -top-2.5 bg-[#2874F0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    POPULAR
                  </span>
                )}
                {test && (
                  <span className="absolute -top-2.5 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    TEST
                  </span>
                )}
                <span className={`text-xl font-black ${test ? "text-gray-500" : "text-gray-900"}`}>{label}</span>
                <span className={`text-sm font-semibold mt-0.5 ${test ? "text-gray-400" : "text-[#2874F0]"}`}>{sublabel}</span>
                {!test && <span className="text-xs text-gray-400 mt-1">₹100 each</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs: transactions / withdraw */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex border-b border-gray-100">
            {(["transactions", "withdraw"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === t ? "text-[#2874F0] border-b-2 border-[#2874F0]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "transactions" ? "Transaction History" : "Withdraw"}
              </button>
            ))}
          </div>

          {tab === "transactions" && (
            <>
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
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-green-50" : "bg-red-50"}`}>
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
            </>
          )}

          {tab === "withdraw" && (
            <div className="p-5 space-y-5">
              {/* Request form */}
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min={100}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min ₹100"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">Available: {fmt(balance ?? 0)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors"
                  />
                </div>
                {withdrawError && <p className="text-red-500 text-sm">{withdrawError}</p>}
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {withdrawLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                  Request Withdrawal
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Bonus balance cannot be withdrawn. Withdrawals are processed within 24 hours.
                </p>
              </form>

              {/* Withdrawal history */}
              {withdrawals.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm mb-3">Withdrawal Requests</h3>
                  <div className="space-y-2">
                    {withdrawals.map((w) => (
                      <div key={w._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{fmt(w.amount)}</p>
                          <p className="text-xs text-gray-400">{w.upiId} · {fmtDate(w.createdAt)}</p>
                          {w.adminNote && <p className="text-xs text-gray-500 mt-0.5">{w.adminNote}</p>}
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          w.status === "pending"  ? "bg-yellow-100 text-yellow-700" :
                          w.status === "approved" ? "bg-green-100 text-green-700"  :
                          "bg-red-100 text-red-700"
                        }`}>
                          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
