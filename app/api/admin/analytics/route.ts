import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import User from "@/lib/db/models/User";
import Order from "@/lib/db/models/Order";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [
      totalAuctions,
      liveAuctions,
      upcomingAuctions,
      endedAuctions,
      totalUsers,
      revenueResult,
      pendingPayments,
      recentAuctions,
    ] = await Promise.all([
      Auction.countDocuments(),
      Auction.countDocuments({ status: "live" }),
      Auction.countDocuments({ status: "upcoming" }),
      Auction.countDocuments({ status: "ended" }),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ status: "pending_payment" }),
      Auction.find().sort({ createdAt: -1 }).limit(5).select("title status currentBid endTime brand").lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return apiSuccess({
      totalAuctions,
      liveAuctions,
      upcomingAuctions,
      endedAuctions,
      totalUsers,
      totalRevenue,
      pendingPayments,
      recentAuctions,
    });
  } catch (err) {
    console.error("[admin analytics]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
