import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Payment from "@/lib/db/models/Payment";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  method: z.enum(["upi", "card", "netbanking"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Invalid payload", 400);

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, method } = parsed.data;

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return apiError("Payment verification failed", 400);

    await connectDB();
    const order = await Order.findById(orderId).populate("auction");
    if (!order) return apiError("Order not found", 404);
    if (order.winner.toString() !== user._id.toString()) return apiError("Forbidden", 403);
    if (order.status !== "pending_payment" && order.status !== "won") {
      return apiError("Payment already processed", 400);
    }

    const payment = await Payment.create({
      order: order._id,
      user: user._id,
      auction: (order.auction as any)?._id ?? order.auction,
      amount: order.totalAmount,
      method,
      status: "success",
      razorpayOrderId,
      razorpayPaymentId,
      transactionId: razorpayPaymentId,
    });

    await Order.findByIdAndUpdate(orderId, { status: "paid", payment: payment._id });

    return apiSuccess({ transactionId: razorpayPaymentId }, "Payment successful");
  } catch (err: any) {
    console.error("[payment/verify]", err);
    if (err?.message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
