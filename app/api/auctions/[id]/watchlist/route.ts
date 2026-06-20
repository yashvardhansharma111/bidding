import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Watchlist from "@/lib/db/models/Watchlist";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await connectDB();

    const existing = await Watchlist.findOne({ user: user._id, auction: id });
    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
      return apiSuccess({ watching: false }, "Removed from watchlist");
    }

    await Watchlist.create({ user: user._id, auction: id });
    return apiSuccess({ watching: true }, "Added to watchlist");
  } catch (err) {
    console.error("[watchlist toggle]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await connectDB();
    const item = await Watchlist.findOne({ user: user._id, auction: id });
    return apiSuccess({ watching: !!item });
  } catch (err) {
    console.error("[GET watchlist]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
