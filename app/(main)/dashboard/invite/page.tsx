"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Gift, Copy, Check, Users, IndianRupee } from "lucide-react";

export default function InvitePage() {
  const [referralCode, setReferralCode] = useState("");
  const [bonusBalance, setBonusBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get("/api/wallet").then(({ data }) => {
      setReferralCode(data.data.referralCode ?? "");
      setBonusBalance(data.data.bonusBalance ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Gift size={24} className="text-yellow-300" />
          <h1 className="text-xl font-bold">Invite & Earn</h1>
        </div>
        <p className="text-purple-200 text-sm leading-relaxed">
          Invite friends to CashBid and both of you earn <span className="text-yellow-300 font-bold">₹200 bonus</span> when they register with your code.
        </p>
        <div className="mt-4 bg-white/10 rounded-xl p-4">
          <p className="text-purple-200 text-xs mb-1 font-medium">YOUR BONUS BALANCE</p>
          <p className="text-3xl font-black text-yellow-300">₹{bonusBalance.toLocaleString("en-IN")}</p>
          <p className="text-purple-300 text-xs mt-1">Redeemable when purchasing a won device</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">How it works</h2>
        <div className="space-y-3">
          {[
            { icon: Copy,         label: "Share your invite link",       desc: "Copy and share with friends on WhatsApp, Instagram, etc." },
            { icon: Users,        label: "Friend registers",              desc: "They sign up using your referral code — it's free!" },
            { icon: IndianRupee, label: "Both earn ₹200 bonus",          desc: "You and your friend each get ₹200 in bonus balance instantly." },
            { icon: Gift,         label: "Use at purchase",              desc: "Apply bonus balance when paying for a won auction device." },
          ].map(({ icon: Icon, label, desc }, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-bold text-gray-900">Your Invite Link</h2>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1 font-medium">Referral Code</p>
          <p className="text-lg font-mono font-bold text-purple-700 tracking-widest">{referralCode || "—"}</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 outline-none bg-gray-50 truncate"
          />
          <button
            onClick={copyCode}
            className={`flex items-center gap-1.5 font-semibold text-sm px-4 py-2.5 rounded-lg transition-all shrink-0 ${
              copied
                ? "bg-green-500 text-white"
                : "bg-[#2874F0] text-white hover:bg-blue-700"
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Join CashBid — India's mobile auction platform! Register free and we both get ₹200 bonus. Use my code: ${referralCode}\n${inviteLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            WhatsApp
          </a>
          <button
            onClick={copyCode}
            className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-lg hover:border-purple-400 transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
