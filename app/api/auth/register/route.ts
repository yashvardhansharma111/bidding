import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { registerSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { createOrder } from "@/lib/payment/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);

    await connectDB();
    const { name, email, password, phone } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) return apiError("Email already registered", 409);

    // Remove unverified duplicate if retrying
    if (existing && !existing.isVerified) {
      await User.deleteOne({ _id: existing._id });
    }

    const user = await User.create({ name, email, password, phone, isVerified: false, walletBalance: 0 });

    const razorpayOrder = await createOrder(50000, `reg_${user._id}`); // ₹500 = 50000 paise

    return apiSuccess(
      {
        userId: user._id.toString(),
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: 500,
        name,
        email,
      },
      "Account created. Complete payment to activate.",
      201
    );
  } catch (err) {
    console.error("[register]", err);
    return apiError("Internal server error", 500);
  }
}
