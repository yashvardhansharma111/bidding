import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .select("auction winner finalAmount deliveryCharges totalAmount status awbCode courierName trackingUrl shippingAddress createdAt")
      .populate({ path: "winner", select: "name email phone" })
      .populate({ path: "auction", select: "title brand model images" })
      .lean();

    return apiSuccess(orders);
  } catch (err) {
    console.error("[admin/orders GET]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
