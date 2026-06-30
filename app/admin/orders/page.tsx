"use client";
import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Scale,
  RotateCcw,
} from "lucide-react";

interface AdminOrder {
  _id: string;
  status: string;
  finalAmount: number;
  totalAmount: number;
  deliveryCharges: number;
  createdAt: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  winner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  auction: {
    _id: string;
    title: string;
    brand: string;
    model: string;
    images: string[];
  };
  shippingAddress?: {
    name: string;
    phone: string;
    phone2?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface ShipFormValues {
  name: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  weight: string;
  length: string;
  breadth: string;
  height: string;
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  won: { label: "Won", color: "bg-yellow-100 text-yellow-800", icon: Package },
  pending_payment: { label: "Pending Payment", color: "bg-orange-100 text-orange-800", icon: Package },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Ship modal state
  const [shipModal, setShipModal] = useState<{ open: boolean; order: AdminOrder | null }>({ open: false, order: null });
  const [shipForm, setShipForm] = useState<ShipFormValues>({
    name: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
  });
  const [shipLoading, setShipLoading] = useState(false);
  const [shipError, setShipError] = useState("");

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleMarkPaid(orderId: string) {
    setActionLoading(orderId + "_paid");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      const json = await res.json();
      if (json.success) await fetchOrders();
    } finally {
      setActionLoading(null);
    }
  }

  function openShipModal(order: AdminOrder) {
    const sa = order.shippingAddress;
    setShipForm({
      name: sa?.name || order.winner?.name || "",
      phone: sa?.phone || order.winner?.phone || "",
      address: sa?.line1 || "",
      address2: sa?.line2 || "",
      city: sa?.city || "",
      state: sa?.state || "",
      pincode: sa?.pincode || "",
      weight: "",
      length: "",
      breadth: "",
      height: "",
    });
    setShipError("");
    setShipModal({ open: true, order });
  }

  function closeShipModal() {
    setShipModal({ open: false, order: null });
    setShipError("");
  }

  async function handleShipSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shipModal.order) return;
    setShipLoading(true);
    setShipError("");

    try {
      const res = await fetch(`/api/admin/orders/${shipModal.order._id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shipForm.name,
          phone: shipForm.phone,
          address: shipForm.address,
          address2: shipForm.address2 || undefined,
          city: shipForm.city,
          state: shipForm.state,
          pincode: shipForm.pincode,
          weight: parseFloat(shipForm.weight),
          length: parseFloat(shipForm.length),
          breadth: parseFloat(shipForm.breadth),
          height: parseFloat(shipForm.height),
        }),
      });
      const json = await res.json();
      if (json.success) {
        closeShipModal();
        await fetchOrders();
      } else {
        setShipError(json.error ?? "Failed to create shipment. Please try again.");
      }
    } catch {
      setShipError("Network error. Please try again.");
    } finally {
      setShipLoading(false);
    }
  }

  function handleFormChange(field: keyof ShipFormValues, value: string) {
    setShipForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage auction orders and shipments</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <RotateCcw size={15} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = STATUS_BADGE[order.status] ?? STATUS_BADGE.won;
            const Icon = config.icon;
            const isMarkingPaid = actionLoading === order._id + "_paid";

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Auction image */}
                  <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {order.auction?.images?.[0] ? (
                      <img
                        src={order.auction.images[0]}
                        alt={order.auction?.title ?? ""}
                        className="w-full h-full object-contain rounded-lg p-1"
                      />
                    ) : (
                      <Package size={22} className="text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {order.auction?.title ?? "—"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {order.auction?.brand} {order.auction?.model}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${config.color}`}
                      >
                        <Icon size={11} /> {config.label}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                    </div>

                    {/* Winner info */}
                    <div className="mt-1.5 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{order.winner?.name ?? "—"}</span>
                      {" — "}
                      {order.winner?.email ?? ""}
                      {order.winner?.phone ? ` · ${order.winner.phone}` : ""}
                    </div>

                    {/* Address status */}
                    {order.shippingAddress?.line1 ? (
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <MapPin size={10} />
                        <span>{order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</span>
                      </div>
                    ) : order.status === "paid" ? (
                      <div className="mt-1 text-xs text-orange-500 flex items-center gap-1">
                        <MapPin size={10} />
                        <span>Address not filled by customer</span>
                      </div>
                    ) : null}

                    {/* AWB info for shipped orders */}
                    {(order.status === "shipped" || order.status === "delivered") && order.awbCode && (
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                          <Truck size={11} />
                          {order.courierName} · AWB: {order.awbCode}
                        </div>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <MapPin size={11} /> Track
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Amount + actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start mt-2 sm:mt-0">
                    <p className="text-base font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>

                    {order.status === "paid" && (
                      <button
                        onClick={() => openShipModal(order)}
                        className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Truck size={13} /> Ship Now
                      </button>
                    )}

                    {order.status === "pending_payment" && (
                      <button
                        onClick={() => handleMarkPaid(order._id)}
                        disabled={isMarkingPaid}
                        className="flex items-center gap-1.5 border border-green-600 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                      >
                        {isMarkingPaid ? (
                          <span className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ship Modal */}
      {shipModal.open && shipModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Shipment</h2>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {shipModal.order.auction.title}
                </p>
              </div>
              <button
                onClick={closeShipModal}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleShipSubmit} className="p-5 space-y-4">
              {shipError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {shipError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shipForm.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={shipForm.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address Line 2 <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={shipForm.address2}
                  onChange={(e) => handleFormChange("address2", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipForm.city}
                    onChange={(e) => handleFormChange("city", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipForm.state}
                    onChange={(e) => handleFormChange("state", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{6}"
                    value={shipForm.pincode}
                    onChange={(e) => handleFormChange("pincode", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-3">
                  <Scale size={13} /> Package Dimensions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={shipForm.weight}
                      onChange={(e) => handleFormChange("weight", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Length (cm) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={shipForm.length}
                      onChange={(e) => handleFormChange("length", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Breadth (cm) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={shipForm.breadth}
                      onChange={(e) => handleFormChange("breadth", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={shipForm.height}
                      onChange={(e) => handleFormChange("height", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeShipModal}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shipLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {shipLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Truck size={15} /> Create Shipment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
