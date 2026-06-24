"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, UserPlus, Gift } from "lucide-react";

function RegisterForm() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", referralCode: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setForm((f) => ({ ...f, referralCode: ref.toUpperCase() }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number");
      return;
    }

    setLoading(true);
    const result = await register(
      form.name.trim(),
      form.email.trim().toLowerCase(),
      form.password,
      form.phone.trim() || undefined,
      form.referralCode.trim() || undefined
    );
    if (result && !result.success) {
      setError(result.error ?? "Registration failed");
    }
    setLoading(false);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-gray-500 text-sm mb-6">Join CashBid free — no fees, just bid and win</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors"
            placeholder="+91 9876543210"
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referral Code <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
              <Gift size={15} />
            </span>
            <input
              type="text"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
              className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors font-mono tracking-widest uppercase"
              placeholder="e.g. A3F9B2C1"
              maxLength={8}
            />
          </div>
          {form.referralCode.length > 0 && (
            <p className="text-xs text-purple-600 mt-1 font-medium">Both you and your friend earn ₹200 bonus!</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2874F0] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={18} />}
          {loading ? "Creating account…" : "Create Free Account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2874F0] font-semibold hover:underline">Sign in</Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
