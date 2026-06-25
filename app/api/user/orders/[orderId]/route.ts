import { requireAuth } from "@/lib/auth/getCurrentUser";
import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orderId } = await params;
    await connectDB();
    const order = await Order.findOne({ _id: orderId, winner: user._id })
      .select("auction finalAmount deliveryCharges totalAmount status")
      .populate({ path: "auction", select: "title brand model images" })
      .lean();
    if (!order) return apiError("Order not found", 404);
    return apiSuccess(order);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Server error", 500);
  }
}
