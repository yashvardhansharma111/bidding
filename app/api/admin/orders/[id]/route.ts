import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Notification from "@/lib/db/models/Notification";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

const ALLOWED_STATUSES = ["paid", "cancelled"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: AllowedStatus };

    if (!ALLOWED_STATUSES.includes(status)) {
      return apiError(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`, 400);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate({ path: "winner", select: "name email phone" });

    if (!order) return apiError("Order not found", 404);

    // Send notification to winner
    const winnerId = typeof order.winner === "object" && "_id" in order.winner
      ? order.winner._id
      : order.winner;

    const notificationMessages: Record<AllowedStatus, { title: string; message: string }> = {
      paid: {
        title: "Payment Confirmed",
        message: "Your payment has been confirmed. Your order is being prepared for shipment.",
      },
      cancelled: {
        title: "Order Cancelled",
        message: "Your order has been cancelled. Please contact support if you have any questions.",
      },
    };

    await Notification.create({
      user: winnerId,
      type: "system",
      title: notificationMessages[status].title,
      message: notificationMessages[status].message,
    });

    return apiSuccess(order);
  } catch (err) {
    console.error("[admin/orders/[id] PATCH]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
