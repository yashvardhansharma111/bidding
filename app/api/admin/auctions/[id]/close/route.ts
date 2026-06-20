import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import Bid from "@/lib/db/models/Bid";
import Order from "@/lib/db/models/Order";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();

    const auction = await Auction.findById(id);
    if (!auction) return apiError("Auction not found", 404);
    if (auction.status === "ended") return apiError("Auction already ended", 400);

    const topBid = await Bid.findOne({ auction: id }).sort({ amount: -1 }).populate("bidder");
    if (topBid) {
      auction.winner = topBid.bidder._id;
      await Order.create({
        auction: id,
        winner: topBid.bidder._id,
        finalAmount: topBid.amount,
        deliveryCharges: auction.deliveryCharges,
        totalAmount: topBid.amount + auction.deliveryCharges,
        status: "pending_payment",
      });
    }

    auction.status = "ended";
    await auction.save();

    const io = (global as any).io;
    if (io) {
      io.to(`auction:${id}`).emit("auction_end", {
        auctionId: id,
        winner: topBid ? { _id: topBid.bidder._id, name: (topBid.bidder as any).name } : null,
        finalBid: topBid?.amount || 0,
      });
    }

    return apiSuccess({ auction }, "Auction closed");
  } catch (err) {
    console.error("[close auction]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
