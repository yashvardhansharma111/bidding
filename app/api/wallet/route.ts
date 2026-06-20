import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import WalletTransaction from "@/lib/db/models/WalletTransaction";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const me = await requireAuth();
    await connectDB();

    const [user, transactions] = await Promise.all([
      User.findById(me._id).select("walletBalance isVerified").lean(),
      WalletTransaction.find({ user: me._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    return apiSuccess({ balance: user?.walletBalance ?? 0, transactions });
  } catch (err) {
    console.error("[wallet]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
