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
  } catch (err: any) {
    // Razorpay SDK throws non-standard error objects — log everything
    console.error("[wallet/topup] ERROR type:", typeof err);
    console.error("[wallet/topup] ERROR keys:", err && typeof err === "object" ? Object.keys(err) : "N/A");
    console.error("[wallet/topup] ERROR message:", err?.message);
    console.error("[wallet/topup] ERROR error:", JSON.stringify(err?.error ?? err, null, 2));

    if (err?.message === "Unauthorized") return apiError("Unauthorized", 401);

    // Razorpay SDK wraps API errors in err.error
    const razorpayDesc =
      err?.error?.description ||
      err?.error?.error?.description ||
      err?.error?.message;

    const finalMsg = razorpayDesc || err?.message || JSON.stringify(err) || "Unknown error";
    console.error("[wallet/topup] Returning error to client:", finalMsg);
    return apiError(finalMsg, 500);
  }
}
