import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils/api";

const REFERRAL_BONUS = 200;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);

    await connectDB();
    const { name, email, password, phone, referralCode } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) return apiError("Email already registered", 409);

    // Validate referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!referrer) return apiError("Invalid referral code", 400);
    }

    const user = await User.create({
      name, email, password, phone,
      isVerified: true,
      walletBalance: 0,
      bonusBalance: referrer ? REFERRAL_BONUS : 0,
      referredBy: referrer?._id,
    });

    // Award bonus to both parties if referral used
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, { $inc: { bonusBalance: REFERRAL_BONUS } });

      await WalletTransaction.create({
        user: user._id,
        type: "referral_bonus",
        amount: REFERRAL_BONUS,
        balanceAfter: REFERRAL_BONUS,
        description: `Referral bonus — joined via ${referrer.name}'s invite`,
      });

      await WalletTransaction.create({
        user: referrer._id,
        type: "referral_bonus",
        amount: REFERRAL_BONUS,
        balanceAfter: (referrer.bonusBalance ?? 0) + REFERRAL_BONUS,
        description: `Referral bonus — ${name} joined using your code`,
      });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    await setAuthCookie(token);

    return apiSuccess(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: 0,
          bonusBalance: user.bonusBalance,
          referralCode: user.referralCode,
          isVerified: true,
        },
      },
      "Registration successful",
      201
    );
  } catch (err) {
    console.error("[register]", err);
    return apiError("Internal server error", 500);
  }
}
