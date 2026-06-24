import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { trackShipment } from "@/lib/shiprocket";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { id } = await params;

    const order = await Order.findOne({ _id: id, winner: user._id }).lean();
    if (!order) return apiError("Order not found", 404);

    if (!order.shipmentId) {
      return apiSuccess({ shipped: false });
    }

    const trackingData = await trackShipment(order.shipmentId);
    return apiSuccess({ shipped: true, tracking_data: trackingData });
  } catch (err) {
    console.error("[orders/[id]/tracking GET]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
