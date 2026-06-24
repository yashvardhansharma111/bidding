import { connectDB } from "@/lib/db/connect";
import WithdrawalRequest from "@/lib/db/models/WithdrawalRequest";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const requests = await WithdrawalRequest.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return apiSuccess({ requests });
  } catch (err) {
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
