import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WithdrawalRequest from "@/lib/db/models/WithdrawalRequest";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";

const schema = z.object({
  amount: z.number().min(100, "Minimum withdrawal is ₹100"),
  upiId: z.string().min(3, "UPI ID is required"),
});

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();
    const requests = await WithdrawalRequest.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return apiSuccess({ requests });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 400);

    await connectDB();
    const { amount, upiId } = parsed.data;

    const dbUser = await User.findById(user._id).select("walletBalance").lean();
    if (!dbUser) return apiError("User not found", 404);
    if ((dbUser.walletBalance ?? 0) < amount) return apiError("Insufficient wallet balance", 400);

    // Check no pending withdrawal exists
    const pending = await WithdrawalRequest.findOne({ user: user._id, status: "pending" });
    if (pending) return apiError("You already have a pending withdrawal request", 400);

    // Hold the amount (deduct immediately, refund if rejected)
    const newBalance = (dbUser.walletBalance ?? 0) - amount;
    await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: -amount } });

    const withdrawal = await WithdrawalRequest.create({ user: user._id, amount, upiId });

    await WalletTransaction.create({
      user: user._id,
      type: "withdrawal",
      amount,
      balanceAfter: newBalance,
      description: `Withdrawal request — ₹${amount.toLocaleString("en-IN")} to ${upiId}`,
      ref: withdrawal._id.toString(),
    });

    return apiSuccess({ withdrawal }, "Withdrawal request submitted. Admin will process within 24 hours.", 201);
  } catch (err) {
    console.error("[wallet withdraw]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
