import { connectDB } from "@/lib/db/connect";
import Notification from "@/lib/db/models/Notification";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();
    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    return apiSuccess({ notifications });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}

export async function PUT() {
  try {
    const user = await requireAuth();
    await connectDB();
    await Notification.updateMany({ user: user._id, isRead: false }, { $set: { isRead: true } });
    return apiSuccess(null, "All notifications marked as read");
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
