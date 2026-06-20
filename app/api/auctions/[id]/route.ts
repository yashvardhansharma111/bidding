import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Auction from "@/lib/db/models/Auction";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { syncAuctionStatuses } from "@/lib/db/syncAuctionStatuses";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    await syncAuctionStatuses();
    const auction = await Auction.findById(id)
      .populate("winner", "name email")
      .populate("createdBy", "name")
      .lean();
    if (!auction) return apiError("Auction not found", 404);
    return apiSuccess({ auction });
  } catch (err) {
    console.error("[GET /auctions/:id]", err);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const auction = await Auction.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!auction) return apiError("Auction not found", 404);

    return apiSuccess({ auction }, "Auction updated");
  } catch (err) {
    console.error("[PUT /auctions/:id]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    await Auction.findByIdAndDelete(id);
    return apiSuccess(null, "Auction deleted");
  } catch (err) {
    console.error("[DELETE /auctions/:id]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
