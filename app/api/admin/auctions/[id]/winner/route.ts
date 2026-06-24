import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import Bid from "@/lib/db/models/Bid";
import Order from "@/lib/db/models/Order";
import Notification from "@/lib/db/models/Notification";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { winnerId } = await req.json();
    if (!winnerId) return apiError("Winner user ID is required", 400);

    await connectDB();
    const auction = await Auction.findById(id);
    if (!auction) return apiError("Auction not found", 404);
    if (auction.status === "cancelled") return apiError("Cannot set winner on cancelled auction", 400);

    // Find the winning bid amount for this user
    const winnerBid = await Bid.findOne({ auction: id, bidder: winnerId })
      .sort({ amount: -1 })
      .lean();

    const devicePrice = winnerBid?.amount ?? auction.currentBid;
    // Winner already paid ₹100 for the winning bid — deduct from final price
    const finalAmount = Math.max(0, devicePrice - 100);

    // Remove existing order if re-assigning
    await Order.deleteOne({ auction: id });

    await Order.create({
      auction: id,
      winner: winnerId,
      finalAmount,
      deliveryCharges: auction.deliveryCharges,
      totalAmount: finalAmount + auction.deliveryCharges,
      status: "pending_payment",
    });

    auction.winner = winnerId as any;
    auction.status = "ended";
    await auction.save();

    await Notification.create({
      user: winnerId,
      type: "won",
      title: "Congratulations! You won!",
      message: `You have been selected as the winner of "${auction.title}". Please complete your payment.`,
      data: { auctionId: id },
    });

    const io = (global as any).io;
    if (io) {
      io.to(`auction:${id}`).emit("auction_end", {
        auctionId: id,
        winner: { _id: winnerId },
        finalBid: finalAmount,
      });
      io.to(`user:${winnerId}`).emit("auction_won", { auctionId: id, title: auction.title });
    }

    return apiSuccess({}, "Winner assigned successfully");
  } catch (err) {
    console.error("[admin winner]", err);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
