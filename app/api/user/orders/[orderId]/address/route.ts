import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { requireAuth } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orderId } = await params;
    const body = await req.json();

    const { name, phone, phone2, line1, line2, city, state, pincode } = body;

    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return apiError("All required fields must be filled", 400);
    }
    if (!/^\d{10}$/.test(phone)) return apiError("Phone 1 must be 10 digits", 400);
    if (phone2 && !/^\d{10}$/.test(phone2)) return apiError("Phone 2 must be 10 digits", 400);
    if (!/^\d{6}$/.test(pincode)) return apiError("Pincode must be 6 digits", 400);

    await connectDB();

    const order = await Order.findOne({ _id: orderId, winner: user._id });
    if (!order) return apiError("Order not found", 404);

    order.shippingAddress = {
      name: name.trim(),
      phone: phone.trim(),
      phone2: phone2?.trim() || undefined,
      line1: line1.trim(),
      line2: line2?.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    await order.save();

    return apiSuccess({}, "Delivery address saved");
  } catch (err) {
    console.error("[address]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    return apiError("Internal server error", 500);
  }
}
