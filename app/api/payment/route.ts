import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Payment from "@/lib/db/models/Payment";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { paymentService } from "@/lib/payment/paymentService";
import { paymentSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);

    await connectDB();
    const order = await Order.findById(parsed.data.orderId).populate("auction");
    if (!order) return apiError("Order not found", 404);
    if (order.winner.toString() !== user._id.toString()) return apiError("Forbidden", 403);
    if (order.status !== "pending_payment" && order.status !== "won") {
      return apiError("Payment already processed", 400);
    }

    const payment = await Payment.create({
      order: order._id,
      user: user._id,
      auction: order.auction,
      amount: order.totalAmount,
      method: parsed.data.method,
      status: "processing",
    });

    const result = await paymentService.processPayment({
      amount: order.totalAmount,
      method: parsed.data.method,
      orderId: order._id.toString(),
      userId: user._id.toString(),
      auctionId: order.auction.toString(),
    });

    if (result.success) {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "success",
        transactionId: result.transactionId,
      });
      await Order.findByIdAndUpdate(order._id, { status: "paid", payment: payment._id });
      return apiSuccess({ transactionId: result.transactionId, status: "success" }, "Payment successful");
    } else {
      await Payment.findByIdAndUpdate(payment._id, {
        status: "failed",
        failureReason: result.failureReason,
      });
      return apiError(result.failureReason || "Payment failed", 402);
    }
  } catch (err) {
    console.error("[POST /payment]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
