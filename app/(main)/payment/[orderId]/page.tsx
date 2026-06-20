"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils/formatters";
import { CreditCard, Smartphone, Globe, CheckCircle, XCircle, Shield, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface OrderDetail {
  _id: string;
  finalAmount: number;
  deliveryCharges: number;
  totalAmount: number;
  status: string;
  auction: {
    title: string;
    brand: string;
    model: string;
    images: string[];
  };
}

type PaymentMethod = "upi" | "card" | "netbanking";
type PaymentState = "idle" | "processing" | "success" | "failed";

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [failReason, setFailReason] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    axios.get(`/api/user/dashboard`).then(({ data }) => {
      const found = data.data.orders?.find((o: any) => o._id === orderId);
      if (found) setOrder(found);
    }).finally(() => setLoading(false));
  }, [orderId, isAuthenticated, router]);

  const handlePay = async () => {
    if (!order) return;
    setPaymentState("processing");
    try {
      await axios.post("/api/payment", { method, orderId: order._id });
      setPaymentState("success");
      setTimeout(() => router.push("/dashboard/orders"), 3000);
    } catch (err: any) {
      setFailReason(err.response?.data?.error || "Payment failed");
      setPaymentState("failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => router.back()} className="mt-4 text-[#2874F0] hover:underline">Go back</button>
      </div>
    );
  }

  if (order.status === "paid" || order.status === "shipped" || order.status === "delivered") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Already Paid!</h2>
        <p className="text-gray-500 mb-4">This order has been paid and is being processed.</p>
        <button onClick={() => router.push("/dashboard/orders")} className="bg-[#2874F0] text-white px-6 py-2.5 rounded-lg font-semibold">View Orders</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h1>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">Order Summary</h2>
        <div className="flex gap-4 items-center">
          {order.auction.images?.[0] && (
            <img src={order.auction.images[0]} alt={order.auction.title} className="w-16 h-16 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1 shrink-0" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{order.auction.title}</p>
            <p className="text-sm text-gray-400">{order.auction.brand} {order.auction.model}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Winning Bid</span>
            <span className="font-medium">{formatCurrency(order.finalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery</span>
            <span className="font-medium">{order.deliveryCharges === 0 ? "Free" : formatCurrency(order.deliveryCharges)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
            <span>Total Amount</span>
            <span className="text-[#2874F0]">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Payment method selection */}
      <AnimatePresence mode="wait">
        {paymentState === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
              <h2 className="font-semibold text-gray-900 mb-4">Select Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: "upi" as PaymentMethod, icon: Smartphone, label: "UPI", sub: "PhonePe, GPay, Paytm, BHIM" },
                  { id: "card" as PaymentMethod, icon: CreditCard, label: "Credit / Debit Card", sub: "Visa, Mastercard, Rupay" },
                  { id: "netbanking" as PaymentMethod, icon: Globe, label: "Net Banking", sub: "All major banks supported" },
                ].map(({ id, icon: Icon, label, sub }) => (
                  <label key={id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${method === id ? "border-[#2874F0] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="hidden" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === id ? "bg-[#2874F0] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === id ? "border-[#2874F0]" : "border-gray-300"}`}>
                      {method === id && <div className="w-2.5 h-2.5 rounded-full bg-[#2874F0]" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full bg-[#2874F0] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base"
            >
              <Shield size={18} />
              Pay {formatCurrency(order.totalAmount)} Securely
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 This is a demo payment. No real money is charged.
            </p>
          </motion.div>
        )}

        {paymentState === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 border-4 border-[#2874F0] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="font-bold text-gray-900 text-lg mb-2">Processing Payment...</p>
            <p className="text-gray-400 text-sm">Please wait. Do not close this page.</p>
          </motion.div>
        )}

        {paymentState === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="font-bold text-gray-900 text-xl mb-2">Payment Successful!</h2>
            <p className="text-gray-500 text-sm">Your order has been confirmed. We&apos;ll send you shipping details soon.</p>
            <p className="text-gray-400 text-xs mt-4">Redirecting to your orders...</p>
          </motion.div>
        )}

        {paymentState === "failed" && (
          <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl border border-red-200 shadow-sm p-10 text-center">
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-bold text-gray-900 text-xl mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{failReason}</p>
            <button onClick={() => setPaymentState("idle")} className="bg-[#2874F0] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700">Try Again</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
