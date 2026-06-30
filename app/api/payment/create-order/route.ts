import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { createOrder } from "@/lib/payment/razorpay";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Invalid request", 400);

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
      return apiError("Payment gateway not configured", 500);
    }

    await connectDB();
    const order = await Order.findById(parsed.data.orderId);
    if (!order) return apiError("Order not found", 404);
    if (order.winner.toString() !== user._id.toString()) return apiError("Forbidden", 403);
    if (order.status !== "pending_payment" && order.status !== "won") {
      return apiError("Payment already processed", 400);
    }

    const receipt = `ord_${order._id.toString().slice(-8)}_${Math.floor(Date.now() / 1000)}`;
    const rzpOrder = await createOrder(Math.round(order.totalAmount * 100), receipt);

    return apiSuccess({ razorpayOrderId: rzpOrder.id, keyId, amount: order.totalAmount });
  } catch (err: any) {
    console.error("[payment/create-order]", err);
    if (err?.message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError(err?.error?.description || err?.message || "Failed to create payment", 500);
  }
}
