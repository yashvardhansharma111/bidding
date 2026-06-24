import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdrawalRequestDoc extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  upiId: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequestDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 100 },
    upiId: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote: { type: String },
  },
  { timestamps: true }
);

WithdrawalRequestSchema.index({ user: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1 });

const WithdrawalRequest: Model<IWithdrawalRequestDoc> =
  mongoose.models.WithdrawalRequest ||
  mongoose.model<IWithdrawalRequestDoc>("WithdrawalRequest", WithdrawalRequestSchema);

export default WithdrawalRequest;
