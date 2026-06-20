import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderDoc extends Document {
  auction: mongoose.Types.ObjectId;
  winner: mongoose.Types.ObjectId;
  finalAmount: number;
  deliveryCharges: number;
  totalAmount: number;
  status: "won" | "pending_payment" | "paid" | "shipped" | "delivered" | "cancelled";
  payment?: mongoose.Types.ObjectId;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    winner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    finalAmount: { type: Number, required: true },
    deliveryCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["won", "pending_payment", "paid", "shipped", "delivered", "cancelled"],
      default: "won",
    },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ winner: 1 });
OrderSchema.index({ auction: 1 });
OrderSchema.index({ status: 1 });

const Order: Model<IOrderDoc> =
  mongoose.models.Order || mongoose.model<IOrderDoc>("Order", OrderSchema);
export default Order;
