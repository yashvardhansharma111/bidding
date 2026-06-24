import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  amount: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError("Invalid payload", 400);

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = parsed.data;

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return apiError("Payment verification failed", 400);

    await connectDB();

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    ).select("walletBalance");

    await WalletTransaction.create({
      user: user._id,
      type: "topup",
      amount,
      balanceAfter: updated?.walletBalance ?? amount,
      description: `Wallet top-up — ₹${amount.toLocaleString("en-IN")} via Razorpay`,
      ref: razorpayPaymentId,
    });

    return apiSuccess({ newBalance: updated?.walletBalance ?? 0 }, "Wallet topped up successfully");
  } catch (err) {
    console.error("[wallet topup verify]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
