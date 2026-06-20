import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id);
    if (!user) return apiError("User not found", 404);
    if (user.role === "admin") return apiError("Cannot ban an admin", 400);

    user.isBanned = !user.isBanned;
    await user.save();

    return apiSuccess(
      { isBanned: user.isBanned },
      user.isBanned ? "User banned" : "User unbanned"
    );
  } catch (err) {
    console.error("[ban user]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
