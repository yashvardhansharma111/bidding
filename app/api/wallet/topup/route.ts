import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { createOrder } from "@/lib/payment/razorpay";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const ALLOWED_AMOUNTS = [100, 500, 1000];

const schema = z.object({
  amount: z.number().refine((v) => ALLOWED_AMOUNTS.includes(v), {
    message: "Amount must be ₹100, ₹500, or ₹1000",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid amount", 400);

    await connectDB();

    const order = await createOrder(
      parsed.data.amount * 100,
      `topup_${user._id}_${Date.now()}`
    );

    return apiSuccess({
      orderId: order.id,
      amount: parsed.data.amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[wallet topup]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
