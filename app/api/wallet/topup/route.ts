import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { createOrder } from "@/lib/payment/razorpay";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const ALLOWED_AMOUNTS = [1, 100, 500, 1000];

const schema = z.object({
  amount: z.number().refine((v) => ALLOWED_AMOUNTS.includes(v), {
    message: "Amount must be ₹100, ₹500, or ₹1000",
  }),
});

export async function POST(req: NextRequest) {
  console.log("[wallet/topup] Request received");
  try {
    const user = await requireAuth();
    console.log("[wallet/topup] Auth OK — userId:", user._id.toString());

    const body = await req.json();
    console.log("[wallet/topup] Body:", body);

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error("[wallet/topup] Validation failed:", parsed.error.issues);
      return apiError(parsed.error.issues[0]?.message ?? "Invalid amount", 400);
    }

    // Check Razorpay env vars
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    console.log("[wallet/topup] RAZORPAY_KEY_ID present:", !!keyId, "| RAZORPAY_KEY_SECRET present:", !!keySecret);
    if (!keyId || !keySecret) {
      console.error("[wallet/topup] MISSING Razorpay env vars — check .env.local");
      return apiError("Payment gateway not configured", 500);
    }

    await connectDB();
    console.log("[wallet/topup] DB connected, creating Razorpay order for ₹", parsed.data.amount);

    const order = await createOrder(
      parsed.data.amount * 100,
      `topup_${user._id}_${Date.now()}`
    );
    console.log("[wallet/topup] Razorpay order created:", order.id, "| status:", order.status);

    return apiSuccess({
      orderId: order.id,
      amount: parsed.data.amount,
      currency: "INR",
      keyId,
    });
  } catch (err) {
    console.error("[wallet/topup] ERROR:", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError((err as Error).message || "Internal server error", 500);
  }
}
