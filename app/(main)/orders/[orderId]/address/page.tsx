"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import { MapPin, Phone, User, CheckCircle } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

export default function AddressPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    phone2: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, user, router]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/user/orders/${orderId}/address`, form);
      setDone(true);
      toast.success("Delivery address saved!");
      setTimeout(() => router.push(`/payment/${orderId}`), 1800);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2874F0] transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Address Saved!</h2>
        <p className="text-gray-500 text-sm">Redirecting to payment now…</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <MapPin size={20} className="text-[#2874F0]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Delivery Address</h1>
        </div>
        <p className="text-sm text-gray-500 ml-13">Enter where we should deliver your order.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
            <User size={14} /> Contact Details
          </h2>
          <div>
            <label className={labelCls}>Full Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Recipient's full name"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Phone Number 1 *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Phone Number 2 <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.phone2}
                  onChange={(e) => set("phone2", e.target.value.replace(/\D/g, ""))}
                  placeholder="Alternate number"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
            <MapPin size={14} /> Delivery Address
          </h2>
          <div>
            <label className={labelCls}>Address Line 1 *</label>
            <input
              required
              type="text"
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
              placeholder="House no., Building, Street"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.line2}
              onChange={(e) => set("line2", e.target.value)}
              placeholder="Area, Landmark"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>City *</label>
              <input
                required
                type="text"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="City"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Pincode *</label>
              <input
                required
                type="text"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit pincode"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>State *</label>
            <select
              required
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className={`${inputCls} bg-white`}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2874F0] text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <MapPin size={18} />
          )}
          {loading ? "Saving…" : "Save Delivery Address"}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/payment/${orderId}`)}
          className="w-full text-gray-400 text-sm text-center py-2 hover:text-gray-600 transition-colors"
        >
          Skip → Pay Now
        </button>
      </form>
    </div>
  );
}
