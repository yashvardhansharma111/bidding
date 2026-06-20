import { connectDB } from "@/lib/db/connect";
import Bid from "@/lib/db/models/Bid";
import Order from "@/lib/db/models/Order";
import Watchlist from "@/lib/db/models/Watchlist";
import Notification from "@/lib/db/models/Notification";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();

    const [activeBids, orders, watchlist, unreadNotifications] = await Promise.all([
      Bid.find({ bidder: user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "auction", select: "title images currentBid endTime status brand model" })
        .limit(10)
        .lean(),
      Order.find({ winner: user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "auction", select: "title images brand model" })
        .lean(),
      Watchlist.find({ user: user._id })
        .populate({ path: "auction", select: "title images currentBid endTime status brand model" })
        .lean(),
      Notification.countDocuments({ user: user._id, isRead: false }),
    ]);

    return apiSuccess({ activeBids, orders, watchlist, unreadNotifications });
  } catch (err) {
    console.error("[dashboard]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
