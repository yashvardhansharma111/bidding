import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { amount, type, description } = await req.json();

    if (!amount || !["admin_credit", "admin_debit"].includes(type)) {
      return apiError("Invalid request", 400);
    }

    await connectDB();
    const user = await User.findById(id);
    if (!user) return apiError("User not found", 404);

    const delta = type === "admin_credit" ? amount : -amount;
    const newBalance = user.walletBalance + delta;
    if (newBalance < 0) return apiError("Insufficient wallet balance", 400);

    user.walletBalance = newBalance;
    await user.save();

    await WalletTransaction.create({
      user: id,
      type,
      amount,
      balanceAfter: newBalance,
      description: description || (type === "admin_credit" ? "Admin credit" : "Admin debit"),
    });

    return apiSuccess({ walletBalance: newBalance }, `Wallet ${type === "admin_credit" ? "credited" : "debited"} by ₹${amount}`);
  } catch (err) {
    console.error("[admin wallet]", err);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
