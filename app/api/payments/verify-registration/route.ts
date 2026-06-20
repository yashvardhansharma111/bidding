import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!userId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return apiError("Missing payment details", 400);
    }

    const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) return apiError("Invalid payment signature", 400);

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return apiError("User not found", 404);
    if (user.isVerified) return apiError("Account already verified", 409);

    user.isVerified = true;
    user.walletBalance = 500;
    await user.save();

    await WalletTransaction.create({
      user: user._id,
      type: "registration_credit",
      amount: 500,
      balanceAfter: 500,
      description: "Registration fee refunded as wallet credit",
      ref: razorpayPaymentId,
    });

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    await setAuthCookie(token);

    return apiSuccess(
      { user: { _id: user._id, name: user.name, email: user.email, role: user.role, walletBalance: 500 } },
      "Account verified! ₹500 added to your wallet."
    );
  } catch (err) {
    console.error("[verify-registration]", err);
    return apiError("Internal server error", 500);
  }
}
