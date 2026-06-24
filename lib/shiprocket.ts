/**
 * Shiprocket API Client
 *
 * Required env vars:
 *   SHIPROCKET_EMAIL           — Shiprocket account email
 *   SHIPROCKET_PASSWORD        — Shiprocket account password
 *   SHIPROCKET_PICKUP_LOCATION — Pickup location name (default: "Primary")
 */

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// ---------------------------------------------------------------------------
// Token cache
// ---------------------------------------------------------------------------
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // epoch ms

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = data.token as string;
  tokenExpiresAt = now + 23 * 60 * 60 * 1000; // 23 hours
  return cachedToken;
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------
async function sr(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 403) throw new Error("Forbidden");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket ${path} failed: ${res.status} ${text}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------
export interface ShipmentInput {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  email: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; sku: string; units: number; price: number }[];
  paymentMethod: "Prepaid" | "COD";
  subTotal: number;
  weight: number;
  length: number;
  breadth: number;
  height: number;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export async function createShiprocketOrder(input: ShipmentInput): Promise<{
  order_id: number;
  shipment_id: number;
  [key: string]: unknown;
}> {
  const nameParts = input.customerName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const body = {
    order_id: input.orderId,
    order_date: input.orderDate,
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION ?? "Primary",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: input.address,
    billing_address_2: input.address2 ?? "",
    billing_city: input.city,
    billing_pincode: input.pincode,
    billing_state: input.state,
    billing_country: "India",
    billing_email: input.email,
    billing_phone: input.customerPhone,
    shipping_is_billing: true,
    order_items: input.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.units,
      selling_price: item.price,
    })),
    payment_method: input.paymentMethod,
    sub_total: input.subTotal,
    length: input.length,
    breadth: input.breadth,
    height: input.height,
    weight: input.weight,
  };

  const data = await sr("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return data as { order_id: number; shipment_id: number; [key: string]: unknown };
}

export async function getServiceability(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number
): Promise<unknown> {
  const params = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight: String(weight),
    cod: "0",
  });

  return sr(`/courier/serviceability/?${params.toString()}`);
}

export async function assignAWB(
  shipmentId: number,
  courierId: number
): Promise<{ response: { data: { awb_code: string; courier_name: string; [key: string]: unknown }; [key: string]: unknown }; [key: string]: unknown }> {
  const data = await sr("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
  });

  return data as {
    response: { data: { awb_code: string; courier_name: string; [key: string]: unknown }; [key: string]: unknown };
    [key: string]: unknown;
  };
}

export async function generateLabel(shipmentId: number): Promise<{ label_url?: string; [key: string]: unknown }> {
  const data = await sr("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });

  return data as { label_url?: string; [key: string]: unknown };
}

export async function trackShipment(shipmentId: number): Promise<unknown> {
  return sr(`/courier/track/shipment/${shipmentId}`);
}

export async function cancelShiprocketOrder(orderIds: (string | number)[]): Promise<unknown> {
  return sr("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: orderIds }),
  });
}
