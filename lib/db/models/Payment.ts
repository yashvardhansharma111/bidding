import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentDoc extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  auction: mongoose.Types.ObjectId;
  amount: number;
  method: "upi" | "card" | "netbanking" | "razorpay";
  status: "pending" | "processing" | "success" | "failed";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
}

const PaymentSchema = new Schema<IPaymentDoc>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["upi", "card", "netbanking", "razorpay"], required: true },
    status: { type: String, enum: ["pending", "processing", "success", "failed"], default: "pending" },
    transactionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    failureReason: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ user: 1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ status: 1 });

const Payment: Model<IPaymentDoc> =
  mongoose.models.Payment || mongoose.model<IPaymentDoc>("Payment", PaymentSchema);
export default Payment;
