import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { apiSuccess } from "@/lib/utils/api";
import type { OrderStatus } from "@/types";

interface ShiprocketWebhookBody {
  awb: string;
  current_status: string;
  shipment_id: number;
  order_id: string;
}

function mapStatus(shiprocketStatus: string): OrderStatus | null {
  switch (shiprocketStatus) {
    case "Delivered":
      return "delivered";
    case "Cancelled":
    case "RTO":
    case "Lost":
      return "cancelled";
    case "In Transit":
    case "Out For Delivery":
    case "Pickup Generated":
      return "shipped";
    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body: ShiprocketWebhookBody = await request.json();
    const { awb, current_status } = body;

    const newStatus = mapStatus(current_status);

    if (awb && newStatus) {
      await Order.findOneAndUpdate(
        { awbCode: awb },
        { status: newStatus }
      );
    }

    return apiSuccess({ received: true });
  } catch (err) {
    console.error("[webhooks/shiprocket POST]", err);
    // Always return 200 to Shiprocket so it doesn't retry
    return apiSuccess({ received: true });
  }
}
