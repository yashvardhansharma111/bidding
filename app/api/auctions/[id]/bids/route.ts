import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import Bid from "@/lib/db/models/Bid";
import Notification from "@/lib/db/models/Notification";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { bidSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const bids = await Bid.find({ auction: id })
      .populate("bidder", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return apiSuccess({ bids });
  } catch (err) {
    console.error("[GET /auctions/:id/bids]", err);
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const parsed = bidSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Validation error", 422);

    await connectDB();

    // Check wallet eligibility
    const bidder = await User.findById(user._id).select("isVerified walletBalance").lean();
    if (!bidder?.isVerified) return apiError("Complete account verification (₹500 registration fee) to bid", 403);
    if ((bidder.walletBalance ?? 0) < 100) return apiError("Insufficient wallet balance. Please top up your wallet.", 403);

    const auction = await Auction.findById(id);
    if (!auction) return apiError("Auction not found", 404);
    if (auction.status !== "live") return apiError("Auction is not live", 400);
    if (new Date() > auction.endTime) return apiError("Auction has ended", 400);

    const { amount } = parsed.data;
    const minRequired = auction.currentBid + auction.minIncrement;
    if (amount < minRequired) {
      return apiError(`Bid must be at least ₹${minRequired}`, 400);
    }

    // Get previous highest bidder for outbid notification
    const previousTopBid = await Bid.findOne({ auction: id })
      .sort({ amount: -1 })
      .select("bidder")
      .lean();

    const bid = await Bid.create({
      auction: id,
      bidder: user._id,
      amount,
      isAutoBid: parsed.data.isAutoBid,
      maxAutoBid: parsed.data.maxAutoBid,
    });

    // Check if this is a new unique bidder
    const existingBidFromUser = await Bid.countDocuments({ auction: id, bidder: user._id });
    const isNewBidder = existingBidFromUser === 1;

    await Auction.findByIdAndUpdate(id, {
      $set: { currentBid: amount },
      $inc: {
        totalBids: 1,
        totalBidders: isNewBidder ? 1 : 0,
      },
    });

    // Send outbid notification to previous top bidder
    if (previousTopBid && previousTopBid.bidder.toString() !== user._id.toString()) {
      await Notification.create({
        user: previousTopBid.bidder,
        type: "outbid",
        title: "You've been outbid!",
        message: `Someone placed a higher bid of ₹${amount.toLocaleString("en-IN")} on an auction you're watching.`,
        data: { auctionId: id, newBid: amount },
      });
    }

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`auction:${id}`).emit("bid_update", {
        auctionId: id,
        newBid: amount,
        bidder: { _id: user._id, name: user.name },
        totalBids: auction.totalBids + 1,
        totalBidders: auction.totalBidders + (isNewBidder ? 1 : 0),
        timestamp: new Date().toISOString(),
      });

      // Notify previous bidder of outbid
      if (previousTopBid && previousTopBid.bidder.toString() !== user._id.toString()) {
        io.to(`user:${previousTopBid.bidder}`).emit("outbid_notification", {
          auctionId: id,
          newBid: amount,
        });
      }
    }

    return apiSuccess({ bid }, "Bid placed successfully", 201);
  } catch (err) {
    console.error("[POST /auctions/:id/bids]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
