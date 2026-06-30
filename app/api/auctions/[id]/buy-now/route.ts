import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import Order from "@/lib/db/models/Order";
import Notification from "@/lib/db/models/Notification";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await connectDB();

    const auction = await Auction.findById(id);
    if (!auction) return apiError("Auction not found", 404);

    // Only bulk/refurbished auctions support buy-now
    const isBuyNowType =
      auction.category === "bulk" || auction.condition === "refurbished";
    if (!isBuyNowType) return apiError("This auction does not support Buy Now", 400);

    if (auction.status !== "live") return apiError("Auction is not live", 400);

    const price = auction.buyNowPrice ?? auction.baseBidPrice;
    if (!price || price <= 0) return apiError("No price set for this auction", 400);

    // Prevent same user from buying this listing again
    const existing = await Order.findOne({ auction: id, winner: user._id });
    if (existing) return apiError("You have already purchased this item", 400);

    // Create order
    const order = await Order.create({
      auction: id,
      winner: user._id,
      finalAmount: price,
      deliveryCharges: auction.deliveryCharges ?? 0,
      totalAmount: price + (auction.deliveryCharges ?? 0),
      status: "pending_payment",
    });

    // Notify user
    await Notification.create({
      user: user._id,
      type: "won",
      title: "Purchase Confirmed!",
      message: `You purchased "${auction.title}" for ₹${price.toLocaleString("en-IN")}. Please complete your payment.`,
      data: { auctionId: id },
    });

    console.log(`[buy-now] User ${user._id} purchased auction ${id} at ₹${price}`);

    return apiSuccess({ orderId: order._id.toString() }, "Purchase successful");
  } catch (err) {
    console.error("[buy-now]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
