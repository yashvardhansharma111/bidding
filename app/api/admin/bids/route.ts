import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Bid from "@/lib/db/models/Bid";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const auctionId = searchParams.get("auctionId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: Record<string, unknown> = {};
    if (auctionId) filter.auction = auctionId;

    const [bids, total] = await Promise.all([
      Bid.find(filter)
        .populate("bidder", "name email walletBalance")
        .populate("auction", "title brand status currentBid endTime")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Bid.countDocuments(filter),
    ]);

    return apiSuccess({ bids, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin bids]", err);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
