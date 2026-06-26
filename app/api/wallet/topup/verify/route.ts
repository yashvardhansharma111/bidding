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
  console.log("[wallet/topup/verify] Request received");
  try {
    const user = await requireAuth();
    console.log("[wallet/topup/verify] Auth OK — userId:", user._id.toString());

    const body = await req.json();
    console.log("[wallet/topup/verify] Payload:", { ...body, razorpaySignature: "***" });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error("[wallet/topup/verify] Validation failed:", parsed.error.issues);
      return apiError("Invalid payload", 400);
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = parsed.data;

    const keySecretPresent = !!process.env.RAZORPAY_KEY_SECRET;
    console.log("[wallet/topup/verify] RAZORPAY_KEY_SECRET present:", keySecretPresent);

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    console.log("[wallet/topup/verify] Signature valid:", isValid);
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

    console.log("[wallet/topup/verify] Wallet updated — new balance:", updated?.walletBalance);
    return apiSuccess({ newBalance: updated?.walletBalance ?? 0 }, "Wallet topped up successfully");
  } catch (err) {
    console.error("[wallet/topup/verify] ERROR:", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError((err as Error).message || "Internal server error", 500);
  }
}
