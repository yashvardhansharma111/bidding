"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, UserPlus, Wallet } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RegisterPage() {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create user + get Razorpay order
      const { data } = await axios.post("/api/auth/register", form);
      const { userId, razorpayOrderId, razorpayKeyId, name, email } = data.data;

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Check internet connection.");
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: 50000, // ₹500 in paise
        currency: "INR",
        name: "BidKart",
        description: "Account Activation Fee",
        order_id: razorpayOrderId,
        prefill: { name, email },
        theme: { color: "#2874F0" },
        handler: async (response: any) => {
          try {
            // Step 4: Verify payment server-side
            const { data: verifyData } = await axios.post("/api/payments/verify-registration", {
              userId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setUser(verifyData.data.user);
            toast.success("Account activated! ₹500 added to your wallet.");
            router.push("/");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled. Your account is not yet activated.", { icon: "⚠️" });
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-gray-500 text-sm mb-2">Join BidKart and start winning</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
        <Wallet size={18} className="text-[#2874F0] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#2874F0]">One-time ₹500 activation fee</p>
          <p className="text-xs text-gray-600 mt-0.5">Paid via Razorpay (test mode — use any test card). ₹500 is credited back to your wallet instantly.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "phone", label: "Phone (optional)", type: "tel", placeholder: "+91 9876543210" },
        ].map(({ name, label, type, placeholder }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={form[name as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              required={name !== "phone"}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors"
              placeholder={placeholder}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors pr-12"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <UserPlus size={18} />
          )}
          {loading ? "Opening payment..." : "Register & Pay ₹500"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-3">
        Sandbox mode: Use card <strong>4111 1111 1111 1111</strong>, any CVV & future expiry
      </p>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2874F0] font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}
