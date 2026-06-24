import { connectDB } from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Notification from "@/lib/db/models/Notification";
import { requireAdmin } from "@/lib/auth/getCurrentUser";
import { apiSuccess, apiError } from "@/lib/utils/api";
import {
  createShiprocketOrder,
  getServiceability,
  assignAWB,
  generateLabel,
} from "@/lib/shiprocket";

interface ShipBody {
  name: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  weight: number;
  length: number;
  breadth: number;
  height: number;
}

// Pickup pincode from env — set SHIPROCKET_PICKUP_PINCODE in your env vars
const PICKUP_PINCODE = process.env.SHIPROCKET_PICKUP_PINCODE ?? "110001";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body: ShipBody = await request.json();

    const order = await Order.findById(id)
      .populate({ path: "winner", select: "name email phone" })
      .populate({ path: "auction", select: "title brand model" });

    if (!order) return apiError("Order not found", 404);

    const winner = order.winner as unknown as {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    const auction = order.auction as unknown as {
      _id: string;
      title: string;
      brand: string;
      model: string;
    };

    const orderDate = new Date().toISOString().split("T")[0];

    // 1. Create Shiprocket order
    const srOrder = await createShiprocketOrder({
      orderId: `CB-${id}`,
      orderDate,
      customerName: body.name,
      customerPhone: body.phone,
      email: winner.email,
      address: body.address,
      address2: body.address2,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      items: [
        {
          name: auction.title,
          sku: String(auction._id).slice(-8).toUpperCase(),
          units: 1,
          price: order.finalAmount,
        },
      ],
      paymentMethod: "Prepaid",
      subTotal: order.finalAmount,
      weight: body.weight,
      length: body.length,
      breadth: body.breadth,
      height: body.height,
    });

    const shipmentId = srOrder.shipment_id;

    // 2. Get serviceability and pick best courier
    const serviceabilityData = await getServiceability(
      PICKUP_PINCODE,
      body.pincode,
      body.weight
    ) as {
      data?: {
        available_courier_companies?: { courier_company_id: number }[];
      };
    };

    const couriers = serviceabilityData?.data?.available_courier_companies ?? [];
    if (couriers.length === 0) {
      return apiError("No courier available for the delivery pincode", 422);
    }
    const courierId = couriers[0].courier_company_id;

    // 3. Assign AWB
    const awbData = await assignAWB(shipmentId, courierId);
    const awbCode: string = awbData?.response?.data?.awb_code ?? "";
    const courierName: string = awbData?.response?.data?.courier_name ?? "";

    // 4. Generate label
    const labelData = await generateLabel(shipmentId);
    const shippingLabel: string = labelData?.label_url ?? "";

    const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;

    // 5. Update order
    const updated = await Order.findByIdAndUpdate(
      id,
      {
        shiprocketOrderId: srOrder.order_id,
        shipmentId,
        awbCode,
        courierName,
        trackingUrl,
        shippingLabel,
        status: "shipped",
        shippingAddress: {
          name: body.name,
          phone: body.phone,
          line1: body.address,
          line2: body.address2,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
        },
      },
      { new: true }
    );

    // 6. Notify winner
    await Notification.create({
      user: winner._id,
      type: "system",
      title: "Your Order Has Been Shipped",
      message: `Your order has been shipped via ${courierName}. AWB: ${awbCode}`,
    });

    return apiSuccess(updated);
  } catch (err) {
    console.error("[admin/orders/[id]/ship POST]", err);
    if ((err as Error).message === "Unauthorized") return apiError("Unauthorized", 401);
    if ((err as Error).message === "Forbidden") return apiError("Forbidden", 403);
    return apiError("Internal server error", 500);
  }
}
